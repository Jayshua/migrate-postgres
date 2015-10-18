/******************************************************
   DB
   ==
   This module includes methods for getting the
   database structure as an object, and getting the
   list of currently "installed" migrations from the
   migration revision table.
 ******************************************************/
var log = require("./log")("Database");


/* Query that gets the columns and their table names from the database */
var COLUMNS_QUERY = 
" SELECT                          " +
"      table_name,                " +
"      column_name,               " +
"      data_type                  " +
// "      column_default,            " +
// "      is_nullable,               " +
// "      character_maximum_length   " +
" FROM                            " +
"      information_schema.columns " +
" WHERE                           " +
"      table_schema='public'      ";

/* Query that gets the current migration revision from the database */
/* and creates the revision table if it doesn't exist               */
var REVISIONS_QUERY =
'CREATE TABLE IF NOT EXISTS "pgSchemaRevision" (name bigint primary key);' +
'SELECT * FROM "pgSchemaRevision" ORDER BY name DESC;';


module.exports = {
   /*****************************************************/
   /* Get the tables and columns from the database
   /*****************************************************/
   getSchema: function(client, callback) {
      log.debug("Querying database for revisions");
      
      // Query the database for the column information
      client.query(COLUMNS_QUERY, function(err, response) {
         if (err) {
            callback(err);
            return;
         }

         // Convert the response into an easily usable object
         var responseObject = {};

         response.rows.forEach(function(row) {
            // Ignore the migration revision table
            if (row.table_name === "pgSchemaRevision") return;

            if (typeof responseObject[row.table_name] === 'undefined')
                responseObject[row.table_name] = {};
            
             responseObject[row.table_name][row.column_name] = row.data_type;
         });

         callback(null, responseObject);
      });
   },

   /*****************************************************/
   /* Get the current migration revision from the database
   /*****************************************************/
   getRevisions: function(client, callback) {
      log.debug("Querying database for revisions");

      // Get the list of executed revisions from the database
      client.query(REVISIONS_QUERY, [], function(err, response) {
         if (err) {
            callback(err);
            return;
         }

         log.debug("Current revision is", response.rows[response.rows.length - 1]);

         // Convert the response object into a simple array
         var revisions = response.rows.map(function(row) {
            return row.name;
         });

         callback(err, revisions);
      });
   }
};
