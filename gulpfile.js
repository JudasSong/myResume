var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var mkdirp = require('mkdirp');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();

/*在全局上定义项目的目录结构，供应后面使用*/
/*var dirs = {
 dist: './dist',
 src: './src',
 css: './src/css',
 js: './src/js',
 img: './src/img',
 font: './src/font',
 };*/

/*全局定义要处理的文件*/
var files = {
    cssFiles: './src/css/*.scss',
    jsFiles: './src/js/*.js',
    imgFiles: './src/img/*.*'
}
/*
 * 创建项目目录
 * */
/*gulp.task('create-directory', function () {
 for (var i in dirs) {
 mkdirp(dirs[i], function (err) {
 err ? console.log(err) : console.log('mkdir-->' + dirs[i]);
 });
 }
 });*/

// 本地服务器功能，自动刷新（开发环境）
gulp.task('server', ['compressCSS', 'uglifyJS'], function () {
    var reload = browserSync.reload;
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    //监视src/css文件夹中的所有scss文件，有改动就调用compressCSS任务编译scss
    gulp.watch(files.cssFiles, ['compressCSS']);

    //监视src/img文件夹中的所有文件，有改动就调用imageMin任务压缩
    // gulp.watch(files.imgFiles, ['imageMin']);

    //监视src/js文件夹中所有js文件有改动就调用uglifyJS任务压缩并且刷新浏览器
    gulp.watch(files.jsFiles, ['uglifyJS']);
    gulp.watch(files.jsFiles).on('change', reload);

    //监视html文件，有改动就刷新浏览器
    gulp.watch('./*.html').on('change', reload);
});

/*
 * 编译scss
 * */
gulp.task('compressCSS', function () {
    gulp.src('src/css/*.scss')
        .pipe(sass())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(minifyCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

/*
 * js文件--合并--压缩(生产环境) task('js-concat-compress')
 * */
gulp.task('uglifyJS', function (cb) {
    var name = ''; //先定义一个变量将用于后面存文件名

    return gulp.src(files.jsFiles)
    // .pipe(rename(function (path) {
    //     path.basename += '';
    //     name = path.basename;
    // }))
    // .pipe(concat('bundle.js'))   //合并js文件
        .pipe(uglify())         //压缩js文件
        // .pipe(rename(function (path) {
        //     path.basename = name + '.' + path.basename + '.min';  //改文件名加上 .min
        // }))
        .pipe(gulp.dest('./dist/js/'));
});

/*
 * 图片无损压缩
 * */
gulp.task('imageMin', function () {
    return gulp.src(files.imgFiles)
        .pipe(imagemin())  //imagemin()里是可以写参数的，有需要的可以去github的页面看看
        .pipe(gulp.dest('./dist/img/'))
});

/*
 * 添加浏览器私有前缀（生产环境）
 * */
gulp.task('autoprefixer', function () {
    var postcss = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');
    return gulp.src(files.cssFiles)
        .pipe(sourcemaps.init()) //添加sourcemap,方便调试
        .pipe(postcss([autoprefixer()])) //添加浏览器私有前缀，解决浏览器的兼容问题
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'))
});

/*
 * 清理dist
 * */
gulp.task('clean-dist', function () {
    return gulp.src([
        './dist/css',
        './dist/js',
        './dist/img',
        '!./dist/font',
    ], {read: false})
        .pipe(clean());
});

/*
 * 项目打包(生产环境)
 * 这里需要注意的是，在写要打包的文件时，避免打包的文件不能写在开头，
 * 这里'!**!/node_modules/!**!/!*.*'放在了最后
 * */
/*gulp.task('zip', function () {
 return gulp.src(['./!*.html', '**!/dist/!**!/!*.*', '!**!/node_modules/!**!/!*.*'])
 .pipe(zip('project.zip'))   //打包后的文件名，自己随意取
 .pipe(gulp.dest('./'))
 });*/


/* ------------------------------开发阶段命令---------------------------------------- */
// gulp.task('start', ['create-directory']); //项目初始化的第一个命令
gulp.task('dev-watch', ['server']); //开始编写项目后开启服务器实时更新

/* -------------------------------生产阶段命令--------------------------------------- */
// gulp.task('prefixer', ['autoprefixer']); //给css文件添加浏览器私有前缀 files.cssFiles ==>> ./dist/css/
// gulp.task('minifyCss', ['compressCSS']); //压缩css文件 files.cssFiles ==>> ./dist/css/
// gulp.task('uglifyJs', ['uglifyJS']); //合js文件  files.jsFiles ==>> ./dist/js/
// gulp.task('imgMin', ['imageMin']) //处理图片，对图片进行无损的压缩

/* ------------------------------一键生成项目文件命令------------------------------ */
/*
 * 因为gulp执行任务时是以最大的任务并发数同时进行的，所以有时候我们需要按步骤进行，
 * 就需要插件`gulp-sequence`，将任务按顺序写入，就会按顺序执行
 * */
// var runSequence = require('gulp-sequence').use(gulp);
// gulp.task('bunld-project', runSequence('clean-dist', 'compressCSS', 'autoprefixer', 'uglifyJS', 'imageMin', 'zip'))