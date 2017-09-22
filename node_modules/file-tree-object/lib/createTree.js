'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');
var TreeNode = require('./treeNode');

/**
 * Translate the given stat info into a node object.  Note that the children of directories
 * will not be read in here.
 */
function createNode(filePath, isDirectory, children) {
  return new TreeNode({
    path: filePath,
    isDirectory: isDirectory,
    isFile: !isDirectory,
    children: children || []
  });
}

/**
 * Check to see if the given node is valid based on passed in options.
 */
function isValidNode(node, opts) {
  if (!opts) {
    return true;
  }
  if (opts.pattern && opts.pattern.test && !opts.pattern.test(node.path)) {
    // check for pattern option
    return false;
  }
  if (node.isFile) {
    // check for file pattern option
    if (opts.filePattern && opts.filePattern.test && !opts.filePattern.test(node.path)) {
      return false;
    }
  }
  if (node.isDirectory) {
    // check for directory pattern option
    if (opts.directoryPattern && opts.directoryPattern.test && !opts.directoryPattern.test(node.path)) {
      return false;
    }
    // check for empty directory option
    if (opts.excludeEmptyDirectories && node.children.length === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Add a node to the given results
 */
function addNode(node, results, opts) {
  if (isValidNode(node, opts)) {
    results.push(node);
  }
}

/**
 * Create a tree of nodes that represent the contents of the given directory.
 */
function createTree(dir, opts, done) {
    var results = [];

    // read the directory contents
    fs.readdir(dir, function(err, list) {
        if (err) {
          return done(err);
        }

        // check for pending directory reads
        var pending = list.length;
        if (!pending) {
          return done(null, []);
        }

        // function that enumerates the content of a directory
        var listContent = function (file) {
          // get the file info
          file = path.resolve(dir, file);
          fs.lstat(file, function (err, stat) {
            if (err) {
              return done(err);
            }

            if (stat && stat.isDirectory()) {
              // process directory
              createTree(file, opts, function(err, res) {
                if (err) {
                  return done(err);
                }
                addNode(createNode(file, true, res), results, opts);
                if (!--pending) {
                  return done(null, results);
                }
              });
            } else {
              // process file
              addNode(createNode(file, false), results, opts);
              if (!--pending) {
                return done(null, results);
              }
            }
          });
        };
        
        // iterate through each child and enumerate it's content
        list.forEach(listContent);
    });
};

/**
 * Turn a directory path into a tree object.
 */
module.exports = function (dir, options, done) {
  var finish = (typeof options === 'function') ? options : (done || function (){});
  var opts = (typeof options === 'function') ? {} : options;

  return new Promise(function (resolve, reject) {
    var file = path.resolve(dir);
    fs.lstat(file, function (err, stat) {
      if (err) {
        finish(err);
        reject(err);
        return;
      }

      if (stat.isDirectory) {
        createTree(file, opts, function (err, result) {
          if (err) {
            finish(err);
            return reject(err);
          }
          var dirNode = createNode(file, true, result);
          finish(null, dirNode);
          resolve(dirNode);
        });
      } else {
        var fileNode = createNode(file, false);
        finish(null, fileNode);
        resolve(fileNode);
      }
    });
  });
}