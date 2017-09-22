'use strict';

var path = require('path');

/**
 * Constructor.
 */
function TreeNode(options) {
  var self = this;
  var opts = options || {};
  this.path = opts.path || '';
  this.isDirectory = opts.isDirectory;
  this.isFile = opts.isFile;
  this.children = opts.children || [];
  this.directories = [];
  this.files = [];
  this.children.forEach(function (element) {
    element.parent = self;
    if (element.isDirectory) {
      self.directories.push(element);
    } else if (element.isFile) {
      self.files.push(element);
    }
  });
}

/**
 * The basename for the path.
 */
TreeNode.prototype.getPathBasename = function () {
  return path.basename(this.path);
}

/**
 * Get the path of this node starting from the root.
 */
TreeNode.prototype.getPathFromRoot = function () {
  var root = this.getRoot();
  return this.path.slice(root.path.length + 1);
}

/**
 * Get the root node of the tree.
 */
TreeNode.prototype.getRoot = function () {
  var root = this;
  while (root.parent) {
    root = root.parent;
  }
  return root;
}

/**
 * Get all children that match the given pattern.
 */
TreeNode.prototype.getChildrenByPattern = function (pattern, options) {
  var opts = options || {};
  opts.negate = (opts.negate === undefined) ? false : opts.negate;
  opts.recurse = (opts.recurse === undefined) ? false : opts.recurse;
  var result = [];

  this.children.forEach(function (element) {
    if (pattern.test(element.path) === !opts.negate) {
      result.push(element);
    }
  }, opts);

  return result;
};

/**
 * Get all child files that match the given pattern.
 */
TreeNode.prototype.getFilesByPattern = function (pattern, options) {
  var opts = options || {};
  opts.negate = (opts.negate === undefined) ? false : opts.negate;
  opts.recurse = (opts.recurse === undefined) ? false : opts.recurse;
  var result = [];

  this.files.forEach(function (element) {
    if (pattern.test(element.path) === !opts.negate) {
      result.push(element);
    }
  }, opts);

  return result;
};

/**
 * Get all child directories that match the given pattern.
 */
TreeNode.prototype.getDirectoriesByPattern = function (pattern, options) {
  var opts = options || {};
  opts.negate = (opts.negate === undefined) ? false : opts.negate;
  opts.recurse = (opts.recurse === undefined) ? false : opts.recurse;
  var result = [];

  this.directories.forEach(function (element) {
    if (pattern.test(element.path) === !opts.negate) {
      result.push(element);
    }
  }, opts);

  return result;
};

/**
 * Get child that has the given path.
 */
TreeNode.prototype.getChildByPath = function (filePath) {
  var relativePath = path.join(this.path, filePath).toLowerCase();
  var absolutePath = filePath.toLowerCase();
  return this.children.find(function (element) {
    var testPath = element.path.toLowerCase();
    return (testPath === absolutePath || testPath === relativePath);
  });
};

/**
 * Get the node with the given path.
 */
TreeNode.prototype.getByPath = function (filePath) {
  var testPath = filePath.toLowerCase();
  var rootPath = this.getRoot().path.toLowerCase();
  if (testPath.indexOf(rootPath) === 0) {
    testPath = testPath.slice(rootPath.length);
  }
  
  var parts = testPath.split(path.sep);
  var child = this;
  for (var i = 0; i < parts.length; i++) {
    if (parts[i]) {
      child = child.getChildByPath(parts[i]);
      if (!child) {
        break;
      }
    }
  }

  return child;
};

/**
 * Iterate through this node and all descendants of this node.
 */
TreeNode.prototype.forEach = function (cb, options) {
  var opts = options || {};
  if (cb(this) === false) {
    return false;
  }

  if (opts.recurse) {
    this.children.forEach(function (element) {
      return element.forEach(cb, options);
    });
  }
};

/**
 * Iterate through this node and all descendant directories.
 */
TreeNode.prototype.forEachDirectory = function (cb, options) {
  var opts = options || {};
  if (this.isDirectory) {
    if (cb(this) === false) {
      return false;
    }
  }

  if (opts.recurse) {
    this.directories.forEach(function (element) {
      return element.forEachDirectory(cb, options);
    });
  }
};

/**
 * Iterate through this node and all descendant files.
 */
TreeNode.prototype.forEachFile = function (cb, options) {
  var opts = options || {};
  if (this.isFile) {
    if (cb(this) === false) {
      return false;
    }
  }

  if (opts.recurse) {
    this.children.forEach(function (element) {
      return element.forEachFile(cb, options);
    });
  }
};

module.exports = TreeNode;
