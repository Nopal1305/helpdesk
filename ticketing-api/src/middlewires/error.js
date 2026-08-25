import response from '../utils/response.js';
import ClientError from '../exceptions/client-error.js';

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ClientError) {
        return response(res, err.statusCode, err.message, null);
    }

    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    console.error('Unhandled error:', err);
    return response(res, status, message, null);
};

export default ErrorHandler;