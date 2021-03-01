const path = require('path')
const { config } = require('../config')

module.exports = {
  client: 'mysql',
  version: '5.7',
  connection: {
    // filename: path.join(config.databaseFolderDir, 'db.sqlite3')
    ...config.databaseSettings
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
