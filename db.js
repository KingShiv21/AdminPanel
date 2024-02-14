const config = require('./knexfile')
const Knex = require('knex')
module.exports = Knex(config.development)