const knex = require('../db')

exports.up = function(knex) {
  return knex.schema.createTable('admins' , (table)=>{
    
    // fields
    table.increments('id').primary().notNullable().defaultTo(null);
    table.string('email',50).notNullable().defaultTo(null);
    table.string('name',50).nullable().defaultTo(null);
    table.string('profile',500).nullable().defaultTo(null);
    table.string('password',500).defaultTo(null);
    table.string('forgot_otp', 500).nullable().defaultTo(null);
    table.bigint('otp_time',50).nullable().defaultTo(null);
    table.string('token', 500).nullable().defaultTo(null);
    table.timestamp('registered_at').nullable().defaultTo(null);
  })
};

// F:\NEW PROJECTS\SHARE PORTFOLIO\BackendAdminPanel\migrations\20240214175143_admins.js

exports.down = function(knex) {
   return knex.schema.dropTable('admins')
};
