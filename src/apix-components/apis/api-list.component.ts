/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Response } from '@angular/http';

import { Api, Config } from '../apix.model';
import { ArraySortPipe } from '../pipes/sort.pipe';
import { OrderByPipe } from '../pipes/orderBy.pipe';
import { ApixUtils } from '../apix.utils';
import { ApixApiService } from './apix-api.service';
import { ApixConfigService } from '../config/config.service';
import { config } from '../config/config';

@Component({
    selector: "api-list",
    styleUrls: ['./api-list.component.scss'],
    templateUrl: './api-list.component.html',
})
export class ApiListComponent implements OnInit {
    private SLASH_RE = new RegExp('[/ ]+', 'g');
    private CURLY_REMOVE_RE = new RegExp('[{}]+', 'g');
    private SWAGGER_PATH_DASH_RE = new RegExp('-', 'i');
    private SWAGGER_PATH_WS_RE = new RegExp('[ \t]', 'i');
    private SWAGGER_PATH_SLASH_RE = new RegExp('/', 'i');
    private NOT_ALNUM_RE = new RegExp('[^A-Za-z0-9]+', 'i');

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

    title: string = null;
    base: string = config.base;
    path: string = config.path;
    localApiUrl: string = config.localApiUrl;
    remoteApiUrl: string = config.remoteApiUrl;
    remoteSampleExchangeUrl: string = config.remoteSampleExchangeUrl;
    hideFilters: boolean = config.hideFilters;
    apiListHeaderText: string = config.apiListHeaderText;
    hideProductsFilter: boolean = config.hideProductsFilter;
    hideLanguagesFilter: boolean = config.hideLanguagesFilter;
    hideSourcesFilter: boolean = config.hideSourcesFilter;
    defaultProductsFilter: any[] = config.defaultProductsFilter;
    defaultLanguagesFilter: any[] = config.defaultLanguagesFilter;
    defaultSourcesFilter: any[] = config.defaultSourcesFilter;
    defaultKeywordsFilter: string = config.defaultKeywordsFilter;
    enableLocal: boolean = config.enableLocal;
    enableRemote: boolean = config.enableRemote;

    initDefaultFilters: boolean = false;
    overviewHtml: string = '';
    tab: number = 1;
    hideLeftNav: boolean = false;
    selectedApiId: string = null;
    apixPath: string = '/apis';

