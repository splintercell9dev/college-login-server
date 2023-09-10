const { DataTypes } = require('sequelize') ;
const { students } = require('../db') ;


const Student = students.define('student', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: {
                args: [5,50],
                msg: 'Fullname must be in range of 5-50'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            notEmpty: true,
            isEmail: true
        },
        allowNull: false
    },
    contact: {
        type: DataTypes.NUMBER,
        allowNull: false,
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
        allowNull: false,
        validate: {
            notEmpty: true,
            len: {
                args: [20, 100],
                msg: 'Address must be in range of 20-100 characters.'
            }
        }
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    updatedAt: false
}) ;

module.exports = Student ;