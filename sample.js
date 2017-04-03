var metafetch = require('./index');

metafetch.fetch('http://news.chosun.com/site/data/html_dir/2017/04/03/2017040301455.html', function (err, meta) {
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

// Optional flags to disable parsing images and links and http request options for restler

metafetch.fetch('https://www.youtube.com/watch?v=jrYIZ9VgmKo&list=PL32F95A53EA5E7ED6&index=4', {
    flags: {
        images: false,
        links: false
    },
    http: {
        timeout: 30000
    }
}, function (err, meta) {
    console.log('title: ', meta.title);
    console.log('description: ', meta.description);
    console.log('type: ', meta.type);
    console.log('url: ', meta.url);
    console.log('siteName: ', meta.siteName);
    console.log('charset: ', meta.charset);
    console.log('image: ', meta.image);
    console.log('meta: ', meta.meta);
});
