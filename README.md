# Node [metafetch](https://www.npmjs.org/package/metafetch)
[![Build Status](https://img.shields.io/travis/afzaalace/metafetch.svg?style=flat-square)](https://travis-ci.org/afzaalace/metafetch)
[![Coverage](https://img.shields.io/codecov/c/github/afzaalace/metafetch.svg?style=flat-square)](https://codecov.io/github/afzaalace/metafetch?branch=master)
[![Coverage](https://img.shields.io/coveralls/afzaalace/metafetch.svg?style=flat-square)](https://coveralls.io/github/afzaalace/metafetch?branch=master)
[![Dependency Status](https://img.shields.io/bithound/dependencies/github/afzaalace/metafetch.svg?style=flat-square)](https://www.bithound.io/github/afzaalace/metafetch/master/dependencies/npm)
[![Dev Dependencies Status](https://img.shields.io/bithound/devDependencies/github/afzaalace/metafetch.svg?style=flat-square)](https://www.bithound.io/github/afzaalace/metafetch/master/dependencies/npm)
[![Known Vulnerabilities](https://snyk.io/test/npm/metafetch/badge.svg?style=flat-square)](https://snyk.io/test/npm/metafetch)

[![NPM](https://nodei.co/npm/metafetch.png?downloadRank=true&downloads=true)](https://nodei.co/npm/metafetch.png?downloadRank=true&downloads=true)

Metafetch fetches a given URL's title, description, images, links etc.

## Installation ##

Use NPM to install:

    npm install metafetch

## Usage

    var metafetch = require('metafetch');

    metafetch.fetch('http://www.facebook.com'[, options], function(err, meta) {
        console.log('title: ', meta.title);
        console.log('description: ', meta.description);
        console.log('type: ', meta.type);
        console.log('url: ', meta.url);
        console.log('siteName: ', meta.siteName);
        console.log('charset: ', meta.charset);
        console.log('image: ', meta.image);
        console.log('meta: ', meta.meta);
        console.log('images: ', meta.images);
        console.log('links: ', meta.links);
    });

Optional flags to disable parsing images and links and http request options for [restler](https://github.com/danwrong/restler)

    metafetch.fetch('http://www.facebook.com', { flags: { images: false, links: false }, http: { timeout: 30000 } }, function(err, meta) {
        console.log('title: ', meta.title);
        console.log('description: ', meta.description);
        console.log('type: ', meta.type);
        console.log('url: ', meta.url);
        console.log('siteName: ', meta.siteName);
        console.log('charset: ', meta.charset);
        console.log('image: ', meta.image);
        console.log('meta: ', meta.meta);
    });

### Response Data

* `title` : Page title or `og:title` meta tag.
* `description` : Page description or `og:description` meta tag.
* `image` : `og:image` meta tag.
* `url` : Page url or `og:url` meta tag.
* `uri` : Page uri object, parsed by [uri-js](https://github.com/garycourt/uri-js).
* `images` : All images on this page.
* `links` : All links on this page.
* `meta` : All the meta tags that with a `property` or `name` attribute. e.g `<meta property="author" content="Example">`, `<meta name="description" content="Example.">`

## License ##

(The MIT License)

Copyright (c) 2014 Afzaalace;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
