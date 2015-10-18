/******************************************************
   Log
   ===
   Provides vary basic console logging. Other modules
   require it providing their name and it prefixes
   all of their logs with the name. It also proxies
   debug logs and doesn't execute them if global.DEBUG
   isn't set. Also it provides nice colors.
 ******************************************************/
var chalk = require("chalk");

module.exports = function(prefix) {
    return {
        /************************************/
        /* Print info logs with a blue prefix
        /************************************/
        info: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(chalk.blue(prefix + ":"));

            console.log.apply(console, args);
        },

        /************************************/
        /* Print debug logs with a green prefix
        /* if global.DEBUG is true
        /************************************/
        debug: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(chalk.green(prefix + ":"));

            if (global.DEBUG) {
                console.log.apply(this, args);
            }
        },

        /************************************/
        /* Print error logs with a red prefix
        /************************************/
        error: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(chalk.red("ERR:"));

            this.info.apply(this, args);
        }
    };
};