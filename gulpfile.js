"use strict";

const gulp = require("gulp");
const workspace = require("gulp-npmworkspace");

gulp.task("install", () => {
    return workspace.workspacePackages()
        .pipe(workspace.npmInstall())
        .pipe(workspace.buildTypeScriptProject());
});

gulp.task("compile", () => {
    return workspace.workspacePackages()
        .pipe(workspace.buildTypeScriptProject());
});

gulp.task("publish", function() {
    return workspace.workspacePackages()
        .pipe(workspace.npmPublish({ shrinkWrap: false, bump: "patch", access: "public" }));
});
