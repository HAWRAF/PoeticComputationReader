
/**
 * This class is used to consolidate the execution of bundling functions in
 * response to multiple file changes.
 *
 * @constructor
 */
const Debouncer = function () {
  this.reset();
};

/**
 * Reset the debouncer state.
 *
 * @returns {void}
 */
Debouncer.prototype.reset = function () {
  this.hold = 0;
  this.funcs = {};
};

/**
 * Run the given function for the given key after a delay.  If a key has already been registered with
 * this function it will be overridden with this new one and the original function will not be called.
 *
 * @param {String} key - The key that uniquely identifies the function to run.
 * @param {Function} func - The function to execute after a delay.
 * @returns {void}
 */
Debouncer.prototype.run = function (key, func) {
  this.hold++;
  this.funcs[key] = func;
  setTimeout(() => {
    this.hold--;
    if (!this.hold) {
      Object.getOwnPropertyNames(this.funcs).forEach((name) => {
        this.funcs[name]();
      });
      this.reset();
    }
  }, 250);
};

module.exports = Debouncer;
