import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';

import { ClarityModule } from 'clarity-angular';
import { SelectModule } from 'ng-select';
import { PopoverModule } from 'ng2-pop-over';

import { AppComponent } from './app.component';
import { ROUTING } from "./app.routing";
import { ApiListComponent } from "./apis/api-list.component";
import { ApiDetailComponent } from "./apis/api-detail.component";
import { LocalIframeComponent } from "./apis/local-iframe.component";
import { LoginComponent } from './login/login.component';
import { AppUtils } from './app.utils';
import { ArraySortPipe } from './pipes/sort.pipe';
import { OrderByPipe } from './pipes/orderBy.pipe';
import { FilterTagPipe } from './pipes/filterTag.pipe';
import { SafePipe } from './pipes/safe.pipe';

import { AppService } from './app.service';
import { UserService } from './services/user.service';
import { LoginCheck } from './login/login.check';

//import { PermissionCheck } from './services/permission.check';
import { PublisherHttp } from './services/publisher.http';

import { environment } from '../environments/environment';

//import { jqxDateTimeInputComponent } from '../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxdatetimeinput';
//import { SelectSearchPipe } from './pipes/select-serach.pipe';
//import { StateFilter } from './filter/stateFilter';
//import { MyDateRangePickerModule } from '../../node_modules/mydaterangepicker';
//import { DateRangeFilter } from './filter/dateRangeFilter';

export function getPublisherHttp(xhrBackend: XHRBackend, requestOptions: RequestOptions, injector: Injector) {
    return new PublisherHttp(xhrBackend, requestOptions, injector);
}


@NgModule({
    declarations: [
        AppComponent,
        ApiListComponent,
        ApiDetailComponent,
        LocalIframeComponent,
        LoginComponent,
        ArraySortPipe,
        OrderByPipe,
        SafePipe,
        FilterTagPipe

        //jqxDateTimeInputComponent, DropdownPage, SelectSearchPipe, StateFilter, DateRangeFilter, ScrollDirective,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ClarityModule.forRoot(),
        ROUTING,
        SelectModule,
        PopoverModule

    ],
    providers: [
        {
            provide: Http,
            useFactory: getPublisherHttp,
            deps: [XHRBackend, RequestOptions, Injector]
        },

        AppService, UserService, LoginCheck, AppService],
    bootstrap: [AppComponent]
})

export class AppModule {
}
