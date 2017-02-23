var path = require('path');
var process = require('process');
var thirdLibrary = require('./third.library');

var gulp = require('gulp');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var babel = require('gulp-babel');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var minify = require('gulp-clean-css')
var rename = require('gulp-rename');
var revReplace = require('gulp-rev-replace');
var autoprefixer = require('gulp-autoprefixer');
var revCollector = require('gulp-rev-collector');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');

var mypack = require('webpack');
var webpack = require('webpack-stream');
var WebpackDevServer = require("webpack-dev-server");
var minimist = require('minimist');
// var source = require('vinyl-source-stream');
// var filter = require('gulp-filter');
// var browserify = require('browserify');

var sync = require('browser-sync');

var reload = sync.reload;


//共有路径
var hostDir = path.join('../imama_server/src/main/resources/templates'),
    answerPath = path.join(__dirname, '../imama_server/src/main/resources/templates/answer'),
    imamaClassPath = path.join(__dirname, '../imama_server/src/main/resources/templates/imamaclass'),
    activityPath = path.join(__dirname, '../imama_server/src/main/resources/templates/activity'),
    maternal = path.join(__dirname, '../imama_server/src/main/resources/templates/maternal');


var thirdScripts = thirdLibrary.library.scripts.map(function(iter) {
    return hostDir + iter;
});

var thirdCss = thirdLibrary.library.css.map(function(iter) {
    return hostDir + iter;
});



// gulp.task('index', function() {
//     var jsFilter = filter([answerPath + '**/*.js'], { restore: true });
//     var cssFilter = filter(answerPath + '**/*.css', { restore: true });

//     return gulp.src(answerPath + 'index.html')

//     .pipe(jsFilter)
//         .pipe(uglify()) // 压缩Js
//         .pipe(jsFilter.restore)
//         .pipe(cssFilter)
//         .pipe(csso()) // 压缩Css
//         .pipe(cssFilter.restore)
//         .pipe(rev()) // 重命名文件
//         .pipe(useref({ searchPath: answerPath + '../' })) // 解析html中build:{type}块，将里面引用到的文件合并传过来
//         .pipe(revReplace()) // 重写文件名到html
//         .pipe(gulp.dest(answerPath + '../dist'));
// });

var options = minimist(process.argv.slice(2), { string: 'env', default: { env: process.env.NODE_ENV || 'production' } });

gulp.task('third', ['thirdC'], function() {
    return gulp.src(thirdScripts)
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest(imamaClassPath + '/dist/library/scripts'))
});

gulp.task('thirdC', function() {
    return gulp.src(thirdCss)
        .pipe(concat('all.min.css'))
        .pipe(minify())
        .pipe(gulp.dest(imamaClassPath + '/dist/library/css'))
});

gulp.task('matercss', function() {
    return gulp.src(maternal + '/css/style.css')
        // .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'last 1 version', 'iOS 7'],
            cascade: false
        }))
        .pipe(minify())
        .pipe(gulp.dest(maternal + '/dist/css'))
});

