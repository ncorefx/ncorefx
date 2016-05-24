"use strict";

var gulp = require("gulp");
var workspace = require("gulp-npmworkspace");
var rimraf = require("rimraf");
var path = require("path");

gulp.task("install", () => {
    let postInstallActions = [
        workspace.postInstallActions.installTypings(),
        {
            action: (packageDescriptor, packagePath, callback) => {
                rimraf.sync(path.join(packagePath, "./typings/**/browser*"));

                callback();
            }
        }
    ];

    return workspace.workspacePackages()
        .pipe(workspace.npmInstall({ postInstallActions: postInstallActions }));
});

gulp.task("compile", () => {
    return workspace.workspacePackages()
        .pipe(workspace.buildTypeScriptProject());
});

gulp.task("publish", function() {
    return workspace.workspacePackages()
        .pipe(workspace.filter(function (packageDescriptor, packagePath) {
            return !packageDescriptor.private
        }))
        .pipe(workspace.npmPublish({ shrinkWrap: false, bump: "patch", access: "public" }));
});
