/***************************************************************************
  Create Migration
  =========================
  This program creates migration directories.

  Example
  =======
  var createMigration = require("./createMigration")("../../migrations");

  createMigration(function(err) {
    ...
  });
***********************************************************************************************/
var async = require("async");
var fs = require("fs");


// Wrap entire system in function to supply needed constants
module.exports = function(DIR) {


/*****************************************************/
/* Main function
/*****************************************************/
var createMigration = function(callback) {
    var dir = DIR + Date.now();

    fs.mkdir(dir, function(err) {
        async.parallel([
            function(done) {
                fs.writeFile(dir + "/up.sql", "-- Write forward migration here\n", done);
            },
            function(done) {
                fs.writeFile(dir + "/down.sql", "-- Write backward migration here\n", done);
            }
        ], function(err) {
          callback(err, dir);
        });
    });
};


return createMigration;

}; // Close wrapping function
