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
  
  // Whether or not to enable remote APIs
  window.config.enableRemote = true;
  
  // Product catalog 
  // Available values are: vSphere, NSX, vCenter Server, vCloud Air, vCloud Suite, Virtual SAN, vRealize Suite
  //window.config.productCatalog = "vSphere";
  
  // Remote APIs endpoint.  
  window.config.remoteSampleExchangeApiEndPoint = "https://apigw.vmware.com/sampleExchange/v1";
  window.config.remoteApiEndPoint = "https://vdc-repo.vmware.com/apix";
}(this));