
const Knex = require('knex').default;

const {options_mdb} = require('./options/mariaDB.js');
const knex = Knex(options_mdb);

const {options} = require('./options/SQLite3.js')
const knex_sqlite3 = Knex(options);

const tableNameProd = 'productos';
const tableNameMnsjs = 'mensajes';

module.exports = async function(){

    const isNotExistsProd = await knex.schema.hasTable(tableNameProd);
    if (!isNotExistsProd) {
        await knex.schema.createTable(tableNameProd, (table) => {
            table.increments('id');
            table.string('title');
            table.float('price');
            table.string('thumbnail');
        });
        await knex.destroy();
    }
    
    const isNotExistsMnsjs = await knex_sqlite3.schema.hasTable(tableNameMnsjs);
    if (!isNotExistsMnsjs) {
        await knex_sqlite3.schema.createTable(tableNameMnsjs, (table) => {
            table.increments('id');
            table.string('author');
            table.string('date');
            table.string('text');
        });
        await knex_sqlite3.destroy();
    }
};

