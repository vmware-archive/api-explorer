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

Run npm tasks to do the angularcli build.  There are a couple of 
different options depending on your desired build type:

The following will build a normal image of everything which includes
cache-breaker hashes on files:
```bash
npm run build:all
```

The following will build a web image that has no hashes on the files:
```bash
npm run buildnohash:all
```

Serve content locally using angular/cli to startt the Node server:
```bash
npm run serve
```
