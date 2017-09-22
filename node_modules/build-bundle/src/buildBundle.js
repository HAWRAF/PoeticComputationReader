#!/usr/bin/env node

/**
 * Does bundling.
 *
 * @module build-bundle
 */
'use strict';

const path = require('path');
const zlib = require('zlib');
const fs = require('fs');
const del = require('del');
const chokidar = require('chokidar');
const browserify = require('browserify');
const minifyify = require('minifyify');
const fto = require('file-tree-object');
const Debouncer = require('./debouncer');

const argsv = require('minimist')(process.argv.slice(2));

const appsPattern = /\.app\.js$/;
const appsOrPackagePattern = /(\.app\.js$)|([\\\/]package\.js$)/;
const frameworkPattern = /^framework[\\\/]/;

const debouncer = new Debouncer();

/**
 * Create the path for an exposed module.
 *
 * @ignore
 * @param {String} baseDir - The base directory for the path.
 * @param {String} relativePath - The relative path to the file.
 * @return {String} The path to use for the exposed module.
 */
function exposePath(baseDir, relativePath) {
  return (process.platform === 'win32') ?
    '/' + path.join(baseDir, relativePath).slice(1) :
    path.join(baseDir, relativePath);
}

/**
 * Returns the path property of the given file.
 *
 * @ignore
 * @param {String} file - The file to read the path property from.
 * @returns {String} The path property of the file.
 */
function toPath(file) {
  return file.path;
}

/**
 * Read in a package object.
 *
 * @ignore
 * @param {String|TreeNode} file - The file to read in the package from.
 * @returns {Package} The package object that was read in.
 */
function readInPackage(file) {
  let pack = null;
  if (file.path) {
    pack = require(file.path);
  } else {
    pack = require(file);
  }

  return pack.default || pack;
}

/**
 * Get all of the require values found in packages that are the parent of the given folder.
 *
 * @ignore
 * @param {TreeNode} dir - The folder to get parent require values for.
 * @param {Boolean} includeDir - If set to true then any package in the dir folder will be included.
 * @returns {Array} An array of the require values.
 */
function getParentPackageRequires(dir, includeDir) {
  const result = [];
  const addToResult = function (packModule) { result.push(packModule.require); };
  let frameworkFlag = false;

  // traverse up the tree
  let parent = includeDir ? dir : dir.parent;
  while (parent) {
    if (parent.getPathFromRoot() === 'framework') {
      frameworkFlag = true;
    }
    const parentPack = parent.getChildByPath('package.js');
    if (parentPack) {
      const parentPackInfo = readInPackage(parentPack);
      if (parentPackInfo.modules) {
        parentPackInfo.modules.forEach(addToResult);
      }
    }
    parent = parent.parent;
  }

  // exlude packages found in the framework
  if (!frameworkFlag && dir.getPathFromRoot() !== 'framework') {
    const frameworkDir = dir.getRoot().getChildByPath('framework');
    if (frameworkDir) {
      const pack = frameworkDir.getChildByPath('package.js');
      if (pack) {
        const packData = readInPackage(pack);
        if (packData.modules) {
          packData.modules.forEach(addToResult);
        }
      }
    }
  }

  return result;
}

/**
 * Bundle the given directory into an app.
 *
 * @ignore
 * @param {TreeNode} dir - The directory to bundle into an app.
 * @param {Object} opts - The options.
 * @param {Function} cb - The callback function to execute when complete.
 * @returns {void}
 */
