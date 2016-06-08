var gulp = require('gulp');
var electron = require('gulp-electron');
var packageJson = require('./package.json');

gulp.task('electron', function() {

    gulp.src("./src")
    .pipe(electron({
        src: './src',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        version: 'v1.2.1',
        packaging: true,
        token: '5c101a3ef621bb3f5f71f6e7ca4de5797f1f82a7', /** global: $GH_TOKEN2 process.env.GH_TOKEN2*/
        platforms: ['darwin-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                icon: './TTIcon.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'gulp-electron.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});