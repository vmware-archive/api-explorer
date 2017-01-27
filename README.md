# VMware API Explorer component

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer for VMware APIs.  This
component has minimal dependencies and can be embedded in any product that has an embedded web server.

###Features
* Support for Swagger, RAML, or generic HTML API documentation
* Swagger and RAML components can make API calls using the client browsers network connectivity.
* API Metadata can be statically embedded locally with the component OR
* API Metadata for released VMware products can come from VMware API services

## Try it out

### Prerequisites

Building requires:
* NodeJS
* bower
* grunt

The distribution itself can be served by any web server, Node, Tomcat, Apache, whatever.

#### Tools setup on Debian Linux 7.x (and Ubuntu and probably others)
1. Add appropriate NodeJS package source for your OS/distribution:

Here you are going to edit the appropriate package source for your distribution.  If these instructions don't work for you, use Google and look for instructions on how to install NodeJS on yout platform, they are everywhere. Note
that the instructions below should work for Debian 8.x and Ubuntu 14 if you substitute "jessie" for "wheezy" below.
```bash
sudo vi /etc/apt/sources.list.d/nodesource.list
 deb https://deb.nodesource.com/node_4.x wheezy main
 deb-src https://deb.nodesource.com/node_4.x wheezy main
```
2. Update package list
```bash
sudo apt-get update
```
3. Install nodejs (which installs npm)
```bash
sudo apt-get install nodejs
```
4. Install bower (you can install it locally or globally)
```bash
sudo npm install -g bower
```
5. Install grunt:
```bash
sudo npm install -g grunt-cli
```
### Build & Run
1. The first time, Install dependencies:
```bash
npm install
bower install
```

2. Use grunt to build
```bash
grunt build
```

3. Serve content locally using grunt to start the Node server:
```bash
grunt serve
```

## Documentation
You can config the api-explorer by setting your environment variables in config.js file.  By default, the local APIs flag is enabled.  You can set where to get the local.json file in "window.config.localApiEndPoint" variable. By default, the remote APIs flag is disabled.  To get remote APIs from code.vmware.com,  set the "window.config.enableRemote" to true.  In addition, you can also specify "window.config.productCatalog" variable to get the APIs for a specified product.  By default, the "window.config.productCatalog" is not set, so all remote APIs are shown.

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


## Releases & Major Branches

## Contributing
The api-explorer project team welcomes contributions from the community. If you wish to contribute code and you have not
signed our contributor license agreement (CLA), our bot will update the issue when you open a Pull Request. For any
questions about the CLA process, please refer to our [FAQ](https://cla.vmware.com/faq). For more detailed information,
refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## License
All files are released under the terms of the MIT License, see the [LICENSE](LICENSE) file in the root of this project.
