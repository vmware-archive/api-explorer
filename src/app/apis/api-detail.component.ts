/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, ViewChild, Input, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';

import { Api } from '../model/api';
import { ApiResources } from '../model/apiResources';
import { ApiPreferences } from '../model/apiPreferences';

import { AppUtils } from '../app.utils';
import { UserService } from "../services/user.service";
import { AppService } from '../app.service';

@Component({
    selector: 'api-details',
    styleUrls: ['./api-detail.component.scss'],
    templateUrl: './api-detail.component.html',
})
export class ApiDetailComponent implements OnInit, OnDestroy {
    id: number;
    path: string;
    api: Api;
    overviewHtml: string = '';
    resources: ApiResources;
    preferences: ApiPreferences;
    swaggerPreferences: ApiPreferences;
    showPreferences: boolean = false;

    loading: number = 0;
    tab: number = 1;

    errorMessage: string = '';
    infoMessage: string = '';

    private sub: any;
    private timer: any;

    constructor(private route: ActivatedRoute,
        private location: Location,
        private appService: AppService
    ) {}

    ngOnInit() :void {
        this.path = this.route.snapshot.queryParams['path'];
        if (this.path) {
            this.location.replaceState(window.location.pathname + this.path);
        }
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id'];
            this.getApi();
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    setHomePageTab() {
        localStorage.setItem(AppUtils.APIS_TAB_KEY, 'apis');
    }

    private getApi() {
        var apis = JSON.parse(localStorage.getItem(AppUtils.APIS_STORAGE_KEY));
        var result = [];
        if (apis) {
            result = apis.filter(api => api.id === this.id);
            if (result) {
                this.api = result[0];
                this.setSelectedApi();
            }
        } else {
            // FIXME
            var localApis = this.getLocalApis();
            result = localApis.filter(api => api.id === this.id);
            if (result) {
                this.api = result[0];
                this.setSelectedApi();
            }
            else
                this.getRemoteApi();
        }
    }

    private getLocalApis() : any {
        this.loading++;
        this.appService.getLocalApis().then(res => {
            this.loading--;
            var results = AppUtils.formatLocalApis(res.apis);
            localStorage.setItem(AppUtils.APIS_STORAGE_KEY, JSON.stringify(results));
            return results;
        }).catch(response => {
            this.loading--;
            if (response instanceof Response)
                this.errorMessage = response.text() ? response.text() : response.statusText;
            else
                this.errorMessage = response;
        });
    }

    private getRemoteApi() {
        this.loading++;

        this.route.params
            .switchMap((params: Params) => this.appService.getRemoteApi(+params['id']))
            .subscribe(
                api => {
                    this.loading--;
                    this.api =  new Api();
                    this.api.id = api.id;
                    this.api.name = api.name;
                    this.api.version = api.version;
                    this.api.description = api.description;
                    this.api.api_uid = api.api_uid;
                    //this.api_ref_doc_artifact_id = api.api_ref_doc_artifact_id;
                    if (api.tags) {
                        var type = api.tags.find(i => i.category === 'display').name;
                        // Clean the type
                        if (type == "iframe-documentation" || (api.api_ref_doc_url && api.api_ref_doc_url.endsWith(".html"))) {
                            type = "html";
                        }
                        this.api.type = type;
                    }
                    this.api.url = AppUtils.fixVMwareDownloadUrl(api.api_ref_doc_url);
                    this.setSelectedApi();
            },
            (response) => {
                this.loading--;
                this.errorMessage = response.text() || response.statusText;
            });
    }

    private setSelectedApi (){
        // if the hash contains a query arg, this is used for a URL to a particular method.  In this case forcibly set
        // the active tab to the API reference.
        if (window.location.hash && window.location.hash.includes("?")) {
            console.log("hash contains query arg, forcing API reference tab active.");
            this.tab = 2;
        }

        if (this.api) {
            // Get selected API resources.  There are two cases, a remote API, and then a local API that
            // specifies an api_uid string.  In the case of a local API, we use the UID to get the latest
            // instance of the remote API and then get the resources for it.
            if (this.api.url && this.api.source == 'remote') {
                console.log("fetching remote resources for remote api");
                this.loadResourcesForRemoteApi(this.api.id);
            } else if (this.api.url && this.api.source == 'local') {
                if (this.api.api_uid) {
                    console.log("fetching remote resources for local api_uid=" + this.api.api_uid);
                    /*
                    this.appService.getLatestRemoteApiIdForApiUid(this.api.api_uid).then(function (response) {
                        // response.data should have the id.  Might be null
                        this.loadResourcesForRemoteApi(response.data);
                    }).finally(function () {
                    }); */
                } else {
                    // response.data should have the id.  Might be null
                    console.log("No api_uid. synchronizing local resources.");
                    this.loadResourcesForRemoteApi(null);
                }
            }

            if (this.api.type === "swagger") {
                // Load swagger's JSON definition to read the default "preferences"
                var value = localStorage.getItem(AppUtils.SWAGGER_PREFERENCES_KEY + this.api.id);

                if (value) {
                    console.log('found preferences in cache');
                    var preferences = JSON.parse(value);
                    this.preferences = new ApiPreferences();
                    this.preferences.host = preferences.host;
                    this.preferences.basePath = preferences.basePath;
                    this.swaggerPreferences = Object.assign({}, this.preferences);
                } else {
                    if (this.api.url) {
                        // fetch swagger.json
                        console.log('fetch swagger.json to load preferences, ' + this.api.url);
                        this.loading++;
                        this.appService.getJSONResponse(this.api.url).then(result => {
                            this.loading--;
                            this.preferences = new ApiPreferences();
                            this.preferences.host = result.host;
                            this.preferences.basePath = result.basePath;
                            this.swaggerPreferences = Object.assign({}, this.preferences);
                            localStorage.setItem(AppUtils.SWAGGER_PREFERENCES_KEY + this.api.id, JSON.stringify(this.preferences));
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
    }

    private loadResourcesForRemoteApi(apiId: number) {
        var emptyResult = {
            resources : {
            	sdks : [],
                docs : []
            }
        };
        var result = Object.assign({}, emptyResult);

        if (apiId) {
            console.log("fetching resources for api id=" + apiId );
            this.loading += 1;
            this.appService.getRemoteApiResources(apiId).then(res => {
                this.loading -= 1;
                var sdks = [];
                var docs = [];
                for (let resource of res) {
                    this.setArray("SDK", sdks, resource);
                    this.setArray("DOC", docs, resource);
                }
                if (sdks.length || docs.length) {
                    console.log("got " + sdks.length + " sdks, " + docs.length + " docs");
                    if (sdks.length) {
                         result.resources.sdks = sdks;
                    }
                    if (docs.length) {
                        result.resources.docs = docs;
                    }
                }
                this.prepareApiResources(result);
            }).catch(response => {
                this.loading -= 1;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });
        } else {
            console.log("skipping resource fetch, id is null.");
            this.prepareApiResources(null);
        }
    }

    private setArray (resourceType, arr, value) {
        if (value.resource_type == resourceType) {

            // make the title of the item included a version if there was one provided
            // and the name doesn't already end with the version string
            var title = value.name;
            if (value.version && !title.endsWith(value.version)) {
                title = title + " " + value.version;
            }

            arr.push({
                title: title,
                version: value.version,
                webUrl: AppUtils.fixVMwareDownloadUrl(value.web_url),
                downloadUrl: AppUtils.fixVMwareDownloadUrl(value.download_url),
                categories: value.categories,
                tags: value.tags
            });
        }
    }

    private prepareApiResources (remoteResources) {
        // if there are no remote resources, then simply create an empty container
        if (! remoteResources ) {
            console.log("No remote resources to merge.");
            remoteResources = {docs:[],sdks:[]};
        }

        var resources = remoteResources.resources;
        this.resources =  remoteResources.resources;
        var docList = resources.docs;
        var overviewResource = null;

        if (docList) {
            // find the overview resource if it exists and remove it from the resources
            for (var i = docList.length - 1; i >= 0; --i) {
                var resource = docList[i];
                if (resource.categories && (resource.categories.length > 0) && (resource.categories[0] == 'API_OVERVIEW')) {
                    console.log("Removing API_OVERVIEW from resource list.");
                    overviewResource = resource;
                    docList.splice(i, 1);
                }
            }
            if (docList.length == 0) {
                this.resources.docs = null;
            }
        }
        this.loadOverviewHtml(overviewResource);

        // categories are the values that we are going to pass to the sample search service
        // to search for matching samples.
        var categories = "";

        // include the UID of this API in the sample search as a platform value.
        if (this.api.api_uid) {
            categories = this.api.api_uid;
        }
        if (this.api.name) {
            if (categories.length == 0) {
                categories = this.api.name;
            } else {
                categories += "," + this.api.name;
            }
        }
        // Use any category value from any SDK that was included
        // in the list of SDKs.
        if (this.resources.sdks) {
            var idx = 0;
            for (let sdk of this.resources.sdks) {
                var category = sdk.categories[0];
                if (categories.length == 0) {
                    categories = category;
                } else {
                    categories += "," + category;
                }
                idx++;
            }
        }
        if (categories) {
            // asynchronously fetch samples
            this.loading++;
            this.appService.getSamples(categories).then(result => {
                this.loading--;
                var samples = [];
                for (let sample of result) {
                    var tags = [];
                    if (sample.tags) {
                        for (let tag of sample.tags) {
                            tags.push(tag.name);
                        }
                    }
                    samples.push({
                        title: sample.name,
                        platform: categories,
                        webUrl: AppUtils.fixVMwareDownloadUrl(sample.webUrl),
                        downloadUrl: AppUtils.fixVMwareDownloadUrl(sample.downloadUrl),
                        contributor: sample.author.communitiesUser,
                        createdDate: sample.created,
                        lastUpdated: sample.lastUpdated,
                        tags: tags,
                        snippet: sample.readmeHtml,
                        favoriteCount: sample.favoriteCount
                    });
                }
                this.resources.samples = samples;
            }).catch(response => {
                this.loading--;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });

        }
    }

    private loadOverviewHtml (overviewResource) {
        if (overviewResource) {
            // now we need to fetch the overview from the overviewResource.downloadUrl, merge it with the template
            // and set it as the overview body
            //console.log(overviewResource);
            this.loading += 1;
            this.appService.getHTMLResponse(overviewResource.downloadUrl).then(result => {
                this.loading -= 1;
                this.overviewHtml = result._body;
            }).catch(response => {
                this.loading -= 1;
                this.overviewHtml = null;
                this.tab = 2;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });
        } else {
            this.overviewHtml = null;
            //this.tab = 2;
        }
    }

    // Updates the API preferences
    updatePreferences (type){
        this.loading += 1;
        this.swaggerPreferences = Object.assign({}, this.preferences);
        localStorage.setItem(AppUtils.SWAGGER_PREFERENCES_KEY + this.api.id, JSON.stringify(this.preferences));

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.loading -= 1;
        }, 500);

    };

    // Toggles the detail view preferences
    togglePreferences () {
       this.showPreferences = !this.showPreferences;
    };

    // Sets the active tab
    setActiveTab (newTab) {
        this.tab = newTab;
    }

    // Checks if a tab is active
    isTabActive (tabNum) {
        return this.tab === tabNum;
    }

    // SDK tag filter
    filterTag (tag) {
    	return (tag.category === 'platform' || tag.category === 'programming-language');
    }
}