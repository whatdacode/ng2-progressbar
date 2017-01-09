import { Subject } from "rxjs/Subject";
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/delay';
export declare class NgProgressService {
    minimum: number;
    speed: number;
    trickleSpeed: number;
    progress: number;
    /** Progress state */
    state$: Subject<any>;
    /** Trickling stream */
    trickling$: Subject<any>;
    constructor();
    /** Start */
    start(): void;
    /** Complete */
    done(): void;
    /** Set progress state */
    set(n: any): void;
    /** Increment Progress */
    inc(amount?: any): void;
    /** Is progress started*/
    isStarted(): boolean;
    /** Helper */
    clamp: (n: any, min: any, max: any) => any;
    /** Update Progressbar State */
    updateState(value: any, active: any): void;
}
