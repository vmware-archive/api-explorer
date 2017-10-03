/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { State } from 'clarity-angular';

import { Api } from '../model/api';
import { ArraySortPipe } from '../pipes/sort.pipe';
import { OrderByPipe } from '../pipes/orderBy.pipe';
import { AppUtils } from '../app.utils';
import { UserService } from "../services/user.service";
import { AppService } from '../app.service';

import { APP_TITLE } from '../app.config';
import { API_LIST_HEADER_TEXT } from '../app.config';

@Component({
    styleUrls: ['./api-list.component.scss'],
    templateUrl: './api-list.component.html',
})
export class ApiListComponent implements OnInit {
    apis: any[] = [];
    filteredApis: any[] = [];
    products: any[] = [];
    languages: any[] = [];
    types: any[] = [];
    sources: any[] = [];

    filters = {
        keywords : "",
        products : [],
        languages: [],
        types: [],
        sources: []
    };

    apiListHeaderText = '';
    hideFilters: boolean = AppUtils.isHideFilters();
    hideProductFilter: boolean = AppUtils.isHideProductFilter();
    hideLanguageFilter: boolean = AppUtils.isHideLanguageFilter();
    hideSourcesFilter: boolean = AppUtils.isHideSourceFilter();

    initDefaultFilters: boolean = false;
    overviewHtml: string = '';
    tab: number = 1;
    hideLeftNav: boolean = false;

    selectedApi;
    //opened: boolean = false;
    //childOpen: boolean = false;
    loading: number = 0;
    errorMessage: string = '';
    infoMessage: string = '';

    tableState: State;

    private STORAGE_KEY = 'api-filter';

    constructor(private router: Router,
            private route: ActivatedRoute,
            private userService: UserService,
            private appService: AppService
    ) {}

    ngOnInit(): void {}

    refresh(state: State) {
        this.tableState = state;
        //let params = this.appService.buildQueryParams(state);
        this.getApis();
    }

    private getApis(): void {
        if (AppUtils.enableLocal() == true && AppUtils.enableRemote() == true) {
            this.loading++;
            Promise.all([
                this.appService.getRemoteApis(),
                this.appService.getLocalApis()
            ]).then(values => {
                this.loading--;
                var results: any[];
                var localOverviewPath = null;
                if (values[0])
                    results = this.formatRemoteApis(values[0]);
                if (values[1]) {
                    results = results.concat(this.formatLocalApis(values[1].apis));
                    localOverviewPath = values[1].overview;
                }
                this.setApis(results);
                this.setFilteredApis();
                this.loadAPIGroupOverview(localOverviewPath);
            }).catch (error => {
                this.loading--;
                this.errorMessage = error.text() || error.statusText;
            });
        } else if (AppUtils.enableLocal() == false && AppUtils.enableRemote() == true) {
            this.loading++;
            this.appService.getRemoteApis().then(result => {
                this.loading--;
                this.setApis(result);
                this.setFilteredApis();
            }).catch(response => {
                this.loading--;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });
        } else if (AppUtils.enableLocal() == true && AppUtils.enableRemote() == false) {
            this.loading++;
            this.appService.getLocalApis().then(result => {
                this.loading--;
                this.setApis(result);
                this.setFilteredApis();
            }).catch(response => {
                this.loading--;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });

        }
    }

    private formatLocalApis(apis: any[]): any[] {
        var result: any[] = [];
        if (apis) {
            for (var i=0; i<apis.length; i++) {
                var api = apis[i];
                api.id = 10000 + i;
                api.source = "local";
                if (!api.type || 0 === api.type.length) {
                    if (api.url && api.url.endsWith(".json")) {
                        api.type = "swagger";
                    } else if (api.url && api.url.endsWith(".raml")) {
                        api.type = "raml";
                    } else {
                        api.type = "html";
                    }
                }
                // create a display string to be used in the list view
                api.productDisplayString = AppUtils.createDisplayStringForProducts(api.products);

                // remove version numbers from the products on the api for filter purposes
                api.products = AppUtils.createProductListNoVersions(api.products);

                // tags
                var languages = [];
                if (api.tags && api.tags.length > 0) {
                    for (let tag of api.tags) {
                        if (tag.category === 'programming-language') {
                            languages.push(tag.name);
                        }
                    }
                }
                api.languages = languages;

                var apiUrl = "#!/apis/" + api.id;

                // Add api details to search content
                //api.methods = AppUtils.createMethodsForProduct(value.type, value.url, apiUrl);

                result.push(api);
            }
        }
        return result;
    }

    private formatRemoteApis(apis: any[]): any[] {
        var result: any[] = [];
        if (apis) {
            for (let api of apis) {
                var source = "remote";
                var type = "swagger";
                var products = [];
                var languages = [];
                var apiGroup = "";

                if (api.tags && api.tags.length > 0) {
                    for (let tag of api.tags) {
                        if (tag.category === 'display') {
                            type = tag.name;
                        } else if (tag.category === 'api-group') {
                            apiGroup = tag.name;
                        } else if (tag.category === 'product') {
                            products.push(tag.name);
                            //this.pushUnique(result.filters.products, tag.name.replace(";", " "));
                            //this.pushUnique(products, tag.name); //.replace(";", " "));
                        } else if (tag.category === 'programming-language') {
                            languages.push(tag.name);
                        }
                    }
                }

                // Clean the type
                if (type == "iframe-documentation" || (api.api_ref_doc_url && api.api_ref_doc_url.endsWith(".html"))) {
                    type = "html";
                }

                result.push({
                    id: parseInt(api.id, 10),
                    name: api.name,
                    version: api.version,
                    api_uid: api.api_uid,
                    description: api.description,
                    url: AppUtils.fixVMwareDownloadUrl(api.api_ref_doc_url),
                    type: type,
                    products: AppUtils.createProductListNoVersions(products),
                    productDisplayString: AppUtils.createDisplayStringForProducts(products),
                    languages: languages,
                    source: source,
                    apiGroup: apiGroup
                });

            }
        }
        return result;
    }

