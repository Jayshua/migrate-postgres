/******************************************************
  Migrate
  =======
  Performs migrations on a postgres database based on
  the migrations defined in a folder.


  Usage
  =====
  Constructor function arguments:
  * DIR - The directory the migrations are stored
  * CONNECTION_STRING - The connection string to connect
                  to the postgres database with

  Expects a directory of migration folders named with
  their creation date as a standard UNIX timestamp. Each
  directory should have an up.sql (which modifies the
  database to the desired setup) and a down.sql which
  undoes the changes.


  Example
  =======
  var migrate = require("./migrate")(dir, connectionString);
  
  var currentSchemaRevision = schema.revision;  // See writeSchema.js
  var desiredRevision = Date.now();

  migrate(currentSchemaRevision, desiredRevision, function(err, result) {
   ...
  });
 ******************************************************/
var pg     = require("pg");
var async  = require("async");
var fs     = require("fs");
var log    = require("./log")("Migrate");


// Wrap entire system in constructor to pass in needed constants
module.exports = function(DIR, CONNECTION_STRING) {



/*****************************************************/
/* Get the list of migrations
/*****************************************************/
var listMigrations = function(params, callback) {
   log.debug("Loading", DIR);
   
   fs.readdir(DIR, function(err, result) {
      log.debug("Found", result.join(", "));

      params.migrations = result;
      callback(err, params);
   });
};

/*****************************************************/
/* Query the database for the current database revision
/*****************************************************/
var getCurrentRevision = function(params, callback) {
   var query = 'CREATE TABLE IF NOT EXISTS "pgSchemaRevision" (name bigint primary key);' +
               'SELECT * FROM "pgSchemaRevision" ORDER BY name DESC LIMIT 1;';

   log.debug("Querying database for current revision");

   params.client.query(query, [], function(err, result) {
      if (err) {
         callback(err);
      } else {
         params.currentRevision = (result.rows.length > 0) ? parseInt(result.rows[0].name, 10) : 0;
         params.direction = (params.desiredRevision > params.currentRevision) ? "up" : "down";

         log.debug("Current Revision is", params.currentRevision);
         log.debug("Migration direction is", params.direction);

         callback(null, params);
      }
   });
};

/*****************************************************/
/* Filter migrations for only directories that are
/* within the desired date range.
/*****************************************************/
var filterMigrations = function(params, callback) {
   log.debug("Filtering migrations");

   // Remove files from the directory listing
   async.filter(params.migrations, function(migration, callback) {

      fs.stat(DIR + migration, function(err, stat) {
         if (err) callback(false);
         else callback(stat.isDirectory());
      });

   }, function(migrationFiles) {

      // Now filter for desired migrations based date range
      params.migrations = migrationFiles.filter(function(migrationDate) {
         if (params.direction === "up") {
            // The single > amid all the >= and <= is intentional. We don't want to run
            // a migration if it has already been run.
            return (migrationDate > params.currentRevision) && (migrationDate <= params.desiredRevision);
         } else {
            return (migrationDate >= params.desiredRevision) && (migrationDate <= params.currentRevision);
         }
      });

      log.debug("Filtered Migrations:", (params.migrations.join(", ") || "No migrations!"));

      callback(null, params);

   });
};

/*****************************************************/
/* Read migration files from disc
/*****************************************************/
var getMigrations = function(params, callback) {
   log.debug("Reading migrations files");

   // Determine which file to get based on migration direction
   var fileNames = params.migrations.map(function(migration) {
      return migration + "/" + params.direction + ".sql";
   });

   // Read in the files
   async.map(fileNames, function(file, callback) {
      fs.readFile(DIR + file, "utf8", callback);
   }, function(err, migrationFiles) {
      params.migrationStatements = migrationFiles;
      log.debug("Read", migrationFiles.length, "Files");
      callback(err, params);
   });
};

/*****************************************************/
/* Run the migrations
/*****************************************************/
var executeMigrations = function(params, callback) {
   log.debug("Executing migrations");

   async.each(params.migrationStatements, function(migration, callback) {
      params.client.query(migration, [], callback);
   }, function(err, result) {
      callback(err, params);
   });
};

/*****************************************************/
/* Update the database with the migrations
/*****************************************************/
var updateDatabase = function(params, callback) {
   log.debug("Updating database revision record");

   var insertQuery = params.migrations.reduce(function(mem, migration) {
      return mem + 'INSERT INTO "pgSchemaRevision" VALUES (' + migration + ');';
   }, "");

   var dropQuery = params.migrations.reduce(function(mem, migration) {
      return mem + 'DELETE FROM "pgSchemaRevision" WHERE name=' + migration + ';';
   }, "");

   if (params.direction === "up") {
      log.debug("Running insert query:", (insertQuery || "No query"));

      params.client.query(insertQuery, [], function(err, result) {
         callback(err, params);
      });
   } else {
      log.debug("Running drop query:", (dropQuery || "No query"));

      params.client.query(dropQuery, [], function(err, result) {
         callback(err, params);
      });
   }
};


/*****************************************************/
/* Main Function
/*****************************************************/
var migrate = function(desiredRevision, callback) {


   pg.connect(CONNECTION_STRING, function(err, client, closeDB) {
      if (err) {
         closeDB();
         callback(err);
         return;
      }

      var params = {
         client: client,
         desiredRevision: desiredRevision
      };

      async.waterfall([
         // Get the list of migrations
         listMigrations.bind(null, params),

         // Get the current database version
         getCurrentRevision,

         // Filter for relevant migrations
         filterMigrations,

         // Get the actual migration files
         getMigrations,

         // Execute migrations
         executeMigrations,

         // Write updated migrations to database
         updateDatabase
      ], function(err, params) {
         closeDB();
         delete params.client;
         callback(err, params);
      });

   });
};


// Return the main function
return migrate;

}; // Close wrapping function
