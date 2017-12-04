/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Directive, ElementRef, HostListener, HostBinding, OnInit, Renderer } from '@angular/core';

@Directive({
    selector: '[iframe-resize]'
})

export class IFrameResizerDirective implements OnInit  {
    private el: any;
    private renderer: Renderer;
    private prevHeight: number;
    private sameCount: number;

    constructor(_elementRef: ElementRef, _renderer: Renderer) {
        this.el = _elementRef.nativeElement;
        this.renderer = _renderer;
    }

    ngOnInit() {
        this.setHeight();
    }

    private setHeight() {
        const self = this;

        this.renderer.setElementStyle(
            self.el,
            "height",
            (window.screen.height*0.75) + "px"
        );
        setTimeout(() => {
            self.setHeight();
        }, 50);
    }

}