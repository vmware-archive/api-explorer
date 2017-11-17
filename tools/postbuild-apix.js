/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
const shell = require('shelljs');

shell.exec('cd dist/apix-components; mkdir assets;');
shell.exec('cp ./src/assets/jquery.sieve.js ./dist/apix-components/assets; cp ./src/assets/swagger-console.html ./dist/apix-components/assets; cp ./dist/apix-components/bundles/* ./dist/apix-components');
shell.exec('cd dist/apix-components; npm pack;');


