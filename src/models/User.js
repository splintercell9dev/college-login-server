const { DataTypes, Model } = require('sequelize') ;
const bcrypt = require('bcrypt') ;
const { users } = require('../db') ;

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
            notEmpty: {
                msg: 'Username cannot be empty.'
            },
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
            notEmpty: {
                msg: 'Password cannot be empty.'
            },
            len: {
                args: [8,16],
                msg: 'Password must have length between 8-16 chars.'
            },
            is: {
                args: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,
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
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt() ;
            user.password = await bcrypt.hash(user.password, salt) ;
        }
    }
}) ;

User.prototype.validPassword = function(pass){
    return bcrypt.compare(pass, this.password) ;
}

module.exports = User ;