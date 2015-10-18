#!/usr/bin/env node

/***************************************************************************
   Postgres Schema Migration
   =========================
   Author: Jayshua Nelson
   Date: 8/25/2015
   License: MIT

   Provides a CLI for the schema.js api.
******************************************************************************/
var commander = require("commander");
var schema = require("./schema");
var log = require("./log")("CLI");


/*****************************************************/
/* Set up the debug state and the schema constants
/* and prints the program heading.
/*****************************************************/
var initWrapper = function(func) {
   return function() {
      if (commander.debug) global.DEBUG = true;

      schema = schema(commander.database, commander.folder || "./");
      console.log("\n========= pg-migrate ============");
      func.apply(null, arguments);
   };
};

/*****************************************************/
/* Create a migration folder
/*****************************************************/
var createMigration = function() {
   schema.createMigration(function(err, name) {
      if (err) {
         log.error("Error Creating Migration:", err.message);
      } else {
         log.info("Created migration at:", name);
      }
   });
};

/*****************************************************/
/* Migrate the database to the date given, or the
/* current date if not date is given
/*****************************************************/
var migrate = function(date) {
   if (typeof commander.database === "undefined") {
      log.error("Required option --database not found");
      return;
   }

   date = (date) ? parseInt(date, 10) : Date.now();

   log.info("Migrating to", date);
   log.info("Database:", commander.database);

   schema.migrate(date, function(err, result) {
      if (err) {
         log.error("Error running migrations:", err.message);
      } else {
         if (result.migrations.length === 0) {
            log.error("No migrations to run");
         } else {
            log.info("Migration direction:", result.direction);
            log.info("Ran migrations:", result.migrations.join(", "));
            log.info("Current Revision is", result.migrations[result.migrations.length - 1]);
         }

         writeSchema();
      }
   });
};

/*****************************************************/
/* Write the database schema to disc
/*****************************************************/
var writeSchema = function() {
   schema.writeSchema(function(err, file) {
      if (err) {
         log.error("Error writing schema:", err.message);
      } else {
         log.info("Wrote schema to ./schema.yml");
      }
   });
};


/*****************************************************/
/* Main program
/*****************************************************/
commander
   .version("1.0.0")
   .option("-d, --database <connection string>", "Set the url to connect to postgres at")
   .option("-D, --debug", "Show debug info")
   .option("-f, --folder <path>", "Set the path of the migrations folder")
   .option("-c, --configuration <file>", "Specify a config file giving the database and folder configuration")

commander
   .command("migrate [date]")
   .description("Migrate to the specified date, or the current date if not given")
   .action(initWrapper(migrate));

commander
   .command("create")
   .description("Create a migration folder with up.sql and down.sql files")
   .action(initWrapper(createMigration));

commander
   .command("write")
   .description("Write the database schema out to a .yml file")
   .action(initWrapper(writeSchema));

commander.parse(process.argv);