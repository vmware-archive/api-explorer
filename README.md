# api-explorer

## Overview
This project is a lightweight HTML5/AngularJS 1.x component that implements an API Explorer.  The idea
is to create a very lightweight component that can be embedded in any web server to implement API tooling
for VMware APIs.  The component can serve API declarations that are embedded locally with the component as
well as those retrieved from the VMware API web services

## Try it out

### Prerequisites

Building requires:
* NodeJS
* bower
* grunt

The content itself can be provided by any web server (node, Tomcat, Apache, whatever)

#### Setup on Debian Linux 7.x (and probably others)
1. Add appropriate package source for your distribution:
```bash
vi /etc/apt/sources.list.d/nodesource.list
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

4. Install bower
```bash
sudo npm install -g bower
```

5. Install grunt:
```bash
sudo npm install -g grunt-cli
```

### Build & Run

1. Use grunt to build
```bash
grunt build
```
2. Use grunt to run
```bash
grunt serve
```

## Documentation

## Releases & Major Branches

## Contributing

The api-explorer project team welcomes contributions from the community. If you wish to contribute code and you have not
signed our contributor license agreement (CLA), our bot will update the issue when you open a Pull Request. For any
questions about the CLA process, please refer to our [FAQ](https://cla.vmware.com/faq). For more detailed information,
refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## License