function bundleApp(dir, opts, cb) {
  const done = cb || function () {};
  const outputPath = path.join(opts.input.appsOutputDir, dir.getPathFromRoot());
  let apps = null;
  let libs = null;
  const externals = [];
  const addToExternals = function (file) { externals.push(file); };

  if (dir === opts.framework.dir) {
    // if this is the framework folder collect all files underneath it
    apps = opts.framework.apps;
    libs = opts.framework.libs;
  } else if (frameworkPattern.test(dir.getPathFromRoot())) {
    // bail if we are in a folder under the framework
    done();
    return;
  } else {
    // collect just the files in this folder
    apps = dir.getFilesByPattern(appsPattern);
    libs = dir.getFilesByPattern(appsOrPackagePattern, { negate: true });
    Array.prototype.push.apply(externals, opts.framework.libs);
  }

  // check for any apps defined in a package.js file
  const packageFile = dir.getByPath('package.js');
  if (packageFile) {
    let packageData = require(packageFile.path);
    if (packageData.default) {
      packageData = packageData.default;
    }
    if (packageData.app) {
      const appPaths = Array.isArray(packageData.app) ? packageData.app : [packageData.app];
      appPaths.forEach(function (appPath) {
        apps.push({
          path: path.resolve(dir.path, appPath)
        });
      });
    }
  }

  // collect list of files to exclude
  let parent = dir.parent;
  while (parent) {
    // bail if a parent app is found
    if (parent.getFilesByPattern(appsPattern).length > 0) {
      done();
      return;
    }
    const parentPackageFile = parent.getByPath('package.js');
    if (parentPackageFile) {
      let parentPackageData = require(parentPackageFile.path);
      if (parentPackageData.default) parentPackageData = parentPackageData.default;
      if (parentPackageData.app) {
        done();
        return;
      }
    }
    // collect list of files
    parent.files.forEach(addToExternals);
    parent = parent.parent;
  }

  // don't bundle if there aren't any files
  if (!apps.length && !libs.length) {
    done();
    return;
  }

  // configure the bundler
  const bundler = browserify({
    debug: true,
    builtins: false,
    detectGlobals: false
  });
  bundler.plugin(minifyify, {
    map: 'bundle.js.map',
    output: path.join(outputPath, 'bundle.js.map')
  });

  // excluded files and packages
  bundler.external(externals.map(toPath));
  bundler.external(getParentPackageRequires(dir, true));

  if (apps.length > 0) {
    // entry point modules
    bundler.add(apps.map(toPath));
  } else {
    // exported modules
    libs.forEach(function (file) {
      bundler.require(file.path, { expose: exposePath(opts.input.baseOutputDir, file.getPathFromRoot()) });
    });
  }

  // report a bundling error
  const results = [];
  const finish = err => {
    results.push(err);
    if (results.length === 2) {
      done(results[0] || results[1]);
    }
  };

  // bundle
  bundler.bundle((bundleError, buf) => {
    if (bundleError) {
      done(bundleError);
    } else {
      // create output
      fs.writeFile(path.join(outputPath, 'bundle.js'), buf, finish);
      // create compressed output
      zlib.gzip(buf, (zipError, zipBuf) => {
        if (zipError) {
          finish(zipError);
        } else {
          fs.writeFile(path.join(outputPath, 'bundle.js.gz'), zipBuf, finish);
        }
      });
    }
  });
}

/**
 * Bundle the given directory into a package.
 *
 * @ignore
 * @param {TreeNode} dir - The directory to bundle into a package.
 * @param {Object} opts - The options.
 * @param {Function} cb - The callback function to execute when complete.
 * @returns {void}
 */
function bundlePackage(dir, opts, cb) {
  const done = cb || function () {};
  const outputPath = path.join(opts.input.packagesOutputDir, dir.getPathFromRoot());

  // read in package info
  const pack = dir.getChildByPath('package.js');
  if (!pack) {
    done();
    return;
  }
  const packData = readInPackage(pack);
  if (!packData.modules || !packData.modules.length) {
    done();
    return;
  }
  const bundleName = 'bundle' + (packData.version ? '-' + packData.version : '') + '.js';

  // configure the bundler
  const bundler = browserify({ debug: true, builtins: false, detectGlobals: false });
  bundler.plugin(minifyify, {
    map: bundleName + '.map',
    output: path.join(outputPath, bundleName + '.map')
  });

  // exclude parent packages
  bundler.external(getParentPackageRequires(dir));

  // add packages
  packData.modules.forEach(function (packModule) {
    bundler.require(packModule.require);
    if (packModule.init) {
      bundler.add(require.resolve(packModule.init));
    }
  });

  // report a bundling error
  const results = [];
  const finish = err => {
    results.push(err);
    if (results.length === 2) {
      done(results[0] || results[1]);
    }
  };

  // bundle
  bundler.bundle((bundleError, buf) => {
    if (bundleError) {
      done(bundleError);
    } else {
      // create output
      fs.writeFile(path.join(outputPath, bundleName), buf, finish);
      // create compressed output
      zlib.gzip(buf, (zipError, zipBuf) => {
        if (zipError) {
          finish(zipError);
        } else {
          fs.writeFile(path.join(outputPath, bundleName + '.gz'), zipBuf, finish);
        }
      });
    }
  });
}

/**
 * Bundle either apps or packages.
 *
 * @ignore
 * @param {Function} fn - The bundle function to execute.  Either bundleApps or bundlePackages.
 * @param {TreeNode} tree - The tree to bundle.
 * @param {Object} opts - Options to pass to the bundle functions.
 * @param {Function} cb - The call back function to execute when done.
 * @returns {void}
 */
