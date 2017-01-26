/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
(function (window) {
  window.__env = window.__env || {};

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = true;
  
  // Whether or not to enable local APIs
  window.__env.enableLocal = true;
  
  // local APIs endpoint
  window.__env.localApiEndPoint = "db/local.json";
  
  // Whether or not to enable remote APIs
  window.__env.enableRemote = true;
  
  // Product catalog 
  // Available values are: vSphere, NSX, vCenter Server, vCloud Air, vCloud Suite, Virtual SAN, vRealize Suite
  //window.__env.productCatalog = "vsphere";
}(this));