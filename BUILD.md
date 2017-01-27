# VMware API Explorer build and development setup

## Tools used

Building requires:
* NodeJS, currently development is done with 4.x, but any version later than 4 should work.
* bower
* grunt

The distribution itself can be served by any web server, Node, Tomcat, Apache, whatever.

## Dev tools setup

#### Debian Linux 7.x hosts (and Ubuntu and probably others)
##### Add appropriate NodeJS package source for your OS/distribution:
Here you are going to edit the appropriate package source for your distribution.  If these instructions don't work for you, use Google and look for instructions on how to install NodeJS on yout platform, they are everywhere. Note
that the instructions below should work for Debian 8.x and Ubuntu 14 if you substitute "jessie" for "wheezy" below.
```bash
sudo vi /etc/apt/sources.list.d/nodesource.list
 deb https://deb.nodesource.com/node_4.x wheezy main
 deb-src https://deb.nodesource.com/node_4.x wheezy main
```
##### Update package list
```bash
sudo apt-get update
```
##### Install nodejs (which installs npm)
```bash
sudo apt-get install nodejs
```
##### Install bower (you can install it locally or globally)
```bash
sudo npm install -g bower
```
##### Install grunt
```bash
sudo npm install -g grunt-cli
```
## Build & Run
The first time, Install dependencies:
```bash
npm install
bower install
```

Use grunt to build
```bash
grunt build
```

Serve content locally using grunt to start the Node server:
```bash
grunt serve
```