function bundleStart(fn, tree, opts, cb) {
  const done = cb || function () {};

  // determine the number of directories that will be processed
  let pending = 0;
  tree.forEachDirectory(function () { pending ++; }, { recurse: opts.recurse });
  if (!pending) {
    done();
    return;
  }

  // define the function that is called after each app is bundled
  const bundleDone = function (err) {
    if (err) {
      done(err);
      return;
    }
    if (!--pending) {
      done();
    }
  };

  // collect framework fies as they will be used repeatedly
  const fwk = {
    apps: [],
    libs: [],
    dir: tree.getRoot().getChildByPath('framework') || fto.createTreeSync(opts.input.frameworkDir, { ignoreError: true })
  };
  if (fwk.dir) {
    fwk.dir.forEachDirectory(function (folder) {
      Array.prototype.push.apply(fwk.apps, folder.getFilesByPattern(appsPattern));
      Array.prototype.push.apply(fwk.libs, folder.getFilesByPattern(appsOrPackagePattern, { negate: true }));
    }, { recurse: true });
  }

  // enumerate through each directory and kick off bundle function
  tree.forEachDirectory(function (dir) {
    fn(dir, { input: opts.input, framework: fwk }, bundleDone);
  }, { recurse: opts.recurse });
}

/**
 * Determine the folder that should be bundled for the given tree node.
 *
 * @ignore
 * @param {TreeNode} treeNode - The tree node to check.
 * @return {String} The tree node that should be bundled.
 */
function getNodeForBundle(treeNode) {
  // any framework files should be bundled with the framework folder
  if (treeNode.getPathFromRoot().indexOf(path.normalize('framework/')) === 0) {
    return treeNode.getRoot().getChildByPath('framework');
  }

  // any files that fall under an app folder should be bundled with the app
  let currentNode = treeNode;
  while (currentNode) {
    if (currentNode.getChildrenByPattern(appsPattern).length > 0) {
      return currentNode;
    }

    const packageNode = currentNode.getChildByPath('package.js');
    if (packageNode) {
      const packageInfo = require(packageNode.path);
      if (packageInfo.app) {
        return currentNode;
      }
    }

    currentNode = currentNode.parent;
  }

  // default to a lib folder
  return treeNode.isDirectory ? treeNode : treeNode.parent;
}

/**
 * Respond to a change event.
 *
 * @ignore
 * @param {Object} input - The input generated from the bundle function.
 * @param {String} file - The file that was changed.
 * @param {String} event - The type of change that occured.
 * @param {Function} [cb] - Called when this function is done.  It will be passed an error if one occured.
 * @returns {void}
 */
function bundleChanged(input, file, event, cb) {
  const done = cb || function () {};

  // ignore files that begin with a dot
  if (path.basename(file)[0] === '.') {
    return;
  }

  // create tree of directories
  fto.createTree(input.inputDir, { filePattern: /\.js$/ })
    .then(function (tree) {
      // get the tree node
      const treeNode = tree.getByPath(event === 'unlink' ? path.dirname(file) : file);
      if (!treeNode) {
        throw new Error('Could not find node in tree.');
      }

      // bundle
      const bundleNode = getNodeForBundle(treeNode);
      debouncer.run(bundleNode.path, () => {
        fto.createTree(input.inputDir, { filePattern: /\.js$/ })
          .then(currentTree => {
            const currentBundleNode = currentTree.getByPath(bundleNode.path);
            if (currentBundleNode) {
              bundleStart(bundleApp, currentBundleNode, { input, recurse: false }, done);
            }
          });
      });
    })
    .catch(function (err) {
      done(err);
    });
}

/**
 * Watch for changes to files that will cause a bundle to be created.
 *
 * @ignore
 * @param {Object} input - The input for the function that was generated by the bundle function.
 * @return {void}
 */
function bundleWatch(input) {
  const done = function (err) {
    if (err) {
      console.error('Bundle Error: ' + err);
    }
  };

  const watcher = chokidar.watch(path.join(input.inputDir, '**/*.js'), {
    ignored: /[\/\\]\./,
    persistent: true
  });

  watcher.on('ready', () => {
    watcher.on('add', file => { bundleChanged(input, file, 'add', done); });
    watcher.on('change', file => { bundleChanged(input, file, 'change', done); });
    watcher.on('unlink', file => { bundleChanged(input, file, 'unlink', done); });
  });
}

