/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, ViewChild, Input, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Response } from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Api, ApiResources, ApiPreferences, Config } from '../apix.model';
import { ApixUtils } from '../apix.utils';
import { ApixApiService } from './apix-api.service';
import { ApixAuthService } from '../login/apix-auth.service';
import { ApixConfigService } from '../config/config.service';
import { config } from '../config/config';

@Component({
    selector: 'api-details',
    styleUrls: ['./api-detail.component.scss'],
    templateUrl: './api-detail.component.html',
})
export class ApiDetailComponent implements OnInit, OnDestroy {
    id: number;
    api: Api;
    overviewHtml: string = null;
    resources: ApiResources;
    preferences: ApiPreferences;
    swaggerPreferences: ApiPreferences;
    showPreferences: boolean = false;
    hidePreferenceSection: boolean = config.hidePreference;
    showDetail = false;
    tab: number = 1;

    loading: number = 0;
    errorMessage: string = '';
    infoMessage: string = '';
    reload: boolean = false;
    useHash: boolean = true;
    backUrl: string = '/apis';

    private subscription: any;
    private loginSubscription: any;
    private timer: any;

    base: string = config.base;
    path: string = config.path;
    localApiUrl: string = config.localApiUrl;
    remoteApiUrl: string = config.remoteApiUrl;
    remoteSampleExchangeUrl: string = config.remoteSampleExchangeUrl;

    constructor(private route: ActivatedRoute,
        private location: Location,
        private apixApiService: ApixApiService,
        private configService: ApixConfigService,
        private apixAuthService: ApixAuthService)
    {}

