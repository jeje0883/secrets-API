
const errorHandler = (err, req, res, next) => {
    // Log the error details
    console.error('Global Error Handler:', err.stack || err);

    // Set default status code and message
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};

module.exports = errorHandler;