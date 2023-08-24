const { DataTypes, Sequelize } = require('sequelize') ;
const { students } = require('../db') ;


const Student = students.define('student', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true,
            len: {
                args: [5,40],
                msg: 'Fullname must be in range of 5-40'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            notEmpty: true,
            isEmail: true
        },
        allowNull: true
    },
    contact: {
        type: DataTypes.NUMBER(10),
        allowNull: true,
        validate: {
            notEmpty: true,
            isNumeric: {
                msg: "Contact must be a number."
            },
            len: {
                args: [10],
                msg: "Contact must have length of 10 digits."
            },
            is: {
                args: /^[1-9][0-9]{0,}$/,
                msg: 'Contact number cannot start from 0.'
            }
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true,
            len: {
                args: [20, 100],
                msg: 'Address not in range min: 10 and max: 100 '
            }
        }
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true,
            len: [36],
        }
    },
    updated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    createdAt: false
}) ;

module.exports = Student ;