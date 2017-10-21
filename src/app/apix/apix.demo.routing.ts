import {ModuleWithProviders} from "@angular/core/src/metadata/ng_module";
import {Routes, RouterModule} from "@angular/router";
import {ApixDemo} from "./apix.demo";

const ROUTES: Routes = [
    {
        path: "",
        component: ApixDemo,
    }
];

export const ROUTING: ModuleWithProviders = RouterModule.forChild(ROUTES);