const gulp = require("gulp")
const fileInclude = require("gulp-file-include")
const sass = require("gulp-sass")(require("sass"))
const server = require("gulp-server-livereload")
const clean = require("gulp-clean")
const fs = require("fs")
const sourseMaps = require("gulp-sourcemaps")
const groupMedia = require("gulp-group-css-media-queries")
const plumber = require("gulp-plumber")
const notify = require("gulp-notify")
const webpack = require("webpack-stream")
const babel = require("gulp-babel")

gulp.task("clean", (done) => {
  if (fs.existsSync("./dist/")) {
    return gulp.src("./dist/", { read: false }).pipe(clean({ forse: true }))
  }
  done()
})

const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
}

const pilumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      massage: "Erroe <%= error.massage %>",
      sound: false,
    }),
  }
}

gulp.task("html", () => {
  return gulp
    .src("./src/*.html")
    .pipe(plumber(pilumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(gulp.dest("./dist/"))
})

gulp.task("sass", () => {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(plumber(pilumberNotify("SCSS")))
    .pipe(sourseMaps.init())
    .pipe(sass())
    .pipe(groupMedia())
    .pipe(sourseMaps.write())
    .pipe(gulp.dest("./dist/css/"))
})

gulp.task("images", () => {
  return gulp.src("./src/img/**/*").pipe(gulp.dest("./dist/img/"))
})

// gulp.task("fonts", () => {
//   return gulp.src("./src/fonts/**/*").pipe(gulp.dest("./dist/fonts/"))
// })

gulp.task("files", () => {
  return gulp.src("./src/files/**/*").pipe(gulp.dest("./dist/files/"))
})

gulp.task("js", () => {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber(pilumberNotify("JS")))
    .pipe(babel())
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest("./dist/js/"))
})

const serverOption = {
  livereload: true,
  open: true,
}
gulp.task("server", () => {
  return gulp.src("./dist/").pipe(server(serverOption))
})

gulp.task("watch", () => {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass"))
  gulp.watch("./src/**/*.html", gulp.parallel("html"))
  gulp.watch("./src/img/**/*", gulp.parallel("images"))
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts"))
  gulp.watch("./src/files/**/*", gulp.parallel("files"))
  gulp.watch("./src/js/**/*.js", gulp.parallel("js"))
})

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html", "sass", "images", "fonts", "files", "js"),
    gulp.parallel("server", "watch")
  )
)
