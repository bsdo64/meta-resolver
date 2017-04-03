const cheerio = require('cheerio'),
  charset = require('superagent-charset'),
  request = require('superagent'),
  URI = require('uri-js'),
  random_ua = require('modern-random-ua'),
  IconvLite = require('iconv-lite');

charset(request);

class Client {
  constructor() {
    this.url = '';
    this.requestOptions = {
      timeout: 20000,
      headers: {
        accept: '*/*',
        'user-agent': random_ua.generate(),
      },
      followRedirects: false,
    };
    this.flags = {
      title: true,
      description: true,
      type: true,
      url: true,
      siteName: true,
      charset: true,
      image: true,
      meta: true,
      images: true,
      links: true,
    };

    this._options = {};
  }

  getCharSet(res) {

    let enc;
    if (res.headers['content-type']) {
      // Extracted from headers
      enc = (res.headers['content-type'].match(/charset=(.+)/) || []).pop();
    }

    if (!enc) {
      // Extracted from <meta charset="euc-kr"> or <meta http-equiv=Content-Type content="text/html;charset=euc-kr">
      enc = (
        res.body.toString().match(/<meta.+?charset=['"]?([^"']+)/i) || []
      ).pop();
    }

    if (!enc) {
      // Default utf8
      enc = 'utf-8';
    }

    return enc;
  }

  parseMeta(url, body) {
    const uri = URI.parse(url);
    const $ = cheerio.load(body);
    const response = {};
    let title;
    if (this._options.flags.title) {
      title = $('title').text();
    }

    if (this._options.flags.images) {
      const imagehash = {};
      response.images = $('img').map(function() {
        const src = $(this).attr('src');
        if (src) {
          return URI.resolve(url, src);
        } else {
          return '';
        }
      }).filter(function(e, f) {
        return (f.match(/\.(jpeg|jpg|gif|png|JPEG|JPG|GIF|PNG)$/) !== null);
      }).filter(function(item) {
        return imagehash.hasOwnProperty(item) ?
          false :
          (imagehash[item] = true);
      });
    }
    if (this._options.flags.links) {
      const linkhash = {};
      response.links = $('a').map(function() {
        const href = $(this).attr('href');
        if (href && href.trim().length && href[0] !== '#') {
          return URI.resolve(url, href);
        } else {
          return 0;
        }
      }).filter(function(item) {
        if (item === 0) {
          return false;
        }
        return linkhash.hasOwnProperty(item) ? false : (linkhash[item] = true);
      });
    }
    const meta = $('meta'),
      metaData = {};

    Object.keys(meta).forEach(function(key) {
      const attribs = meta[key].attribs;
      if (attribs) {
        if (attribs.property) {
          metaData[attribs.property.toLowerCase()] = attribs.content;
        }
        if (attribs.name) {
          metaData[attribs.name.toLowerCase()] = attribs.content;
        }
      }
    });
    response.uri = uri;

    if (this._options.flags.title) {
      response.title = metaData['og:title'] || title;
    }
    if (this._options.flags.description) {
      response.description = metaData['og:description'] || metaData.description;
    }
    if (this._options.flags.type) {
      response.type = metaData['og:type'];
    }
    if (this._options.flags.url) {
      response.url = metaData['og:url'] || url;
    }
    if (this._options.flags.siteName) {
      response.siteName = metaData['og:site_name'];
    }
    if (this._options.flags.image) {
      response.image = metaData['og:image'];
    }
    if (this._options.flags.meta) {
      response.meta = metaData;
    }
    return response;
  }

  requestMeta(redirectCount, callback) {
    const getReq = request.get(this.url);

    if (this._options.requestOptions.timeout) {
      getReq.timeout(this._options.requestOptions.timeout);
    }

    if (this._options.requestOptions.headers) {
      getReq.set(this._options.requestOptions.headers);
    }

    return getReq
      .buffer(true).parse((res, cb) => {
        let buffer = [];
        res.on('data', (chunk) => {
          buffer.push(chunk);
        });
        res.on('end', () => {
          cb(null, Buffer.concat(buffer));
        });
      })
      .then(result => {
        if (!result) {
          return callback('No Result!');
        }

        const tempBuffer = IconvLite.decode(result.body, 'utf8');
        const charSet = this.getCharSet(result);

        if (!IconvLite.encodingExists(charSet)) {
          return callback('Encoding is not supported!');
        }

        let decodedBody;
        if (charSet !== 'utf8') {
          decodedBody = IconvLite.decode(result.body, charSet);
        } else {
          decodedBody = tempBuffer;
        }

        const meta = this.parseMeta(this.url, decodedBody);
        if (this._options.flags.charset) {
          meta.charset = charSet.toLowerCase();
        }
        return callback(null, meta);
      })
      .catch(err => {

        if (err && err.timeout) {
          return callback('Timeout');
        }

        if (err.status === 302) {
          if (redirectCount > 5) {
            return callback('Too many redirects');
          }
          this.url = URI.resolve(this.url, err.response.headers.location);
          return this.requestMeta(redirectCount + 1, callback);
        } else if (err.status >= 500) {
          return callback(err.status);
        }

        if (err) {
          return callback(err);
        }

      });
  }

  fetch(url, options, callback) {
    this.url = url.split('#')[0];

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    this._options.requestOptions =
      Object.assign({}, this.requestOptions, options && options.http);
    this._options.flags =
      Object.assign({}, this.flags, options && options.flags);

    if (url === undefined || url === '') {
      if (callback !== undefined) {
        callback('Invalid URL', (url || ''));
      }
      return;
    }

    this.requestMeta(0, callback);
  }
}

module.exports = new Client();
