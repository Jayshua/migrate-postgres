
This is a cli tool used for updating and rolling back a Postgres database based on sql files that define forward and backward changes. (Think Ruby on Rails Active Record Migrations)

## Installation
`npm install -g migrate-postgres`

## Usage
migrate-postgres [options] [command]

Commands:

    migrate [date]  Migrate to the specified date, or the current date if not given
    create          Create a migration folder with up.sql and down.sql files
    write           Write the database schema out to a .yml file

Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -d, --database <connection string>  Set the url to connect to postgres at __Required__
    -D, --debug                         Show debug info


## Defining Migrations
This tool looks in the current folder for directories containing migration files. The directories should be named with their creation date in standard UNIX timestamp. (Use `migrate-postgres create` to create a correctly formatted directory.) Each directory should contain an `up.sql` and a `down.sql` file.

`up.sql` contains the sql statements needed to bring the database to this revision

`down.sql` contains the sql statements required to undo the changes created in `up.sql`


## Examples
Given and empty database and a directory like

    migrations
    +--- 1445047047153
    |     \-- up.sql
    |     \-- donw.sql
    |
    +--- 1445047144775
          \-- up.sql
          \-- down.sql


Running `migrate-postgres -d "postgres://user:password@localhost.dev/database migrate` will execute the files up.sql in both directories.

Following that with `migrate-postgres -d "postgres://user:password@localhost.dev/database migrate 0` will execute the files down.sql in both directories, resulting again in an empty database. (Assuming down.sql is correctly specified in both directories.)

Running `migrate-postgres create` will result in a directory structure like

    migrations
    +--- 1445047047153
    |     \-- up.sql
    |     \-- donw.sql
    |
    +--- 1445047144775
    |     \-- up.sql
    |     \-- down.sql
    +--- 1445127772215
          \-- up.sql
          \-- down.sql

(Where 1445127772215 is the current timestamp)

Running `migrate-postgres -d "postgres://user:password@localhost.dev/database write`

Will write the database schema to a .yml file in the current directory

----------------------------------------------------------

## License
The MIT License (MIT)

Copyright (c) 2015 Jayshua Nelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.