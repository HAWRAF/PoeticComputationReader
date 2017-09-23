'use strict';

const path = require('path');
const fto = require('file-tree-object');

const appBundleName = 'bundle.js';
const appBundleZipName = 'bundle.js.gz';
const packageBundlePattern = /bundle.*\.js$/;
const packageBundleZipPattern = /bundle.*\.js\.gz$/;

/**
 * This class is used to manage bundles that have been created through the registered tasks.
 * To create a new instance of BundleManager call the {@link module:build-bundle~createManager|createManager} function
 * defined in the build-bundle module.
 *
 * @constructor
 * @param {Object} opts - The configuration object.
 * @param {string} opts.inputDir - The root path to the generated bundles.  This should match the outputDir
 *                                 value used with the bundle task.
 * @param {String} opts.baseUrlPath - The base path prepended to the script urls.
 * @param {string} [opts.version] - This should be the same value that was provided to the registerTasks function.
 */
const BundleManager = function (opts) {
  this.inputDir = path.join(opts.inputDir);
  this.baseUrlPath = opts.baseUrlPath || '/';
  this.version = opts.version || '';
  this.appsName = opts.appsName || 'apps';
  this.packagesName = opts.packagesName || 'packages';

  this.reset();
};

/**
 * Format a script tag.
 *
 * @ignore
 * @param {String} fileType - The type of script.  Either 'apps' or 'packages'.
 * @param {TreeNode|String} file - The file to create a script tag for.
 * @returns {String} The script tag.
 */
BundleManager.prototype.formatScriptTag = function (fileType, file) {
  return '<script src="' +
         path.join(this.baseUrlPath,
                   (fileType === this.packagesName ? '' : this.version),
                   fileType,
                   typeof file === 'string' ? file : file.getPathFromRoot())
          .replace(/\\/g, '/') + '" defer></script>';
};

/**
 * Build a single set of script tags.
 *
 * @ignore
 * @param {TreeNode} dir - The app directory to create a tag set for.
 * @param {TreeNode} packDir - The package directory that corresponds to the given dir.
 * @param {Stirng} appName - The name of the app bundle.
 * @param {Array} result - The array to add the resulting script tags to.
 * @returns {void}
 */
BundleManager.prototype.buildScriptTag = function (dir, packDir, appName, result) {
  // add app
  const app = dir.getByPath(appName);
  if (app) {
    result.unshift(this.formatScriptTag(this.appsName, app));
  }
  // add package
  if (packDir) {
    const packagePattern = (appName === appBundleZipName) ? packageBundleZipPattern : packageBundlePattern;
    const packFiles = packDir.getFilesByPattern(packagePattern);
    if (packFiles.length > 0) {
      result.unshift(this.formatScriptTag(this.packagesName, packFiles[0]));
    }
  }
};

/**
 * Build all script tags for the given app.
 *
 * @ignore
 * @param {TreeNode} appsDir - The root apps directory.
 * @param {TreeNode} packagesDir - The root packages directory.
 * @param {TreeNode} dir - The app to create tags for.
 * @param {Boolean} zip - When set to true the tags for the zipped bundles will be returned.  Defaults to false.
 * @param {Array} result - The array to add the resulting script tags to.
 * @returns {void}
 */
BundleManager.prototype.buildScriptTags = function (appsDir, packagesDir, dir, zip, result) {
  if (!dir) {
    return;
  }

  const isRoot = (dir === appsDir);

  // add in framework just before root bundles
  if (isRoot) {
    const appFwkDir = dir.getByPath('framework');
    const packageFwkDir = packagesDir ? packagesDir.getByPath('framework') : null;
    if (appFwkDir) {
      if (zip) {
        this.buildScriptTag(appFwkDir, packageFwkDir, appBundleZipName, result);
      } else {
        this.buildScriptTag(appFwkDir, packageFwkDir, appBundleName, result);
      }
    }
  }

  // get corresponding package directory
  let packDir = null;
  if (isRoot) {
    packDir = packagesDir;
  } else {
    packDir = packagesDir ? packagesDir.getByPath(dir.getPathFromRoot()) : null;
  }

  // add in bundles
  if (zip) {
    this.buildScriptTag(dir, packDir, appBundleZipName, result);
  } else {
    this.buildScriptTag(dir, packDir, appBundleName, result);
  }

  // recurse
  if (!isRoot) {
    this.buildScriptTags(appsDir, packagesDir, dir.parent, zip, result);
  }
};

/**
 * Read in the files that make up the bundles.
 *
 * @ignore
 * @returns {void}
 */
BundleManager.prototype.reset = function () {
  this.manifest = {};
  this.manifestZip = {};
  const tree = fto.createTreeSync(this.inputDir);

  // get apps and packages directories
  const appsDir = tree.getByPath(path.join(this.version, this.appsName));
  if (!appsDir) {
    return;
  }
  const packagesDir = tree.getByPath(this.packagesName);

  // make directories roots
  appsDir.parent = null;
  if (packagesDir) {
    packagesDir.parent = null;
  }

  // loop through all of the apps and build manifest
  appsDir.forEachDirectory(function (dir) {
    // bail if this is a lib bundle
    if (dir.directories.length) {
      return;
    }

    // bail if this is the framework
    if (dir.getPathFromRoot() === path.join(this.version, 'framework')) {
      return;
    }

    // unzipped tags
    const scripts = [];
    this.buildScriptTags(appsDir, packagesDir, dir, false, scripts);
    if (scripts.length) {
      this.manifest[dir.getPathFromRoot().toLowerCase() + path.sep] = scripts;
    }

    // zip tags
    const scriptsZip = [];
    this.buildScriptTags(appsDir, packagesDir, dir, true, scriptsZip);
    if (scriptsZip.length) {
      this.manifestZip[dir.getPathFromRoot().toLowerCase() + path.sep] = scriptsZip;
    }
  }.bind(this), { recurse: true });
};

/**
 * Get the script tags for the given app path.
 *
 * @param {String} appPath - The path for the app to get script tags for.
 * @param {Boolean} zip - When set to true the tags for the zipped bundles will be returned.  Defaults to false.
 * @returns {Array} The script tags for the app or undefined if there isn't an app with the given path.
 */
BundleManager.prototype.getScriptTags = function (appPath, zip) {
  let normPath = path.join(appPath, '/').toLowerCase();
  if (normPath.charAt(0) === path.sep) {
    normPath = normPath.slice(1);
  }

  return zip ? this.manifestZip[normPath] : this.manifest[normPath];
};

module.exports = BundleManager;
