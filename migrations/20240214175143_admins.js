const knex = require('../db')

exports.up = function(knex) {
  return knex.schema.createTable('admins' , (table)=>{
    
    // fields
    table.increments('id').primary().notNullable().defaultTo(null);
    table.string('email',50).notNullable().defaultTo(null);
    table.string('name',50).nullable().defaultTo("");
    table.string('password',500).notNullable().defaultTo(null);
    table.string('reg_otp', 500).nullable().defaultTo(null);
    table.string('forgot_otp', 500).nullable().defaultTo(null);
    table.bigint('email_verified_at').nullable().defaultTo(null);
    table.string('token', 500).nullable().defaultTo(null);
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable().defaultTo(null);
  })
};


exports.down = function(knex) {
   return knex.schema.dropTable('admins')
};
