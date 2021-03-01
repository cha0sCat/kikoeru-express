const path = require('path')
const { config } = require('../config')

module.exports = {
  client: 'mysql',
  version: '5.7',
  connection: {
    // filename: path.join(config.databaseFolderDir, 'db.sqlite3')
    host : config.databaseSettings.host,
    user : config.databaseSettings.user,
    password : config.databaseSettings.passwd,
    database : config.databaseSettings.dbName
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
