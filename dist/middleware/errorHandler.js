"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected internal server error occurred';
    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
}
