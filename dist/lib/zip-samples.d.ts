import { Observable } from 'rxjs';
import { EEGReading, PPGReading } from './muse-interfaces';
export interface EEGSample {
    index: number;
    timestamp: number;
    data: number[];
}
export interface PPGSample extends EEGSample {
    data: number[];
}
export declare function zipSamples(eegReadings: Observable<EEGReading>): Observable<EEGSample>;
export declare function zipPPG(ppgReadings: Observable<PPGReading>): Observable<PPGSample>;
