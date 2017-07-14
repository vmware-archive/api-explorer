/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
(function (window) {
  window.config = window.config || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.config.enableDebug = false;

  // Whether or not to enable local APIs
  window.config.enableLocal = true;

  // local APIs endpoint
  window.config.localApiEndPoint = "local.json";

  // Whether or not to enable remote APIs and resources
  window.config.enableRemote = true;

  // you can customize the text that is displayed above the APIs, to scope
  // to a particular product for example.
  window.config.apiListHeaderText = "Available APIs";

  // default filtering to apply to the window after the initial load is done.
  window.config.defaultFilters = {
      keywords : "",
      products : [],
      languages: [],
      types: [],
      sources: []
  };

  // Default control over display of filters.  This has nothing to do do with the actual values of the filters,
  // only over the display of them.  If all filters or a particular filter pane are not displayed and yet there is
  // a defaultFilters value for it, the user will not be able to change the value. This can be used to scope to a
  // particular product for example.
  window.config.hideFilters = false;             // if true, the filter pane is not displayed at all
  window.config.hideProductFilter = false;       // if true, the products filter is hidden
  window.config.hideLanguageFilter = false;      // if true, the language filter is hidden
  window.config.hideSourcesFilter = false;       // if true, the sources filter is hidden

  // Remote APIs endpoint.
  window.config.remoteSampleExchangeApiEndPoint = "https://apigw.vmware.com/sampleExchange/v1";
  window.config.remoteApiEndPoint = "https://vdc-repo.vmware.com/apix";

  // This is for vSphere SSO only.  To enable the SSO, set the ssoEnabled = true.
  window.config.ssoEnabled = false;
  window.config.authApiEndPoint = "https://10.154.10.43/rest/com/vmware/cis/session";
}(this));
