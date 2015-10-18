/***************************************************************************
  Schma.js
  ========
  Initializes the schema.js modules with directory and database connection
  string information.
******************************************************************************/

module.exports = function(connectionString, dir) {
    return {
        migrate: require("./migrate")(dir, connectionString),
        writeSchema: require("./writeSchema")(dir, connectionString),
        createMigration: require("./createMigration")(dir)
    };
};
