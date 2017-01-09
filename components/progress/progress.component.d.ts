import { OnChanges, SimpleChanges } from '@angular/core';
import { NgProgressService } from "../../service/progress.service";
export declare class ProgressComponent implements OnChanges {
    private progress;
    /** Progress options  */
    ease: string;
    positionUsing: string;
    showSpinner: boolean;
    direction: string;
    color: any;
    thick: any;
    minimum: any;
    speed: any;
    trickleSpeed: any;
    /** Start/Stop Progressbar */
    toggle: any;
    constructor(progress: NgProgressService);
    ngOnChanges(changes: SimpleChanges): void;
}
