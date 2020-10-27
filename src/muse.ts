import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, first, map, share, take } from 'rxjs/operators';

import {
    AccelerometerData,
    EEGReading,
    EventMarker,
    GyroscopeData,
    MuseControlResponse,
    MuseDeviceInfo,
    TelemetryData,
    XYZ,
} from './lib/muse-interfaces';
import {
    decodeEEGSamples,
    decodePPGSamples,
    parseAccelerometer,
    parseControl,
    parseGyroscope,
    parseTelemetry,
} from './lib/muse-parse';
import { decodeResponse, encodeCommand, observableCharacteristic } from './lib/muse-utils';

export { zipSamples, EEGSample } from './lib/zip-samples';
export { EEGReading, TelemetryData, AccelerometerData, GyroscopeData, XYZ, MuseControlResponse, MuseDeviceInfo };
import * as c from './lib/constants';

// These names match the characteristics defined in EEG_CHARACTERISTICS above
export const channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX', 'PPG1', 'PPG2', 'PPG3'];

export class MuseClient {
    enableAux = false;
    deviceName: string | null = '';
    connectionStatus = new BehaviorSubject<boolean>(false);
    rawControlData: Observable<string>;
    controlResponses: Observable<MuseControlResponse>;
    telemetryData: Observable<TelemetryData>;
    gyroscopeData: Observable<GyroscopeData>;
    accelerometerData: Observable<AccelerometerData>;
    eegReadings: Observable<EEGReading>;
    ppgReadings: Observable<unknown>;
    eventMarkers: Subject<EventMarker>;

    private gatt: BluetoothRemoteGATTServer | null = null;
    private controlChar: BluetoothRemoteGATTCharacteristic;
    private eegCharacteristics: BluetoothRemoteGATTCharacteristic[];
    private ppgCharacteristics: BluetoothRemoteGATTCharacteristic[];

    private lastIndex: number | null = null;
    private lastTimestamp: number | null = null;

