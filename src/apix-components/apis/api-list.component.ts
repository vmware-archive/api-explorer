/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { Api } from '../apix.model';
import { ArraySortPipe } from '../pipes/sort.pipe';
import { OrderByPipe } from '../pipes/orderBy.pipe';
import { ApixUtils } from '../apix.utils';
import { ApixApiService } from '../apix-api.service';

import { config } from '../apix.config';

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

    @Input() baseRoute: string = config.baseRoute;
    @Input() localApiUrl: string = config.localApiUrl;
    @Input() remoteApiUrl: string = config.remoteApiUrl;
    @Input() remoteSampleExchangeUrl: string = config.remoteSampleExchangeUrl;
    @Input() hideFilters: boolean = config.hideFilters;
    @Input() apiListHeaderText: string = config.apiListHeaderText;
    @Input() hideProductFilter: boolean = config.hideProductFilter;
    @Input() hideLanguageFilter: boolean = config.hideLanguageFilter;
    @Input() hideSourcesFilter: boolean = config.hideSourceFilter;
    @Input() defaultProductsFilter: any[] = config.defaultProductsFilter;
    @Input() defaultLanguagesFilter: any[] = config.defaultLanguagesFilter;
    @Input() defaultSourcesFilter: any[] = config.defaultSourcesFilter;
    @Input() defaultKeywordsFilter: string = config.defaultKeywordsFilter;
    @Input() enableLocal: boolean = config.enableLocal;
    @Input() enableRemote: boolean = config.enableRemote;

    initDefaultFilters: boolean = false;

    overviewHtml: string = '';
    tab: number = 1;
    hideLeftNav: boolean = false;

    selectedApiId: string = null;
    loading: number = 0;
    errorMessage: string = '';
    infoMessage: string = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private apixApiService: ApixApiService
    ) {}

    ngOnInit(): void {
        /* Read form cache

        var apis = localStorage.getItem(ApixUtils.APIS_STORAGE_KEY);
        var products = localStorage.getItem(ApixUtils.PRODUCTS_STORAGE_KEY);
        var languages = localStorage.getItem(ApixUtils.LANGUAGES_STORAGE_KEY);
        var sources = localStorage.getItem(ApixUtils.SOURCES_STORAGE_KEY);
        var overviewHtmlPath = localStorage.getItem(ApixUtils.OVERVIEW_PATH_STORAGE_KEY);

        //console.log(this.apis);
        if (apis == null || products == null || languages == null || sources == null || overviewHtmlPath == null) {
            console.log('call service');
            this.getApis();
        } else {
            console.log('from cache');
            this.apis = JSON.parse(apis);
            this.products = JSON.parse(products);
            this.languages = JSON.parse(languages);
            this.sources = JSON.parse(sources);
        }
        console.log(this.apis);
        this.setFilteredApis();
        this.loadAPIGroupOverview(overviewHtmlPath);
        */
        this.apixApiService.setEnvironment(this.baseRoute, this.remoteApiUrl, this.localApiUrl, this.remoteSampleExchangeUrl);
        this.getApis();
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
        this.setApis(results);
        this.setFilteredApis();
        this.loadAPIGroupOverview(overviewPath);
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
                    api.url = this.baseRoute + api.url;
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
                    url: ApixUtils.fixVMwareDownloadUrl(api.api_ref_doc_url),
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

        // save to the cache
        /*
        localStorage.setItem(ApixUtils.PRODUCTS_STORAGE_KEY, JSON.stringify(this.products));
        localStorage.setItem(ApixUtils.LANGUAGES_STORAGE_KEY, JSON.stringify(this.languages));
        localStorage.setItem(ApixUtils.SOURCES_STORAGE_KEY, JSON.stringify(this.sources));
        */
        localStorage.setItem(ApixUtils.APIS_STORAGE_KEY, JSON.stringify(this.apis));
    }

    private setDefaultFilters(): void {
        if (this.initDefaultFilters) {
            this.initDefaultFilters = false;
        }
        if (this.defaultKeywordsFilter) {
            this.filters.keywords = this.defaultKeywordsFilter;
        }

        if (this.defaultProductsFilter) {
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
        localStorage.setItem("filters", JSON.stringify(this.filters));

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
            console.log("load API group overview from local, " + localOverviewPath);
            this.loading++;
            this.apixApiService.getHTMLResponse(localOverviewPath).then(result => {
                this.loading--;
                this.overviewHtml = result._body;
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
            this.loadRemoteAPIGroupOverview();
        }

    }

    private loadRemoteAPIGroupOverview() {
        if (this.filters.products && this.filters.products.length > 0) {
            var apiGroup = this.filters.products[0];
            //console.log(apiGroup);
            var overviewApiId = null;
            if (apiGroup) {
                var result: any[] = this.apis.filter(api => api.type == 'internal' && api.apiGroup == apiGroup.replace(" ", "-").toLowerCase());
                if (result && result.length > 0) {
                    overviewApiId = parseInt(result[0].id, 10);
                    console.log("id=" + overviewApiId);
                }

                if (overviewApiId) {
                    this.loading++;
                    this.apixApiService.getRemoteApiResources(overviewApiId).then(result => {
                        this.loading--;
                        var docList = result.resources.docs;
                        var overviewResource = null;
                        if (docList) {
                            for (var i = docList.length - 1; i >= 0; --i) {
                                var resource = docList[i];
                                if (resource.categories && (resource.categories.length > 0) && (resource.categories[0] == 'API_OVERVIEW')) {
                                    overviewResource = resource;
                                    docList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        if (overviewResource) {
                            this.loading++;
                            this.apixApiService.getHTMLResponse(overviewResource.downloadUrl).then(result => {
                                this.loading--;
                                this.overviewHtml = result._body;
                            }).catch(response => {
                                this.loading--;
                                if (response instanceof Response)
                                    this.errorMessage = response.text() ? response.text() : response.statusText;
                                else
                                    this.errorMessage = response;
                            });
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
     * @returns {Array}
     */
    private createMethodsForProduct(type, _apiRefDocUrl, _apiUrl) : string[] {
        var methods = [];
        // Add methods for Swagger APIs
        if(type === 'swagger') {
            //FIXME use a cache for these files for performance.  there is other code that fetchs the swagger.json as well and we need to do this ONCE.
            if (_apiRefDocUrl) {
                // fetch swagger.json
                this.loading++;
                this.apixApiService.getJSONResponse(_apiRefDocUrl).then(result => {
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