    ngOnInit() :void {
        this.subscription = this.route.params.subscribe(params => {
            this.id = +params['id'];
        });

        if (this.configService.isReady) {
            //console.log('config is ready');
            this.path = this.configService.getConfigValue("path");
            this.useHash = this.configService.getConfigValue("useHash");
            this.hidePreferenceSection = this.configService.getConfigValue("hidePreference");
            this.getApi(this.id);
        } else {
            let readySubscription = this.configService.ready.subscribe((ready: string) => {
                let myconfig = this.configService.getConfig();
                if (myconfig) {
                    this.setConfigValue(myconfig);
                    this.useHash = this.configService.getConfigValue("useHash");
                    this.apixApiService.setUrls(this.remoteApiUrl, this.localApiUrl, this.remoteSampleExchangeUrl);
                    this.getApi(this.id);
                }
                readySubscription.unsubscribe();
            });
        }
        if (this.path) {
            this.backUrl = '/' + this.path;
        }

        this.loginSubscription = this.apixAuthService.loginChanged.subscribe(
            (data: any) => {
                this.reload = data;
            }
        );

        let methodPath = this.route.snapshot.queryParams['path'];
        if (methodPath && !this.useHash) {
            this.location.replaceState("/apis/" + this.id + methodPath);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.loginSubscription.unsubscribe();
    }

    setHomePageTab() {
        localStorage.setItem(ApixUtils.APIS_TAB_KEY, 'apis');
    }

    private setConfigValue (value: any) {
        if (value.base)
            this.base = value.base;
        if (value.path)
            this.path = value.path;
        if (value.localApiUrl)
            this.localApiUrl = value.localApiUrl;
        if (value.remoteApiUrl)
            this.remoteApiUrl = value.remoteApiUrl;
        if (value.remoteSampleExchangeUrl)
            this.remoteSampleExchangeUrl = value.remoteSampleExchangeUrl;
        if (value.hidePreference)
            this.hidePreferenceSection = value.hidePreference;
    }

    private getApi(apiId: number) {
        var apis = JSON.parse(localStorage.getItem(ApixUtils.APIS_STORAGE_KEY));
        var result = [];
        if (apis) {
            result = apis.filter(api => api.id === apiId);
            if (result) {
                this.api = result[0];
                this.setSelectedApi();
            }
        } else {
            this.getLocalApi(apiId);
            if (!this.api) {
                this.getRemoteApi(apiId);
            }
        }
    }

    private getLocalApi(apiId: number) : any {
        this.loading++;
        this.apixApiService.getLocalApis().then(res => {
            this.loading--;
            var localApis = ApixUtils.formatLocalApis(res.apis);
            if (localApis) {
                var result = localApis.filter(api => api.id === apiId);
                if (result) {
                    this.api = result[0];
                    this.setSelectedApi();
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

    private getRemoteApi(apiId: number) {
        this.loading++;
        this.apixApiService.getRemoteApi(apiId).then(api => {
            this.loading--;
            this.api = ApixUtils.formatRemoteApi(api);
            this.setSelectedApi();
        }).catch(response => {
            this.loading--;
            if (response instanceof Response)
                this.errorMessage = response.text() ? response.text() : response.statusText;
            else
                this.errorMessage = response;
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
                    this.loading++;
                    this.apixApiService.getLatestRemoteApiIdForApiUid(this.api.api_uid).then(result => {
                        this.loading--;
                        let remoteId: number = +result[0].id;
                        this.loadResourcesForRemoteApi(remoteId);
                    }).catch(response => {
                        this.loading--;
                        if (response instanceof Response)
                            this.errorMessage = response.text() ? response.text() : response.statusText;
                        else
                            this.errorMessage = response;
                    });

                } else {
                    // response.data should have the id.  Might be null
                    console.log("No api_uid. fetch local resources.");
                    this.loadLocalResources();
                }
            }
            if (!this.hidePreferenceSection) {
                this.setSwaggerPreferences();
            }
        }
    }

    private setSwaggerPreferences() {
        if (this.api.type === "swagger") {
            // Load swagger's JSON definition to read the default "preferences"
            var value = localStorage.getItem(ApixUtils.SWAGGER_PREFERENCES_KEY + this.api.id);

            if (value) {
                //console.log('found preferences in cache');
                var preferences = JSON.parse(value);
                this.preferences = new ApiPreferences();
                this.preferences.host = preferences.host;
                this.preferences.basePath = preferences.basePath;
            } else {
                if (this.api.url) {
                    // fetch swagger.json
                    //console.log('fetch swagger.json to load preferences, ' + this.api.url);
                    this.loading++;
                    this.apixApiService.getJSONResponse(this.api.url, this.api.source).then(result => {
                        this.loading--;
                        this.preferences = new ApiPreferences();
                        this.preferences.host = result.host;
                        this.preferences.basePath = result.basePath;
                        localStorage.setItem(ApixUtils.SWAGGER_PREFERENCES_KEY + this.api.id, JSON.stringify(this.preferences));
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

    private loadLocalResources() {
        this.prepareApiResources(this.api.resources);
    }

    private loadResourcesForRemoteApi(apiId: number) {
        if (apiId) {
            console.log("fetching resources for api id=" + apiId );

            this.loading++;
            this.apixApiService.getRemoteApiResources(apiId).then(res => {
                this.loading--;
                this.prepareApiResources(res);
            }).catch(response => {
                this.loading--;
                if (response instanceof Response)
                    this.errorMessage = response.text() ? response.text() : response.statusText;
                else
                    this.errorMessage = response;
            });
        } else {
            console.log("skipping resource fetch, id is null.");
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
                webUrl: value.web_url,
                downloadUrl: value.download_url,
                categories: value.categories,
                tags: value.tags
            });
        }
    }

    private prepareApiResources (resources) {
        var emptyResult = {
            resources : {
            	sdks : [],
                docs : [],
                samples : []
            }
        };
        var result = Object.assign({}, emptyResult);

        if (this.api.type === "swagger") {
            result.resources.docs.push({
                title: 'Swagger/Open API specification download',
                downloadUrl: this.api.url
            });
        }

        if (resources) {
            var sdks = [];
            var docs = [];

            for (let resource of resources) {
                this.setArray("SDK", sdks, resource);
                this.setArray("DOC", docs, resource);
            }

            if (sdks.length || docs.length) {
                console.log("got " + sdks.length + " sdks, " + docs.length + " docs");
                if (sdks.length) {
                    result.resources.sdks = sdks;
                }
                if (docs.length) {
                    for (let doc of docs)
                        result.resources.docs.push(doc);
                }
            }
        }

        if (result) {
            var apiResources = result.resources;
            this.resources =  result.resources;

            var docList = null;
            if (apiResources) {
                docList = apiResources.docs;
            }
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
            if (this.resources && this.resources.sdks) {
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

            if (categories.length > 0) {
                // asynchronously fetch samples
                this.loading++;
                this.apixApiService.getSamples(categories).then(result => {
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
                            webUrl: sample.webUrl,
                            downloadUrl: sample.downloadUrl,
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
    }

    private loadOverviewHtml (overviewResource) {
        if (overviewResource) {
            // now we need to fetch the overview from the overviewResource.downloadUrl, merge it with the template
            // and set it as the overview body
            //console.log(overviewResource);
            this.loading++;
            this.apixApiService.getRemoteHTMLResponse(overviewResource.downloadUrl).then(result => {
                this.loading--;
                this.overviewHtml = result._body;
            }).catch(response => {
                this.loading--;
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
        this.swaggerPreferences = Object.assign({}, this.preferences);
        localStorage.setItem(ApixUtils.SWAGGER_PREFERENCES_KEY + this.api.id, JSON.stringify(this.preferences));
    };

    timeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.loading -= 1;
        }, 500);
    }

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