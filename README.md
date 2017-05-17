# VMware API Explorer component

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer for VMware APIs.  This
component has minimal dependencies and can be embedded in any product that has an embedded web server.

If you wish to see an instance of this project in action, check out the [VMware Platypus Project](http://github.com/vmware/platypus/), 
which is a package of this API Explorer in a convenient Docker container.

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
You can config the api-explorer by setting environment variables in config.js file (shown below).  By default, both the local APIs and remote APIs are enabled.  To disable the remote APIs, set the "window.config.enableRemote=false". For local APIs, you need to set the "local.json" file path in the "window.config.localApiEndPoint" variable. 

It is possible to specify default settings for filter values in the defaultFilters variable.
This can be used to only display APIs for a particular product for example.

Additionally if you wish to prevent the user from being able to change a particular filter 
selection, you can specify a "true" value for one of the  window.config.hide* variables. These
values cause either all of the filters (in the case of "hideFilters"), or a particular filter
pane to be hidden by default.

In the example below, we create an API explorer that only displays local vSphere APIs by
setting defaultFilters values as well as hideFilters = true.

```javascript

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
  window.config.apiListHeaderText = "vSphere APIs";

  // default filtering to apply to the window after the initial load is done.
  window.config.defaultFilters = {
      keywords : "",
      products : ["vSphere"],
      languages: [],
      types: [],
      sources: ["local"]
  };

  // Default control over display of filters.  This has nothing to do do with the actual values of the filters,
  // only over the display of them.  If all filters or a particular filter pane are not displayed and yet there is
  // a defaultFilters value for it, the user will not be able to change the value. This can be used to scope to a
  // particular product for example.
  window.config.hideFilters = true;             // if true, the filter pane is not displayed at all
  window.config.hideProductFilter = false;       // if true, the products filter is hidden
  window.config.hideLanguageFilter = false;      // if true, the language filter is hidden
  window.config.hideSourcesFilter = false;       // if true, the sources filter is hidden
```

## Contributing
The API Explorer project team welcomes contributions from the community. For more detailed information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License
All files are released under the terms of the MIT License, see the [LICENSE](LICENSE) file in the root of this project.
