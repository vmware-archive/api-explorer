import { Directive, OnDestroy, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[iframe-resizer]'
})

export class IFrameResizerDirective implements OnDestroy {
    @Input('iframe-resizer') sourceName: string;

    constructor(private el: ElementRef) { }


    @HostListener('window:message', ['$event'])

    onMessage(event: any) {
        if ('undefined' !== typeof event.data &&
            'undefined' !== typeof event.data.type &&
             event.data.type === 'resize' &&
            'undefined' !== typeof event.data.source &&
             event.data.source === this.sourceName) {
                this.resizeIframe(event.data);

        }
    }

    resizeIframe(data) {
       if ('undefined' !== typeof data.value && 'undefined' !== typeof data.value.height) {
           if (this.el.nativeElement.clientHeight !== Number(data.value.height)) {
               this.el.nativeElement.style.height = data.value.height + 'px';
           }
       }
    }

    ngOnDestroy() {
        // TODO: destroy @HostListener watcher?
    }


}
