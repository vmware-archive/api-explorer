import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ROUTING} from "./apix.demo.routing";
import {ClarityModule} from "clarity-angular";
import {ApixDemo} from "./apix.demo";
import {FormsModule} from "@angular/forms";
import {ApixComponentsModule} from "../../apix-components/apix-components.module";


@NgModule({
    imports: [
        CommonModule,
        ClarityModule,
        ROUTING,
        FormsModule,
        ApixComponentsModule.forChild()
    ],
    declarations: [
        ApixDemo,
    ],
    exports: [
        ApixDemo,
    ]
})
export default class ApixDemoModule {
}