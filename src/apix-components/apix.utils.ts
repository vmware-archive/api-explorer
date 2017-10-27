/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { OnInit } from '@angular/core';

import { config } from './apix.config';

@Injectable()
export class ApixUtils {

  public static APIS_STORAGE_KEY = 'apis';
  public static PRODUCTS_STORAGE_KEY = 'products';
  public static LANGUAGES_STORAGE_KEY = 'languages';
  public static TYPES_STORAGE_KEY = 'types';
  public static SOURCES_STORAGE_KEY = 'sources';
  public static OVERVIEW_PATH_STORAGE_KEY = 'overview-path';
  public static APIS_TAB_KEY = 'apis-tab';
  public static FILTER_STORAGE_KEY = 'api-filter';
  public static SWAGGER_PREFERENCES_KEY = 'swagger-preferences';

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

  public static formatLocalApis(apis: any[]): any[] {
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
            api.productDisplayString = this.createDisplayStringForProducts(api.products);

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

            var apiUrl = "#!/apis/" + api.id;

            // Add api details to search content
            //api.methods = AppUtils.createMethodsForProduct(value.type, value.url, apiUrl);

            result.push(api);
        }
    }
    return result;
  }
}
