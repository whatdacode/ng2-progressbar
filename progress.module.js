import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from "./components/progress-bar/progress-bar.component";
import { ProgressComponent } from "./components/progress/progress.component";
import { NgProgressService } from './service/progress.service';
export var NgProgressModule = (function () {
    function NgProgressModule() {
    }
    NgProgressModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        ProgressComponent,
                        ProgressBarComponent
                    ],
                    providers: [
                        NgProgressService
                    ],
                    exports: [
                        ProgressComponent
                    ]
                },] },
    ];
    /** @nocollapse */
    NgProgressModule.ctorParameters = [];
    return NgProgressModule;
}());
export { NgProgressService, ProgressComponent };
//# sourceMappingURL=progress.module.js.map