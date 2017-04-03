/* eslint-env mocha */
const should = require('should'),
  { describe, before, it, after } = require('mocha'),
  path = require('path'),
  fetchog = require(path.join(__dirname, '../index.js'));

//Server for redirects
const http = require('http');
let server1;
let server2;
describe('server', function() {
  this.timeout(5000);

  before(function(done) {
    server1 = http.createServer(function(req, res) {
      res.writeHead(302, {
        'Location': '/',
      });
      res.end();
    }).listen(14444);
    server1.on('listening', function() {
      done();
    });
    server2 = http.createServer(function(req, res) {
      setTimeout(function() {
        if (req.url === '/nonexistenturl') {
          res.writeHead(404, {"Content-Type": "text/plain"});
          res.write("404 Not found");
          return res.end();
        }

        res.write(
          '<html><head></head><body><a href=\'\'>Invalid link</a></body></html>');
        res.end();
      }, 100);
    }).listen(14445);
  });
  after(function(done) {
    server1.close();
    server2.close();
    done();
  });
  it('should return invalid url error', function(done) {
    fetchog.fetch('', function(err) {
      should.exist(err);
      err.should.equal('Invalid URL');
      done();
    });
  });
  it('should return nothing', function(done) {
    const err = fetchog.fetch('');
    should.not.exist(err);
    done();
  });
  it('should get a return 404 from linc.world', function(done) {
    fetchog.fetch('http://localhost:14445/nonexistenturl', {
      flags: {
        images: false,
        links: false,
      },
    }, function(err) {
      should.exist(err);
      err.status.should.equal(404);
      done();
    });
  });
  it('should get a meta without error from linc.world', function(done) {
    fetchog.fetch('http://localhost:14445/#someanchor', {
      flags: {
        images: false,
        links: false,
      },
      http: {
        timeout: 30000,
      },
    }, function(err, meta) {
      should.not.exist(err);
      should.exist(meta);
      should.exist(meta.uri);
      meta.uri.host.should.equal('localhost');
      done();
    });
  });
  it('should get a meta associate with flags', function(done) {
    fetchog.fetch('http://localhost:14445/#someanchor', {
      flags: {
        title: false,
        description: false,
        type: false,
        url: false,
        siteName: false,
        images: false,
        meta: false,
        links: false,
        charset: false,
        image: false,
      },
      http: {
        timeout: 30000,
      },
    }, function(err, meta) {
      should.not.exist(err);
      should.exist(meta);
      should.not.exist(meta.title);
      should.not.exist(meta.description);
      should.not.exist(meta.type);
      should.not.exist(meta.url);
      should.not.exist(meta.siteName);
      should.not.exist(meta.images);
      should.not.exist(meta.meta);
      should.not.exist(meta.links);
      should.not.exist(meta.charset);
      should.not.exist(meta.image);
      should.exist(meta.uri);
      meta.uri.host.should.equal('localhost');
      done();
    });
  });
  it('should get a meta with custom flags from google.com', function(done) {
    // www.nasa.gov adds a trailing slash
    fetchog.fetch(
      'https://www.google.co.kr',
      {
        flags: {
          images: false,
          links: false,
        },
        http: {
          timeout: 30000,
        },
      }, function(err, meta) {
        should.not.exist(err);
        should.not.exist(meta.images);
        should.not.exist(meta.links);
        should.exist(meta.uri);
        meta.uri.host.should.equal('www.google.co.kr');
        done();
      });
  });
  it('should get a meta with default flag from google.com', function(done) {
    // www.nasa.gov adds a trailing slash
    fetchog.fetch(
      'https://www.google.co.kr',
      function(err, meta) {
        should.not.exist(err);
        should.exist(meta.images);
        should.exist(meta.links);
        should.exist(meta.uri);
        meta.uri.host.should.equal('www.google.co.kr');
        done();
      });
  });
  it('should get a meta without error from test server for invalid links',
    function(done) {
      fetchog.fetch('http://127.0.0.1:14445/', function(err, meta) {
        should.not.exist(err);
        should.exist(meta);
        should.exist(meta.uri);
        done();
      });
    });
  it('should redirect too many times.', function(done) {
    fetchog.fetch('http://127.0.0.1:14444/', {
      http: {
        timeout: 30000,
      },
    }, function(err) {
      should.exist(err);
      err.should.equal('Too many redirects');
      done();
    });
  });
  it('should err', function(done) {
    fetchog.fetch('http://0.0.0.0/', {
      http: {
        timeout: 1500,
      },
    }, function(err) {

      should.exist(err);
      done();
    });
  });
  it('should err from invalid links', function(done) {
    fetchog.fetch(
      'http://nonexistntmisspeleddomani' + (new Date().getTime()).toString(36) +
      '.ocm', {
        http: {
          timeout: 3000,
        },
      }, function(err) {
        should.exist(err);
        done();
      });
  });
  it('should redirect from redirect links', function(done) {
    fetchog.fetch('http://127.0.0.1:14444', {
      http: {
        timeout: 1000,
      },
    }, function(err) {
      should.exist(err);

      done();
    });
  });
  it('should timeout', function(done) {
    fetchog.fetch('http://google.com', {
      http: {
        timeout: 1,
      },
    }, function(err) {
      should.exist(err);
      err.should.equal('Timeout');
      done();
    });
  });

  it('should err with not exist url', function(done) {
    fetchog.fetch('http://aslkdvjanef.asdvasef', {
      http: {
        timeout: 1000,
      },
    }, function(err) {
      should.exist(err);
      done();
    });
  });

  describe('should proper decoding ', function() {
    it('EUC-KR', function(done) {
      fetchog.fetch('http://www.chosun.com/', function(err, meta) {
        should.not.exist(err);
        meta.charset.should.equal('euc-kr');
        meta.title.should.equal('홈 - 1등 인터넷뉴스 조선닷컴');
        done();
      });
    });

    it('MS949(KSC5601)', function(done) {
      fetchog.fetch('http://cafe.naver.com/joonggonara', function(err, meta) {
        should.not.exist(err);
        meta.charset.should.equal('ms949');
        meta.title.should.equal('중고나라 : 네이버 카페');
        done();
      });
    });

    it('UTF-8', function(done) {
      fetchog.fetch('https://www.google.co.kr', function(err, meta) {
        should.not.exist(err);
        meta.charset.should.equal('utf-8');
        meta.title.should.equal('Google');
        done();
      });
    });
  })
});
