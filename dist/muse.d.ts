/// <reference types="web-bluetooth" />
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
    AccelerometerData,
    EEGReading,
    EventMarker,
    GyroscopeData,
    MuseControlResponse,
    MuseDeviceInfo,
    PPGReading,
    TelemetryData,
    XYZ,
} from './lib/muse-interfaces';
export { zipSamples, EEGSample, PPGSample, zipPPG } from './lib/zip-samples';
export {
    EEGReading,
    PPGReading,
    TelemetryData,
    AccelerometerData,
    GyroscopeData,
    XYZ,
    MuseControlResponse,
    MuseDeviceInfo,
};
export declare const channelNames: string[];
export declare class MuseClient {
    enableAux: boolean;
    deviceName: string | null;
    connectionStatus: BehaviorSubject<boolean>;
    rawControlData: Observable<string>;
    controlResponses: Observable<MuseControlResponse>;
    telemetryData: Observable<TelemetryData>;
    gyroscopeData: Observable<GyroscopeData>;
    accelerometerData: Observable<AccelerometerData>;
    eegReadings: Observable<EEGReading>;
    ppgReadings: Observable<PPGReading>;
    eventMarkers: Subject<EventMarker>;
    private gatt;
    private controlChar;
    private eegCharacteristics;
    private ppgCharacteristics;
    private lastIndex;
    private lastTimestamp;
    private getTimestamp;
    connect(gatt?: BluetoothRemoteGATTServer): Promise<void>;
    sendCommand(cmd: string): Promise<void>;
    setPreset(preset?: string): Promise<void>;
    start(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    deviceInfo(): Promise<MuseDeviceInfo>;
    injectMarker(value: string | number, timestamp?: number): Promise<void>;
    disconnect(): void;
}