/**
 * Generate bundles.
 *
 * @param {Object} options - Options for bundling.
 * @param {String} options.inputDir - The folder to bundle app code from.
 * @param {String} options.outputDir - The output for the bundled code.
 * @param {String} [options.emit] - Select the type of bundles to create.  Choose between app, package, or both.  Defaults to both.
 * @param {Boolean}[options.clean] - If set to false the output directory will not be deleted first.  Defaults to true.
 * @param {String} [options.version] - An optional version number to output apps code into within the outputDir.
 * @param {String} [options.appsName] - An optional name to give to the folder for app output.
 * @param {String} [options.packagesName] - An optional name to give to the folder for package output.
 * @param {Boolean}[options.watch] - If set to true then a watch will be started that responds to changes in files.
 * @param {Function} [cb] - The function to call when this one finishes.  If an error occured it will be passed to the function.
 * @returns {void}
 */
function bundle(options, cb) {
  const opts = options || {};
  const done = cb || function () {};
  const input = {
    inputDir: path.resolve(opts.inputDir),
    outputDir: path.resolve(opts.outputDir),
    version: opts.version,
    emit: opts.emit || 'both',
    clean: (typeof opts.clean === 'undefined') ? true : opts.clean,
    watch: opts.watch
  };

  input.appsOutputDir = input.outputDir;
  if (opts.version) {
    input.appsOutputDir = path.join(input.appsOutputDir, opts.version);
  }
  input.appsOutputDir = path.join(input.appsOutputDir, opts.appsName || 'apps');

  input.packagesOutputDir = path.join(input.outputDir, opts.packagesName || 'packages');
  input.frameworkDir = path.join(input.inputDir, 'framework');
  input.baseOutputDir = input.inputDir.slice(process.cwd().length);

  if (input.watch) {
    // watch for changes
    bundleWatch(input);
  } else {
    // report results
    const finishResults = (input.emit === 'both') ? [null] : [];
    const finish = (err) => {
      finishResults.push(err);
      if (finishResults.length === 2) {
        done(finishResults[0] || finishResults[1]);
      }
    };

    // create tree of directories and then bundle them
    fto.createTree(input.inputDir, { filePattern: /\.js$/ })
      .then(function (tree) {
        if (input.emit === 'app' || input.emit === 'both') {
          if (input.clean) {
            del.sync(input.appsOutputDir);
          }
          bundleStart(bundleApp, tree, { input, recurse: true }, finish);
        }
        if (input.emit === 'package' || input.emit === 'both') {
          if (input.clean) {
            del.sync(input.packagesOutputDir);
          }
          bundleStart(bundlePackage, tree, { input, recurse: true }, finish);
        }
      })
      .catch(function (err) {
        done(err);
      });
  }
}

// get version from package.json
if (argsv.m && !argsv.v) {
  try {
    argsv.v = (typeof argsv.m === 'string') ?
      JSON.parse(fs.readFileSync(argsv.m)).version :
      JSON.parse(fs.readFileSync('./package.json')).version;
  } catch (err) {
    console.error(err);
    return 1;
  }
}

if (argsv._.length !== 1 || !argsv.o) {
  //
  // print help info if args are missing
  //
  console.log('Usage: build-bundle <dir> -o <output directory> [-e <app|package|both>]');
  console.log('                    [-m [<package.json]] [-v <version>] [-a <name>] [-p <name>] [-w] [-k]');
  console.log('');
  console.log('Options:');
  console.log('<dir>\t The directory that contains all of the code to bundle.');
  console.log('-a\t A name to include in the app bundles output path.  Defaults to apps.');
  console.log('-e\t The type of bundles to emit.  Defaults to both.');
  console.log('-k\t When this option is specified the output folder will not be deleted before bundles are emitted.');
  console.log('-m\t Read in the version number from a package.json file.  If a file isn\'t specified the package.json in the cwd will be used.');
  console.log('-o\t The directory to emit bundles to.');
  console.log('-p\t A name to include in the package bundles output path.  Defaults to packages.');
  console.log('-v\t A version number to include in the output path.');
  console.log('-w\t When present the files specified in the glob pattern(s) will be watched for changes and copied when they do change.');
  process.exitCode = 1;
} else {
  //
  // bundle files specified and optional begin watch
  //
  bundle({
    inputDir: argsv._[0],
    outputDir: argsv.o,
    emit: argsv.e,
    clean: !argsv.k,
    version: argsv.v,
    appsName: argsv.a,
    packagesName: argsv.p,
    watch: argsv.w
  }, (err) => {
    if (err) {
      console.error('Bundle Error: ' + err);
      process.exitCode = 1;
    }
  });
}
