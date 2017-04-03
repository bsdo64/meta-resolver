const _ = require('lodash'),
  cheerio = require('cheerio'),
  charset = require('superagent-charset'),
  request = require('superagent'),
  URI = require('uri-js'),
  random_ua = require('modern-random-ua'),
  Client = {};

charset(request);

const parseMeta = function (url, options, body) {
  const uri = URI.parse(url);
  const $ = cheerio.load(body);
  const response = {};
  let title;
  if (options.title) {
    title = $('title').text();
  }
  if (options.charset) {
    response.charset = $("meta[charset]").attr("charset");
  }

  if (options.images) {
    const imagehash = {};
    response.images = $('img').map(function () {
      const src = $(this).attr('src');
      if (src) {
        return URI.resolve(url, src);
      } else {
        return "";
      }
    }).filter(function (e, f) {
      return (f.match(/\.(jpeg|jpg|gif|png|JPEG|JPG|GIF|PNG)$/) !== null);
    }).filter(function (item) {
      return imagehash.hasOwnProperty(item) ? false : (imagehash[item] = true);
    });
  }
  if (options.links) {
    const linkhash = {};
    response.links = $('a').map(function () {
      const href = $(this).attr('href');
      if (href && href.trim().length && href[0] !== "#") {
        return URI.resolve(url, href);
      } else {
        return 0;
      }
    }).filter(function (item) {
      if (item === 0) {
        return false;
      }
      return linkhash.hasOwnProperty(item) ? false : (linkhash[item] = true);
    });
  }
  const meta = $('meta'),
    metaData = {};

  Object.keys(meta).forEach(function (key) {
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

  if (options.title) {
    response.title = metaData['og:title'] || title;
  }
  if (options.description) {
    response.description = metaData['og:description'] || metaData.description;
  }
  if (options.type) {
    response.type = metaData['og:type'];
  }
  if (options.url) {
    response.url = metaData['og:url'] || url;
  }
  if (options.siteName) {
    response.siteName = metaData['og:site_name'];
  }
  if (options.image) {
    response.image = metaData['og:image'];
  }
  if (options.meta) {
    response.meta = metaData;
  }
  return response;
};

Client.fetch = function (url, options, callback) {
  url = url.split("#")[0]; //Remove any anchor fragments
  const http_options = {
    timeout: 20000,
    headers: {
      accept: '*/*',
      'user-agent': random_ua.generate()
    },
    followRedirects: false
  };
  const _options = {
    title: true,
    description: true,
    type: true,
    url: true,
    siteName: true,
    charset: true,
    image: true,
    meta: true,
    images: true,
    links: true
  };
  if (typeof options === 'function') {
    callback = options;
  } else if (typeof options === 'object') {
    _.merge(http_options, options.http || {});
    _.merge(_options, options.flags || {});

  }
  if (url === undefined || url === "") {
    if (callback !== undefined) {
      callback("Invalid URL", (url || ""));
    }
    return;
  }

  let redirectCount = 0;
  const text = function () {
    const headReq = request.head(url);
    const getReq = request.get(url);

    if (http_options.timeout) {
      getReq.timeout(http_options.timeout);
      headReq.timeout(http_options.timeout);
    }

    if (http_options.headers) {
      getReq.set(http_options.headers);
      headReq.set(http_options.headers);
    }

    headReq.end(function (err, headResult) {
      const type = headResult.statusType;

      if (err && err.timeout) {
        return callback('Timeout');
      }
      if (!headResult) {
        return callback(err);
      }

      if (type === 3) {
        redirectCount++;
        if (redirectCount > 5) {
          return callback("Too many redirects");
        }
        url = URI.resolve(url, headResult.headers.location);
        return text();
      } else if (type > 5) {
        return callback(headResult.statusCode);
      }

      let charSet = headResult.charset || 'utf8';
      if (charSet === 'MS949') {
        charSet = 'cp949';
      }

      return getReq
        //.charset(charSet)
        .buffer(true).parse((res, cb)=>{
          let buffer = [];
          res.on('data', (chunk)=>{
            buffer.push(chunk);
          });
          res.on('end', ()=> {

            const IconvLite = require('iconv-lite');
            const result = IconvLite.decode(Buffer.concat(buffer), charSet);

            cb(null, result)
          })
        })
        .then(result => {
          const meta = parseMeta(url, _options, result.body);
          return callback(null, meta);
        })
        .catch(err => {
          console.log(err);
        })
    });
  };
  text();
};

module.exports = Client;
