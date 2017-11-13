# VMware API Explorer build and development setup

## Tools used


Building requires:
* Node 6.x
* NPM 3.x

The distribution itself can be served by any web server, Node, Tomcat, Apache, whatever.

## Dev tools setup

#### Debian Linux 8.x hosts (and Ubuntu and probably others)
##### Add appropriate NodeJS package source for your OS/distribution:
Here you are going to edit the appropriate package source for your distribution.  If these instructions don't work for you, use Google and look for instructions on how to install NodeJS on yout platform, they are everywhere, e.g. https://nodejs.org/en/download/package-manager/

```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

##### Install angular/cli (you can install it locally or globally)
```bash
sudo npm install -g @angular/cli
```

```
## Build & Run
The first time, Install dependencies:
```bash
npm install

```

NPM Scripts
-----------
All of our build scripts are defined in `package.json`. Run npm tasks to do the angularcli build.  There are a couple of
different options depending on your desired build type:

##### `npm run start`
This will start up the api-explorer app using angular/cli on port 4200 and watch for file changes for live reload.

##### `npm run clean`
This script deletes the `dist` folder, which contains all the produced files for bundling.

##### `npm run build:all`
This script builds npm package candidate we currently publish: `apix-components` under the `/dist` folder.
Note that this will also produce bundle files as a result of building and bundling for the api-explorer app. Those can be ignored for the purposes of publishing.

##### `npm run buildnohash:all`
This script builds a web image that has no hashes on the files.