    /**
     * Private Functions - set the apis for the default products.
     */
    private setApis(response) : void {
        console.log()
        var emptyResult = {
    		apis : [],
            filters : {
            	products : [],
            	languages : [],
                types : [],
                sources : []
            }
        };

        var result = Object.assign({}, emptyResult);
        for (let api of response) {
            this.pushUnique(result.filters.products, api.products);
            this.pushUnique(result.filters.languages, api.languages);
            this.pushUnique(result.filters.types, [api.type]);
            this.pushUnique(result.filters.sources, [api.source]);
            result.apis.push(api);
        }

        this.products = result.filters.products;
    	this.languages = result.filters.languages;
        this.types = result.filters.types;
        this.sources = result.filters.sources;
        this.apis = result.apis;
    }

    private setDefaultFilters(): void {
        if (this.initDefaultFilters) {
            this.initDefaultFilters = false;
        }
        if (AppUtils.getDefaultKeywordsFilter()) {
            this.filters.keywords = AppUtils.getDefaultKeywordsFilter();
        }

        if (AppUtils.getDefaultProductsFilter()) {
            for (let product of AppUtils.getDefaultProductsFilter()) {
                this.filters.products.push(product);
            }
        }

        if (AppUtils.getDefautLanguagesFilter()) {
            for (let lan of AppUtils.getDefautLanguagesFilter()) {
                this.filters.languages.push(lan);
            }
        }

        if (AppUtils.getDefaultTypesFilter()) {
            for (let type of AppUtils.getDefaultTypesFilter()) {
                this.filters.types.push(type);
            }
        }

        if (AppUtils.getDefaultSourcesFilter()) {
            for (let source of AppUtils.getDefaultSourcesFilter()) {
                this.filters.sources.push(source);
            }
        }
    }

    private setFilteredApis(): void {
        // check to see if we need to set default filters.  only done once.
        this.setDefaultFilters();
        var apis = [];

        for (let api of this.apis) {
            var add = true;

            // Process product filter
            if (add && this.filters.products.length) {
                if (api.products && api.products.length) {
                    for (let product of api.products) {

                        if (this.filters.products.indexOf(product) === -1) {
                            add = false;
                        } else {
                            add = true;
                            break;
                        }
                    }
                } else {
                    add = false;
                }
            }

            // Process languages filter
            if (add && this.filters.languages.length) {
                if (api.languages && api.languages.length) {
                    for (var y=0; y<api.languages.length; y++) {
                        var language = api.languages[y];
                        if (this.filters.languages.indexOf(language) === -1) {
                            add = false;
                        } else {
                            add = true;
                            break;
                        }
                    }
                } else {
                    add = false;
                }
            }

            // Process types filter
            if (add && api.type == "internal") {
                add = false;
            }
            if (add && this.filters.types.length && this.filters.types.indexOf(api.type) === -1) {
                add = false;
            }

            // Process sources filter
            if (add && this.filters.sources.length && this.filters.sources.indexOf(api.source) === -1) {
                add = false;
            }

            if (add) {
                apis.push(api);
            }
        }

        // Persist the current filters
        //localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.filters));

        this.filteredApis = apis; //apis.filter(this.filters.keywords);
    }

    private pushUnique(arr, vals) {
        for (let val of vals) {
            if (!_.includes(arr, val)) {
                arr.push(val);
            }
        }
    }

    /**
     * Private Function - load the API group overview text for the default product in the config.js.
     */
    private loadAPIGroupOverview(localOverviewPath: string) : void {
        var useLocal = false;

        if (localOverviewPath && typeof localOverviewPath !== 'undefined') {
            useLocal = true;
            console.log("load API group overview from local");
            this.loading++;
            this.appService.getHTMLResponse(localOverviewPath).then(result => {
                this.loading--;
                this.overviewHtml = result._body;
                //console.log(this.overviewHtml);
            }).catch(response => {
                this.loading--;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });
        }

        if( !useLocal) {
            console.log("load API group overview from remote");
            //this.loadRemoteAPIGroupOverview();
        }

    }

    // When any "checkbox" field has changed
    toggleFilterSelection (value, filter) {
        var idx = filter.indexOf(value);
        if (idx > -1) {
            filter.splice(idx, 1);
        } else {
            filter.push(value);
        }

        // Force filtering the APIs
        this.setFilteredApis();
    }


    // Sets the active tab
    setActiveTab (newTab) {
        this.tab = newTab;
    }

    // Checks if a tab is active
    isActiveTab (tabNum) {
        return this.tab === tabNum;
    }

    toggleFilterDisplay () {
        console.log('togle');
        this.hideLeftNav = !this.hideLeftNav;
    }

    /*
    openChildModal(api) {
        this.selectedApi = api;
        this.childOpen = true;
    }*/

    //showChild(api) {
        //api.showChild = true;
        /*if (!api.childApp) {
            this.clearMessage();
            this.appService.getApi(api.childId).then(child => {
                api.childApp = child;
            }).catch(response => this.errorMessage = response.text() || response.statusText)
        }*/
    //}

    /*hideChild(api) {
      api.showChild = false;
    }

    goToChild(id) {
        this.router.navigate(['/app-preview', id]);
    }
*/
    private clearMessage() {
        this.errorMessage = this.infoMessage = '';
    }

}
