/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { OnInit } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable()
export class AppUtils {
  private SLASH_RE = new RegExp('[/ ]+', 'g');
  private CURLY_REMOVE_RE = new RegExp('[{}]+', 'g');
  private SWAGGER_PATH_DASH_RE = new RegExp('-', 'i');
  private SWAGGER_PATH_WS_RE = new RegExp('[ \t]', 'i');
  private SWAGGER_PATH_SLASH_RE = new RegExp('/', 'i');
  private NOT_ALNUM_RE = new RegExp('[^A-Za-z0-9]+', 'i');

  private isInternalNetwork0: boolean = false;

  constructor(
    private http: Http,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.checkNetwork();
  }

  // test if browser can access internal network
  checkNetwork() {
    let testUrl = 'https://mp-prod-app-vip.vmware.com';
    this.http.head(testUrl)
            .toPromise()
            .then(response => {
                // if call successful then can access internal network
                this.isInternalNetwork0 = true;
                console.log("internal network");
            }).catch(response => response);
  }

  public static getRemoteApiUrl(): string {
    return environment.remoteApiUrl;
  }

  public static getLocalApiUrl(): string {
    return environment.localApiUrl;
  }

  public static getRemoteSampleExchangeApiUrl(): string {
    return environment.remoteSampleExchangeUrl;
  }

  public static getDefaultKeywordsFilter(): string {
    return environment.defaultKeywordsFilter;
  }

  public static getDefaultProductsFilter(): string[] {
    return environment.defaultProductsFilter;
  }

  public static getDefautLanguagesFilter(): string[] {
    return environment.defaultLanguagesFilter;
  }

  public static getDefaultTypesFilter(): string[] {
    return environment.defaultTypesFilter;
  }

  public static getDefaultSourcesFilter(): string[] {
    return environment.defaultSourcesFilter;
  }

  public static isHideFilters(): boolean {
    return environment.hideFilters;
  }

  public static isHideProductFilter(): boolean {
    return environment.hideProductFilter;
  }

  public static isHideLanguageFilter(): boolean {
    return environment.hideLanguageFilter;
  }

  public static isHideSourceFilter(): boolean {
    return environment.hideSourceFilter;
  }

  public static getAuthApiUrl(): string {
    return environment.authApiUrl;
  }

  public static enableLocal(): boolean {
    return environment.enableLocal;
  }

  public static enableRemote(): boolean {
    return environment.enableRemote;
  }



  public isInternalNetwork(): boolean {
    return this.isInternalNetwork0;
  }

  public static createDisplayStringForProducts(products): string {
    var productDisplayString = "";
      // create a display string to be used in the list view
      if (products && products.length > 0) {
        productDisplayString = products.join(",").replace(new RegExp(";", 'g')," ");
      }
      return productDisplayString;
  }

  public static createProductListNoVersions(products): string[] {
    var productListNoVersions = [];
    for (let product of products) {
      var productPair = product.split(";");
      productListNoVersions.push(productPair[0]);
    }
    return productListNoVersions;
  }

  /**
   * This utility function is to work around an issue with insecure certificates on vdc-download.vmware.com.
   * As it turns on we figured out that in fact the certificate is OK, but this is a bug in many webkit browsers
   * including Chrome.  For Chrome browsers version 57 or later is needed (63 has the issue).  It seems that it
   * is also an issue for Safari.
   */
  public static fixVMwareDownloadUrl (url): string {
    return url;
    // if (url) {
    //     return url.replace("vdc-download", "vdc-repo");
    // } else {
    //     return url;
    // }
  }

  /**
   * create a swagger operation id from the method path such as /endpoints/types/extensions/{id}
   * to get_endpoints_types_extensions_id
   */
  public swagger_path_to_operationId(httpMethod, swaggerOperationPath): string {
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
  public swagger_fix_operationId (operationId) : string {
    if (!operationId) {
      return "";
    }
    operationId = operationId.trim();
    operationId = operationId.replace(this.NOT_ALNUM_RE,'_');
    return operationId;
  }

  public createUrlForSwaggerMethod (apiUrl, methodType, methodPath, tag, operationId) : string {
    // I don't understand the pattern, but this is what swagger does, it puts the tag at the beginning of the method, and then
    // puts '45' for dashes, '47' for slashes and '32' for spaces, which appears to be the decimal for the ASCII char value, odd.  I guess this is their
    // own sort of URL encoding, albeit really stange.
    // TODO improve this algorithm to handle other characters as well.
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

    var url = apiUrl + '?!/';
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
  public createMethodsForProduct(type, _apiRefDocUrl, _apiUrl) : string[] {
    var methods = [];
    // Add methods for Swagger APIs
    if(type === 'swagger'){
      //FIXME use a cache for these files for performance.  there is other code that fetchs the swagger.json as well and we need to do this ONCE.
      /*
      $.ajax({
                        url: _apiRefDocUrl,
                        type: 'GET',
                        dataType: 'json',
                         async: false,
                         success: function(data){
                             var name = data.info.title;
                             var version = data.info.version;
                             $.each(data.paths, function(_k, _v){
                                 // here _v is the map of http methods, e.g. "get", "post" to swagger objects. and _k is
                                 // the URL/path
                                 for(var _httpMethodType in _v){

                                     // there can be multiple tags, which are in theory multiple ways to get at the same
                                     // method.  just pick the first one to create a URL with.
                                     var tag = null;
                                     var tagList = _v[_httpMethodType].tags;
                                     if (tagList && tagList.length > 0) {
                                         tag = tagList[0];
                                     }
                                     var operationId = _v[_httpMethodType].operationId; // may be null

                                     var methodUrl = utils.createUrlForSwaggerMethod(_apiUrl, _httpMethodType, _k, tag, operationId);

                                     // Add filter columns here in the json object if needed
                                     methods.push({ "http_method": _httpMethodType,
                                                    "path": _k,
                                                    "name": name,
                                                    "url" : methodUrl,
                                                    "version": version,
                                                    "summary": _v[_httpMethodType].summary,
                                                    "description": _v[_httpMethodType].description,
                                                    "deprecated": _v[_httpMethodType].deprecated
                                                   });
                                     break;
                                 }
                             });
                         }
                     }); */
    }
    return methods;

  }

}