    async connect(gatt?: BluetoothRemoteGATTServer) {
        if (gatt) {
            this.gatt = gatt;
        } else {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [c.MUSE_SERVICE] }],
            });
            this.gatt = await device.gatt!.connect();
        }
        this.deviceName = this.gatt.device.name || null;

        const service = await this.gatt.getPrimaryService(c.MUSE_SERVICE);
        fromEvent(this.gatt.device, 'gattserverdisconnected')
            .pipe(first())
            .subscribe(() => {
                this.gatt = null;
                this.connectionStatus.next(false);
            });

        // Control
        this.controlChar = await service.getCharacteristic(c.CONTROL_CHARACTERISTIC);
        this.rawControlData = (await observableCharacteristic(this.controlChar)).pipe(
            map((data) => decodeResponse(new Uint8Array(data.buffer))),
            share(),
        );
        this.controlResponses = parseControl(this.rawControlData);

        // Battery
        const telemetryCharacteristic = await service.getCharacteristic(c.TELEMETRY_CHARACTERISTIC);
        this.telemetryData = (await observableCharacteristic(telemetryCharacteristic)).pipe(map(parseTelemetry));

        // Gyroscope
        const gyroscopeCharacteristic = await service.getCharacteristic(c.GYROSCOPE_CHARACTERISTIC);
        this.gyroscopeData = (await observableCharacteristic(gyroscopeCharacteristic)).pipe(map(parseGyroscope));

        // Accelerometer
        const accelerometerCharacteristic = await service.getCharacteristic(c.ACCELEROMETER_CHARACTERISTIC);
        this.accelerometerData = (await observableCharacteristic(accelerometerCharacteristic)).pipe(
            map(parseAccelerometer),
        );

        this.eventMarkers = new Subject();

        // EEG
        this.eegCharacteristics = [];
        const eegObservables = [];
        const channelCount = this.enableAux ? c.EEG_CHARACTERISTICS.length : 4;
        for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
            const characteristicId = c.EEG_CHARACTERISTICS[channelIndex];
            const eegChar = await service.getCharacteristic(characteristicId);
            eegObservables.push(
                (await observableCharacteristic(eegChar)).pipe(
                    map((data) => {
                        const eventIndex = data.getUint16(0);
                        return {
                            electrode: channelIndex,
                            index: eventIndex,
                            samples: decodeEEGSamples(new Uint8Array(data.buffer).subarray(2)),
                            timestamp: this.getTimestamp(eventIndex, c.EEG_FREQUENCY, c.EEG_SAMPLES_PER_READING),
                        };
                    }),
                ),
            );
            this.eegCharacteristics.push(eegChar);
        }
        this.eegReadings = merge(...eegObservables);

        // TODO: check for muse2 and museS
        // PPG
        this.ppgCharacteristics = [];
        const ppgObservables = [];
        const ppgCount = c.PPG_CHARACTERISTICS.length;
        for (let channelIndex = 0; channelIndex < ppgCount; channelIndex++) {
            const charId = c.PPG_CHARACTERISTICS[channelIndex];
            const ppgChar = await service.getCharacteristic(charId);
            ppgObservables.push(
                (await observableCharacteristic(ppgChar)).pipe(
                    map((data) => {
                        const eventIndex = data.getUint16(0);
                        return {
                            index: eventIndex,
                            ppg_channel: channelIndex,
                            // TODO: start from 2 index??
                            samples: decodePPGSamples(new Uint8Array(data.buffer).subarray(2)),
                            timestamp: this.getTimestamp(eventIndex, c.PPG_FREQUENCY, c.PPG_SAMPLES_PER_READING),
                        };
                    }),
                ),
            );
            this.ppgCharacteristics.push(ppgChar);
        }
        this.ppgReadings = merge(...ppgObservables);
        this.connectionStatus.next(true);
    }

    async sendCommand(cmd: string) {
        await this.controlChar.writeValue(encodeCommand(cmd));
    }

    async start() {
        await this.pause();
        // const preset = this.enableAux ? 'p20' : 'p21';
        const preset = 'p21'; // TODO: ?
        await this.controlChar.writeValue(encodeCommand(preset));
        await this.controlChar.writeValue(encodeCommand('s'));
        await this.resume();
    }

    async pause() {
        await this.sendCommand('h');
    }

    async resume() {
        await this.sendCommand('d');
    }

    async deviceInfo() {
        const resultListener = this.controlResponses
            .pipe(
                filter((r) => !!r.fw),
                take(1),
            )
            .toPromise();
        await this.sendCommand('v1');
        return resultListener as Promise<MuseDeviceInfo>;
    }

    async injectMarker(value: string | number, timestamp: number = new Date().getTime()) {
        await this.eventMarkers.next({ value, timestamp });
    }

    disconnect() {
        if (this.gatt) {
            this.lastIndex = null;
            this.lastTimestamp = null;
            this.gatt.disconnect();
            this.connectionStatus.next(false);
        }
    }

    private getTimestamp(eventIndex: number, samplingRate: number, nSamples: number) {
        const delta = 1000 * (1.0 / samplingRate) * nSamples;

        if (this.lastIndex === null || this.lastTimestamp === null) {
            this.lastIndex = eventIndex;
            this.lastTimestamp = new Date().getTime() - delta;
        }

        // Handle wrap around
        while (this.lastIndex - eventIndex > 0x1000) {
            eventIndex += 0x10000;
        }

        if (eventIndex === this.lastIndex) {
            return this.lastTimestamp;
        }

        if (eventIndex > this.lastIndex) {
            this.lastTimestamp += delta * (eventIndex - this.lastIndex);
            this.lastIndex = eventIndex;
            return this.lastTimestamp;
        } else {
            return this.lastTimestamp - delta * (this.lastIndex - eventIndex);
        }
    }
}
