# VMware API Explorer component

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer for VMware APIs.  This
component has minimal dependencies and can be embedded in any product that has an embedded web server.

If you wish to see an instance of this project in action, check out the [VMware Platypus Project](http://github.com/vmware/platypus/),
which is a package of this API Explorer in a convenient Docker container.

### Features
* Support for Swagger or generic HTML API documentation
* Swagger components can make API calls using the client browsers network connectivity.
* API Metadata can be statically embedded locally with the component OR
* API Metadata for released VMware products can come from VMware API services

## Getting Started

### Prerequisites
For development environment and build configuration see [build documentation](BUILD.md)

### Try it out locally
To run the API explorer locally (development mode)

1. [Setup your development environment](BUILD.md)

2. Run 'npm run:start' to start the local node server and open your browser

### Embed it as an Angular component in your app
API explorer is published as a npm package:

* __apix-components.__ Contains the APIX Angular components.

If you already have an Angular application, you can follow the installation steps below to include and use APIX in your application.

1. Install APIX Components package through npm:
    ```bash
    npm install apix-components --save
    ```

2. Install the polyfill for Custom Elements:
    ```bash
    npm install @webcomponents/custom-elements --save
    ```

3. Import the ApixComponentsModule into your Angular application's module.  Your application's main module might look like this:
    ```typescript
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { ApixComponentsModule } from 'apix-components';
    import { AppComponent } from './app.component';

    @NgModule({
        imports: [
            BrowserModule,
            ApixComponentsModule.forRoot(),
            ....
         ],
         declarations: [ AppComponent ],
         bootstrap: [ AppComponent ]
    })
    export class AppModule {    }
    ```

4. Enable apix-component via tags:

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

### Use the api-explorer app
If you don't have an Angular application, you can follow the installation steps below to include API Explorer in your product.

1. Build API Explorer app through npm:
    ```bash
    npm run build:all
    ```

2. Config your application by changing the default setting in src/apix-config.json file.


## Contributing
The API Explorer project team welcomes contributions from the community. For more detailed information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License
All files are released under the terms of the MIT License, see the [LICENSE](LICENSE) file in the root of this project.
