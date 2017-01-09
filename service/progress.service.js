import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/delay';
export var NgProgressService = (function () {
    function NgProgressService() {
        var _this = this;
        this.minimum = 0;
        this.speed = 200;
        this.trickleSpeed = 300;
        this.progress = 0;
        /** Helper */
        this.clamp = function (n, min, max) {
            if (n < min)
                return min;
            if (n > max)
                return max;
            return n;
        };
        this.state$ = new Subject();
        this.trickling$ = new Subject();
        /** while progress is started keep emitting values */
        this.trickling$.switchMap(function (res) {
            return Observable
                .timer(0, _this.trickleSpeed)
                .takeWhile(function () { return _this.isStarted(); })
                .do(function () { return _this.inc(res); });
        }).subscribe();
    }
    /** Start */
    NgProgressService.prototype.start = function () {
        if (!this.isStarted())
            this.set(0);
        this.trickling$.next();
    };
    /** Complete */
    NgProgressService.prototype.done = function () {
        /** if it hasn't already started don't complete the progress */
        if (!this.isStarted())
            return;
        this.set(.3 + .5 * Math.random());
        this.set(1);
    };
    /** Set progress state */
    NgProgressService.prototype.set = function (n) {
        var _this = this;
        this.progress = this.clamp(n, this.minimum, 1);
        this.updateState(this.progress, true);
        /** if progress completed */
        if (n === 1) {
            /** complete then hide progressbar */
            Observable.of(n)
                .delay(this.speed)
                .do(function () {
                _this.updateState(_this.progress, false);
            })
                .delay(this.speed)
                .do(function () {
                /** reset progress */
                _this.progress = 0;
                _this.updateState(_this.progress, false);
            }).subscribe();
        }
    };
    /** Increment Progress */
    NgProgressService.prototype.inc = function (amount) {
        var n = this.progress;
        /** if it hasn't start, start */
        if (!this.isStarted())
            this.start();
        else {
            if (typeof amount !== 'number') {
                if (n >= 0 && n < 0.2)
                    amount = 0.1;
                else if (n >= 0.2 && n < 0.5)
                    amount = 0.04;
                else if (n >= 0.5 && n < 0.8)
                    amount = 0.02;
                else if (n >= 0.8 && n < 0.99)
                    amount = 0.005;
                else
                    amount = 0;
            }
            n = this.clamp(n + amount, 0, 0.994);
            this.set(n);
        }
    };
    /** Is progress started*/
    NgProgressService.prototype.isStarted = function () {
        return this.progress && this.progress < 1;
    };
    /** Update Progressbar State */
    NgProgressService.prototype.updateState = function (value, active) {
        var state = {
            value: value,
            active: active
        };
        this.state$.next(state);
    };
    NgProgressService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NgProgressService.ctorParameters = [];
    return NgProgressService;
}());
//# sourceMappingURL=progress.service.js.map