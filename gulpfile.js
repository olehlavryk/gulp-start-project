"use strict";

const gulp = require("gulp"),
    webpack = require("webpack-stream"),
    browsersync = require("browser-sync"),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    rigger = require("gulp-rigger"),
    cleanCSS = require('gulp-clean-css'),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    plumber = require("gulp-plumber");

const dist = "./dist/";

gulp.task("html:build", function () {
    return gulp.src('./src/*.{htm,html,php}')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(dist))
        .pipe(browsersync.stream());
});

gulp.task("build-js", () => {
    return gulp.src("./src/assets/js/main.js")
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'assets/js/main.min.js'
            },
            watch: false,
            devtool: "source-map",
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: false,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist))
        .on("end", browsersync.reload);
});

gulp.task("build-prod-js", () => {
    return gulp.src("./src/assets/js/main.js")
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'assets/js/main.min.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('scss', function () {
    return gulp.src('src/assets/scss/**/styles.scss')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(removeComments())
        .pipe(rename("styles.min.css"))
        .pipe(gulp.dest(`${dist}assets/css`))
        .on("end", browsersync.reload);
});

gulp.task("copy-assets", () => {
    return gulp.src(["./src/assets/**/*.*", '!./src/assets/scss/**/*.scss', '!./src/assets/js/**/*.js'])
        .pipe(gulp.dest(dist + "/assets"))
        .on("end", browsersync.reload);
});

gulp.task('clean', async () => {
    return await del.sync('dist');
});

gulp.task("watch", () => {
    browsersync.init({
        server: "./dist/",
        port: 4000,
        notify: true
    });

    gulp.watch("./src/index.html", gulp.parallel("html:build"));
    gulp.watch("./src/assets/scss/**/*.scss", gulp.parallel("scss"));
    gulp.watch("./src/assets/js/**/*.js", gulp.parallel("build-js"));
    gulp.watch("./src/assets/images/*.*", gulp.parallel("copy-assets"));
    gulp.watch("./src/assets/fonts/*.*", gulp.parallel("copy-assets"));
});

gulp.task("dev", gulp.parallel("clean", "html:build", 'scss', "copy-assets", "build-js"));
gulp.task("prod", gulp.parallel("clean", "html:build", 'scss', "copy-assets", "build-prod-js"));

gulp.task("default", gulp.parallel("watch", "dev"));