    loading: number = 0;
    errorMessage: string = '';
    infoMessage: string = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private apixApiService: ApixApiService,
        private configService: ApixConfigService
    ) {}

    ngOnInit(): void {
        if (this.configService.isReady) {
            this.configApix();
            this.getApis();
        } else {
            let readySubscription = this.configService.ready.subscribe((ready: string) => {
                this.configApix();
                this.getApis();
                readySubscription.unsubscribe();
            });
        }

        if (localStorage.getItem(ApixUtils.APIS_TAB_KEY) == 'apis') {
            this.setActiveTab(2);
            localStorage.removeItem(ApixUtils.APIS_TAB_KEY);
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
        this.hideLeftNav = !this.hideLeftNav;
    }

    keywordsChanged () {
        // force the keywords to lower case so that search is always case independent
        this.filters.keywords = this.filters.keywords.toLowerCase();

        // Force filtering the APIs
        this.setFilteredApis();
    }

    showMethod () {
        if (this.filters.keywords == null || this.filters.keywords == '' || this.filters.keywords == 'undefined')
            return false;
        return true;
    }

    private configApix() {
        let myconfig = this.configService.getConfig();
        //console.log(myconfig);
        if (myconfig) {
            this.setConfigValue(myconfig);
            this.apixApiService.setUrls(this.remoteApiUrl, this.localApiUrl, this.remoteSampleExchangeUrl);

            if (this.path) {
                this.apixPath = '/' + this.path + '/apis';
            }
        }
        // Load cached filters
        let filtersFromCache = sessionStorage.getItem("filters");
        if (filtersFromCache) {
            this.filters = JSON.parse(filtersFromCache);
            this.setFilteredApis();
        } else {
            // there are no cached filters, so we need to set the default filter
            // values after we load for the first time.
            this.initDefaultFilters = true;
            this.setDefaultFilters();
        }
    }

    private setConfigValue (value: any) {
        if (value.hasOwnProperty('base'))
            this.base = value.base;
        if (value.hasOwnProperty('path'))
            this.path = value.path;

        if (value.hasOwnProperty('title'))
            this.title = value.title;
        if (value.hasOwnProperty('localApiUrl'))
            this.localApiUrl = value.localApiUrl;
        if (value.hasOwnProperty('remoteApiUrl'))
            this.remoteApiUrl = value.remoteApiUrl;
        if (value.hasOwnProperty('remoteSampleExchangeUrl'))
            this.remoteSampleExchangeUrl = value.remoteSampleExchangeUrl;
        if (value.hasOwnProperty('defaultFilters')) {
            this.defaultProductsFilter = value.defaultFilters.products;
            this.defaultLanguagesFilter = value.defaultFilters.languages;
            this.defaultSourcesFilter = value.defaultFilters.sources;
        }

        if (value.hasOwnProperty('hideFilters'))
            this.hideFilters = value.hideFilters;
        if (value.hasOwnProperty('apiListHeaderText'))
            this.apiListHeaderText = value.apiListHeaderText;
        if (value.hasOwnProperty('hideProductsFilter'))
            this.hideProductsFilter = value.hideProductsFilter;
        if (value.hasOwnProperty('hideLanguagesFilter'))
            this.hideLanguagesFilter = value.hideLanguagesFilter;
        if (value.hasOwnProperty('hideSourcesFilter'))
            this.hideSourcesFilter = value.hideSourcesFilter;
        if (value.hasOwnProperty('enableLocal'))
            this.enableLocal = value.enableLocal;
        if(value.hasOwnProperty('enableRemote'))
            this.enableRemote = value.enableRemote;
    }

    private getApis(): void {
        if (this.enableLocal == true && this.enableRemote == true) {
            this.loading++;
            Promise.all([
                this.apixApiService.getRemoteApis(),
                this.apixApiService.getLocalApis()
            ]).then(values => {
                this.loading--;
                var results: any[];
                var localOverviewPath = null;

                if (values[0])
                    results = this.formatRemoteApis(values[0]);

                if (values[1]) {
                    results = results.concat(this.formatLocalApis(values[1].apis));
                    localOverviewPath = values[1].overview;
                    if (localOverviewPath && typeof localOverviewPath !== 'undefined')
                        localStorage.setItem(ApixUtils.OVERVIEW_PATH_STORAGE_KEY, localOverviewPath);
                }

                this.handleResponse(results, localOverviewPath);
             }).catch (error => {
                this.loading--;
                this.handleError(error);
                //this.errorMessage = error.text() || error.statusText;
            });
        } else if (this.enableLocal == false && this.enableRemote == true) {
            this.loading++;
            this.apixApiService.getRemoteApis().then(res => {
                this.loading--;
                var results: any[] = this.formatRemoteApis(res);
                this.handleResponse(results, null);
            }).catch(error => {
                this.loading--;
                this.handleError(error);
            });
        } else if (this.enableLocal == true && this.enableRemote == false) {
            this.loading++;
            this.apixApiService.getLocalApis().then(res => {
                this.loading--;
                var results: any[] = this.formatLocalApis(res.apis);
                this.handleResponse(results, res.overview);
            }).catch(error => {
                this.loading--;
                this.handleError(error);
            });
        }
    }

    private handleResponse(results: any[], overviewPath: string) {
        var useLocal = false;

        if (overviewPath && typeof overviewPath !== 'undefined') {
            useLocal = true;
            console.log("load API group overview from local, " + overviewPath);
            this.loading++;
            this.apixApiService.getHTMLResponse(overviewPath, 'local').then(result => {
                this.loading--;
                this.overviewHtml = result._body;
                this.setApis(results);
                this.setFilteredApis();
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
            this.loadRemoteAPIGroupOverview(results);
        }
    }

    private handleError(response: any) {
        if (response instanceof Response)
            this.errorMessage = response.text() ? response.text() : response.statusText;
        else
            this.errorMessage = response;
        console.log(this.errorMessage);
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
                api.productDisplayString = ApixUtils.createDisplayStringForProducts(api.products);

                // remove version numbers from the products on the api for filter purposes
                api.products = ApixUtils.createProductListNoVersions(api.products);

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

                // set api.url from app base
                if (!api.url.startsWith("http")) {
                    api.url = this.base + api.url;
                }

                var apiUrl = "/apis/" + api.id;

                // Add api details to search content
                api.methods = this.createMethodsForProduct(api.type, api.url, apiUrl);
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
                    url: api.api_ref_doc_url,
                    type: type,
                    products: ApixUtils.createProductListNoVersions(products),
                    productDisplayString: ApixUtils.createDisplayStringForProducts(products),
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
            this.pushUnique(result.filters.sources, [api.source]);
            result.apis.push(api);
        }

        this.products = result.filters.products;
    	this.languages = result.filters.languages;
        this.sources = result.filters.sources;
        this.apis = result.apis;
        localStorage.setItem(ApixUtils.APIS_STORAGE_KEY, JSON.stringify(this.apis));
    }

    private setDefaultFilters(): void {
        if (this.initDefaultFilters) {
            this.initDefaultFilters = false;

            if (this.defaultKeywordsFilter) {
                this.filters.keywords = this.defaultKeywordsFilter;
            }

            if (this.defaultProductsFilter && this.defaultProductsFilter.length > 0) {
                for (let product of this.defaultProductsFilter) {
                    this.filters.products.push(product);
                }
            }

            if (this.defaultLanguagesFilter) {
                for (let lan of this.defaultLanguagesFilter) {
                    this.filters.languages.push(lan);
                }
            }

            if (this.defaultSourcesFilter) {
                for (let source of this.defaultSourcesFilter) {
                    this.filters.sources.push(source);
                }
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

            // Process sources filter
            if (add && this.filters.sources.length && this.filters.sources.indexOf(api.source) === -1) {
                add = false;
            }

            if (add)
                apis.push(api);
        }

        // Persist the current filters
        sessionStorage.setItem("filters", JSON.stringify(this.filters));
        this.filteredApis = this.filterByKeywords(apis);
    }

    private filterByKeywords (apis: any) {
        if (this.filters.keywords == null || this.filters.keywords == '' || this.filters.keywords == 'undefined')
            return apis;
        else {
            var result = [];
            for (let api of apis) {
                if (JSON.stringify(api).toLowerCase().indexOf(this.filters.keywords.toLowerCase()) > -1) {
                    if (api.source === 'local' && api.type === 'swagger') {
                        api.methods = api.methods.filter(method => JSON.stringify(method).indexOf(this.filters.keywords) > -1);
                    }
                    result.push(api);
                }
            }
            return result;
        }
    }

    private pushUnique(arr, vals) {
        for (let val of vals) {
            //if (!_.includes(arr, val)) {
            if (arr.indexOf(val) === -1) {
                arr.push(val);
            }
        }
    }

    private loadRemoteAPIGroupOverview(formattedApis: any[]) {
        // copy apis
        let apis: any[] = [];
        for (let api of formattedApis) {
            apis.push(api);
        }
        if (this.filters.products && this.filters.products.length > 0) {
            var apiGroup = this.filters.products[0];
            var overviewApiId = null;
            if (apiGroup) {
                var result: any[] = apis.filter(api => api.type == 'internal' && api.apiGroup == apiGroup.replace(" ", "-").toLowerCase());
                if (result && result.length > 0) {
                    overviewApiId = parseInt(result[0].id, 10);
                }

                if (overviewApiId) {
                    this.loading++;
                    this.apixApiService.getRemoteApiResources(overviewApiId).then(result => {
                        this.loading--;
                        var overviewResource = null;
                        for (let resource of result) {
                            if (resource.resource_type && resource.resource_type == 'DOC' && resource.categories && (resource.categories.length > 0) && (resource.categories[0] == 'API_OVERVIEW')) {
                                overviewResource = resource.download_url;
                                break;
                            }
                        }

                        if (overviewResource) {
                            this.loading++;
                            this.apixApiService.getHTMLResponse(overviewResource, 'remote').then(result => {
                                this.loading--;
                                this.overviewHtml = result._body;
                                this.setApis(formattedApis);
                                this.setFilteredApis();
                            }).catch(response => {
                                this.loading--;
                                if (response instanceof Response)
                                    this.errorMessage = response.text() ? response.text() : response.statusText;
                                else
                                    this.errorMessage = response;
                            });
                        } else {
                            this.setApis(formattedApis);
                            this.setFilteredApis();
                        }
                    }).catch(response => {
                        this.loading--;
                        if (response instanceof Response)
                            this.errorMessage = response.text() ? response.text() : response.statusText;
                        else
                            this.errorMessage = response;
                    });
                } else {
                    this.setApis(formattedApis);
                    this.setFilteredApis();
                }
            } else {
                this.setApis(formattedApis);
                this.setFilteredApis();
            }
        } else {
            this.setApis(formattedApis);
            this.setFilteredApis();
        }
    }

    /**
     * create a swagger operation id from the method path such as /endpoints/types/extensions/{id}
     * to get_endpoints_types_extensions_id
     */
    private swagger_path_to_operationId(httpMethod, swaggerOperationPath): string {
        if (!swaggerOperationPath) {
            return "";
        }
        var pathOperationId = swaggerOperationPath;
        pathOperationId = pathOperationId.replace(this.CURLY_REMOVE_RE,'');
        pathOperationId = pathOperationId.replace(this.SLASH_RE,'_');
        return httpMethod + pathOperationId;
    }

    /**
     *  make sure operation id is valid in case user messed it up
     *  @param operationId
     */
    private swagger_fix_operationId (operationId) : string {
        if (!operationId) {
            return "";
        }
        operationId = operationId.trim();
        operationId = operationId.replace(this.NOT_ALNUM_RE,'_');
        return operationId;
    }

    // Swagger pattern: it puts the tag at the beginning of the method, and then puts '45' for dashes, '47' for slashes
    // and '32' for spaces, which appears to be the decimal for the ASCII char value, odd.  I guess this is their
    // own sort of URL encoding, albeit really stange.
    // TODO improve this algorithm to handle other characters as well.
    private createUrlForSwaggerMethod (apiUrl, methodType, methodPath, tag, operationId) : string {
        var tagOperationId = null;
        if (tag) {
            tagOperationId = tag.replace(this.SWAGGER_PATH_DASH_RE, '45');
            tagOperationId = tagOperationId.replace(this.SWAGGER_PATH_WS_RE, '32');
            tagOperationId = tagOperationId.replace(this.SWAGGER_PATH_SLASH_RE, '47');
        }

		if (!operationId || operationId == "undefined") {
            operationId = this.swagger_path_to_operationId(methodType, methodPath);
        } else {
            operationId = this.swagger_fix_operationId(operationId);
        }

        var url = '#!/';
        if (tagOperationId) {
            url = url + tagOperationId + '/';
        }
        url = url + operationId;
        return url;
    }

    /**
     *
     * @param type type of the ref doc, e.g. "swagger", "raml", "iframe"
     * @param _apiRefDocUrl  the URL to the API reference doc, e.g. http://0.0.0.0:9000/local/swagger/someApi.json
     * @param _apiUrl the user visible URL to the API itself including the API id, e.g. http://0.0.0.0:9000/#!/apis/10001
     *
     */
    private createMethodsForProduct(type, _apiRefDocUrl, _apiUrl) : string[] {
        var methods = [];
        // Add methods for Swagger APIs
        if(type === 'swagger') {
            //FIXME use a cache for these files for performance.  there is other code that fetchs the swagger.json as well and we need to do this ONCE.
            if (_apiRefDocUrl) {
                // fetch swagger.json
                this.loading++;
                this.apixApiService.getJSONResponse(_apiRefDocUrl, 'local').then(result => {
                    this.loading--;
                    var name = result.info.title;
                    var version = result.info.version;

                    for (var k in result.paths) {
                        var v = result.paths[k];

                        for (var m in v) {
                            var tag = null;
                            var tagList = v[m].tags;
                            if (tagList && tagList.length > 0) {
                                tag = tagList[0];
                            }
                            var operationId = v[m].operationId; // may be null

                            var methodUrl = this.createUrlForSwaggerMethod(_apiUrl, m, k, tag, operationId);

                            // Add filter columns here in the json object if needed
                            methods.push({  "http_method": m,
                                            "path": k,
                                            "name": name,
                                            "url" : methodUrl,
                                            "version": version,
                                            "summary": v[m].summary,
                                            "description": v[m].description,
                                            "deprecated": v[m].deprecated
                            });

                            break;
                        }
                    }
                }).catch(response => {
                    this.loading--;
                    if (response instanceof Response)
                        this.errorMessage = response.text() ? response.text() : response.statusText;
                    else
                        this.errorMessage = response;
                });
            }
        }

        return methods;
    }

    private clearMessage() {
        this.errorMessage = this.infoMessage = '';
    }

}
