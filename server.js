const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const routeStatic = require('./lib/route-static');
const redirectIndices = require('./lib/redirect-indices');
const compression = require('compression');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const app = express();

const baseDir = 'src';
const port = process.env.PORT || 3004;

// compress all responses
app.use(compression());

imagemin(['src/assets/img/*.{jpg,png}'], 'src/dist/img', {
    plugins: [
        imageminJpegtran({quality: '20-30'}),
        imageminPngquant({quality: '65-80'})
    ]
}).then(files => {
    console.log(files);
    //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
});

app.set('etag', false);
app.use((req, res, next) => { res.removeHeader('X-Powered-By'); next(); });

// static routes
app.use(routeStatic);
app.use('/static', express.static(path.join(__dirname, baseDir), { etag: false, lastModified: false }));

// dynamic pages
app.use(redirectIndices);

nunjucks.configure(baseDir, {
    autoescape: true,
    express: app,
    watch: true
});

app.get('*', (req, res, next) => {
    res.render(path.join('./', req.url, 'index.html'), {});
});

app.listen(port, (err) => {
    err ? console.error(err) : console.log(`app running on http://localhost:${port}`);
});
