/******************************************************
  Write Schema
  ============
  This tool queries a postgres database for schema info
  and returns the tables/columns as a yaml file

  Example
  =======
  var writeSchema = require("./writeSchema")("./migrations", "YYYYMMDDmmss", connectionString);

  var currentRevision = moment("")
  writeSchema()
 ******************************************************/
var pg    = require("pg");
var db    = require("./db");
var async = require("async");
var fs    = require("fs");
var yaml  = require("js-yaml");


// Wrap entire system in a function to supply needed constants
module.exports = function(DIR, CONNECTION_STRING) {


/*****************************************************/
/* Main function
/*****************************************************/
var writeSchema = function(callback) {
   pg.connect(CONNECTION_STRING, function(err, client, closeDB) {
      var params = {client: client};

      async.parallel({
         schema: db.getSchema.bind(db, client),
         revisions: db.getRevisions.bind(db, client)
      }, function(err, results) {
         if (err) {
            callback(err);
         } else {
            var data = yaml.safeDump({revision: (results.revisions[0] || 0), tables: results.schema});
            fs.writeFile(DIR + "schema.yml", data, callback);
         }
      });
   });
};


return writeSchema;

}; // Close wrapper function