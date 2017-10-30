# VMware API Explorer component

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer for VMware APIs.  This
component has minimal dependencies and can be embedded in any product that has an embedded web server.

If you wish to see an instance of this project in action, check out the [VMware Platypus Project](http://github.com/vmware/platypus/),
which is a package of this API Explorer in a convenient Docker container.

### Features
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

2. Run 'ng serve' to start the local node server and open your browser

### Embed it as a component in your app
The project is in development mode at this moment, but soon we will be deploying
 releases on npm, and instructions will be posted here on how to install and
configure the component. For now you will have to do a build (ng build) and copy
the contents of the dist folder into your tree.

### Component configuration
You can import the Apix-component module into your Angular App. The minimum requirement is to, in your app.module.ts file, import the module:

import { ApixComponentsModule } from "apix-components.module";

and add it to your imports list e.g.:

```javascript
 10 @NgModule({
 11     declarations: [
 12         AppComponent,
 13     ],
 14     imports: [
 15         BrowserModule,
 16         FormsModule,
 17         HttpModule,
 18         ClarityModule.forRoot(),
 19         ApixComponentsModule.forRoot(),
 20         ROUTING
 21     ],
 22     providers: [],
 23     bootstrap: [AppComponent]
 24 })
 25 export class AppModule {
 26 }


Enable apix-component via tags:

By default, both the local APIs and remote APIs are enabled.  To disable the remote APIs, set the "enableRemote=false". For local APIs, you need to set the "local.json" file path in the "localApiUrl" tag.

It is possible to specify default settings for filter values in the defaultFilters variable.
This can be used to only display APIs for a particular product for example.

Additionally if you wish to prevent the user from being able to change a particular filter
selection, you can specify a "true" value for one of the  window.config.hide* variables. These
values cause either all of the filters (in the case of "hideFilters"), or a particular filter
pane to be hidden by default.

In the example below, we create an API explorer that only displays local vSphere APIs by
setting defaultFilters values as well as hideFilters = true.

```javascript

  <api-list
        [baseRoute] = "'apix'"
        [enableLocal] ="true"
        [enableRemote]= "true"
        [localApiUrl]="local.json"
        [hideFilters]="true"
        [apiListHeaderText]="'vSphere APIs'"
        [defaultProductsFilter]="'vSphere'"
        [defaultSourcesFilter]="'local'">
  </api-list>

```

## Contributing
The API Explorer project team welcomes contributions from the community. For more detailed information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License
All files are released under the terms of the MIT License, see the [LICENSE](LICENSE) file in the root of this project.
