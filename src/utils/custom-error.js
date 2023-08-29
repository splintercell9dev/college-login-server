class FieldError extends Error{
    constructor(fieldName, msg){
        super(msg) ;
        this.field = fieldName ;
    }
} ;

module.exports = {
    FieldError
} ;