const { DataTypes, Model } = require('sequelize') ;
const { users } = require('../db') ;

// class User extends Model{} ;

const User = users.define('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            len: {
                args: [5, 20],
                msg: 'Username size must be in range from 5 - 20.'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8,16],
                msg: 'Password must be of 8-16 character long.'
            },
            is: {
                args: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,}$/,
                msg: 'Password must have 1 lower, 1 upper case, 1 symbol, 1 number.'
            }
        }
    },
    role: {
        type: DataTypes.ENUM(['STUDENT', 'STAFF']),
        allowNull: false,
        validate: {
            isIn: {
                args: [['STUDENT', 'STAFF']],
                msg: "Roles cannot have values other than 'STUDENT' and 'STAFF'." 
            }
        }
    }
}, {
    timestamps: false
}) ;

module.exports = User ;