gulp.task('single', function() {
    return gulp.src(path.resolve(hostDir, './static/cdn-local/mqtt.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.resolve(hostDir, './static')))
});

gulp.task('clean', function() {
    gulp.src([imamaClassPath + '/dist/scripts', imamaClassPath + '/dist/css'], { read: false })
        .pipe(clean({ force: true }));
});

/*版本开发*/
gulp.task('begin', function() {
    console.log('当前路径' + imamaClassPath);
    // gulp.src('../mytest/js/mm.js')
    return gulp.src(imamaClassPath + '/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        // .pipe(source('bundle.js'))
        // .pipe(gulpif(options.env === 'dev', sourcemaps.init()))
        .pipe(gulpif(options.env === 'production', uglify()))
        // .pipe(gulpif(options.env === 'dev', sourcemaps.write()))
        .pipe(gulp.dest(imamaClassPath + '/dist/scripts'))
});

/*输出script*/
gulp.task('index', ['sass', 'begin'], function() {
    // var jsFilter = filter([imamaClassPath + 'dist/scripts/main.js'], { restore: true });
    // var cssFilter = filter(imamaClassPath + 'dist/css/*.css', { restore: true });

    console.log('当前路径' + path.resolve(hostDir, "./imamaClassPath"));


    return gulp.src([imamaClassPath + '/dist/scripts/main.js', imamaClassPath + '/dist/css/main.css'], { base: imamaClassPath + '/dist' })
        // .pipe(useref({searchPath: hostDir}))
        // .pipe(jsFilter)
        // .pipe(uglify())
        // .pipe(jsFilter.restore)
        // .pipe(cssFilter)
        // .pipe(cssFilter.restore)
        .pipe(rev())
        .pipe(gulp.dest(imamaClassPath + '/dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(imamaClassPath))

    // .pipe(revReplace())
    // .rename('')     
});

/*样式操作*/
gulp.task('sass', function() {
    return gulp.src(imamaClassPath + '/stylesheets/sass/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'last 1 version', 'iOS 7'],
            cascade: false
        }))
        .pipe(gulp.dest(imamaClassPath + '/dist/css'))

    // .pipe(reload({ stream: true }))
});



/*构建完整项目*/
gulp.task('home', ['clean', 'index'], function() {
    return gulp.src([imamaClassPath + '/rev-manifest.json', imamaClassPath + '/index.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(imamaClassPath))
})










gulp.task('aclean', function() {
    return gulp.src([activityPath + '/dist/scripts', activityPath + '/dist/css'])
        .pipe(clean({ force: true }));
});

/*版本开发*/
gulp.task('abegin', function() {
    console.log('当前路径' + activityPath);
    console.log('我变了')
        // gulp.src('../mytest/js/mm.js')
    return gulp.src(activityPath + '/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        // .pipe(source('bundle.js'))
        .pipe(gulp.dest(activityPath + '/dist/scripts'))
});

/*输出script*/
gulp.task('aindex', ['aclean', 'asass', 'abegin'], function() {
    // var jsFilter = filter([activityPath + 'dist/scripts/main.js'], { restore: true });
    // var cssFilter = filter(activityPath + 'dist/css/*.css', { restore: true });

    console.log('当前路径' + path.resolve(hostDir, "./activityPath"));


    return gulp.src([activityPath + '/dist/scripts/main.js', activityPath + '/dist/css/main.css'], { base: activityPath + '/dist' })
        // .pipe(useref({searchPath: hostDir}))
        // .pipe(jsFilter)
        // .pipe(uglify())
        // .pipe(jsFilter.restore)
        // .pipe(cssFilter)
        // .pipe(cssFilter.restore)
        .pipe(rev())
        .pipe(gulp.dest(activityPath + '/dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(activityPath))

    // .pipe(revReplace())
    // .rename('')     
});

/*样式操作*/
gulp.task('asass', function() {
    return gulp.src(activityPath + '/stylesheets/sass/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'last 1 version', 'iOS 7'],
            cascade: false
        }))
        .pipe(gulp.dest(activityPath + '/dist/css'))

    // .pipe(reload({ stream: true }))
});



/*构建完整项目*/
gulp.task('ahome', ['aindex'], function() {
    return gulp.src([activityPath + '/rev-manifest.json', activityPath + '/index.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest(activityPath))
});
// gulp.task('imaclass', function() {
//     // console.log('路径是' + __dirname);
//     debug = true;
//     // return gulp.src(imamaClassPath + '/scripts/index.js')
//     return gulp.src('../mytest/js/mm.js')
//         // .pipe(webpack(require('./webpack.config.js')))
//         .pipe(webpack({
//             loaders: [
//                 { test: /\.vue$/, loaders: "vue" }
//             ],
//             module: {
//                 loaders: [{
//                     test: /\.js$/,
//                     exclude: /(node_modules|bower_components)/,
//                     loader: 'babel',

//                 }, {
//                     test: /\.vue$/,
//                     loader: 'vue'
//                 }]
//             },
//             babel: {
//                 presets: ['babel-preset-es2015'].map(require.resolve)
//             }
//         }))
//         // .pipe(sourcemaps.init())
//         .pipe(rename('build.js'))
//         .pipe(sourcemaps.write("."))
//         // .pipe(gulp.dest(imamaClassPath));
//         .pipe(gulp.dest('./build'))
// });

gulp.task('serve', function() {
    sync.init(null, {
        // files: 'maternal/css/style.css',
        proxy: 'localhost:8099',
        files: ['public/**/*.*'],
        notify: false,
        // ws: true
    });
});

gulp.task('dev', ['sass', 'begin'], function() {
    sync({
        server: {
            baseDir: path.resolve(hostDir),
            index: "dev.html",
            routes: {
                "/activity": path.resolve(hostDir, "./activity"),
                "/imamaclass": path.resolve(hostDir, "./imamaclass"),
                "/static": path.resolve(hostDir, "./static"),
                "/maternal": path.resolve(hostDir, "./maternal"),
                "/wx-third": path.resolve(hostDir, "./wx-third")
            }
        }
        // routes: {
        //     "/static": imamaClassPath,
        // }
        // proxy: 'localhost:8099',
        // files: ['public/**/*.*'],
        // notify: false,
        // ws: true
    });
    gulp.watch(imamaClassPath + '/stylesheets/sass/**/*.scss', ['sass']);
    // gulp.watch([imamaClassPath + '/**/*.vue', imamaClassPath + '/**/*.js'], ['begin']);
    gulp.watch([imamaClassPath + '/**/*.vue', imamaClassPath + '/index.js', imamaClassPath + '/scripts/**/*.js'], ['begin']);
    gulp.watch([imamaClassPath + '/dist/scripts/main.js', imamaClassPath + '/dist/css/main.css']).on('change', reload);
});