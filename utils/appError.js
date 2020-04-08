class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //message is the only parameter that the built-in error accepts

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor); //When a new object created, and a constructor function is called, then that function call is not gonna appear in the stack trace, and will not pollute it.
    }
}

// The message in super already set the message property from the Error class.

module.exports = AppError;