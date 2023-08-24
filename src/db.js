const { Sequelize } = require('sequelize') ;

const users = new Sequelize('users-db', 'username', 'password', {
    dialect: 'sqlite',
    host: './db/users.sqlite'
}) ;

const students = new Sequelize('students-db', 'username', 'password', {
    dialect: 'sqlite',
    host: './db/students.sqlite'
}) ;

module.exports = {
    users,
    students
} ;