# VMware API Explorer component

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer for VMware APIs.  This
component has minimal dependencies and can be embedded in any product that has an embedded web server.

###Features
* Support for Swagger, RAML, or generic HTML API documentation
* Swagger and RAML components can make API calls using the client browsers network connectivity.
* API Metadata can be statically embedded locally with the component OR
* API Metadata for released VMware products can come from VMware API services

## Getting Started

### Prerequisites
For development environment and build configuration see [build documentation](BUILD.md)

### Try it out locally
To run the API explorer locally (development mode)
1. [Setup your development environment](BUILD.md)
2. Run 'grunt serve' to start the local node server and open your browser

### Embed it as a component in your app
The project is in development mode at this moment, but soon we will be deploying
 releases on npm, and instructions will be posted here on how to install and
configure the component. For now you will have to do a build (grunt build) and copy
the contents of the dist folder into your tree.

### Component configuration
You can config the api-explorer by setting environment variables in config.js file (shown below).  By default, the local APIs flag is enabled.  You can set where to get the local.json file in "window.config.localApiEndPoint" variable. By default, the remote APIs flag is disabled.  To get remote APIs from code.vmware.com,  set the "window.config.enableRemote" to true.  In addition, you can also specify "window.config.productCatalog" variable to get the APIs for a specified product.  By default, the "window.config.productCatalog" is not set, so all remote APIs are shown.

```bash

  ## Enable local APIs
  window.config.enableLocal = true;

  ## local APIs endpoint
  window.config.localApiEndPoint = "local.json";

  ## Enable remote APIs
  window.config.enableRemote = false;

  ## Product catalog
  ## Available values are: vSphere, NSX, vCenter Server, vCloud Air, vCloud Suite, Virtual SAN, vRealize Suite
  window.config.productCatalog = "vSphere";
```

#### Configuration local APIs
The component uses a local.json file to define local API metadata. See

## Contributing
The API Explorer project team welcomes contributions from the community. For more detailed information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License
All files are released under the terms of the MIT License, see the [LICENSE](LICENSE) file in the root of this project.
