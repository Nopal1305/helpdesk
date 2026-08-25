const response = (res, statusCode, message, data) => {
    return res
        .status(statusCode)
        .set('Content-Type', 'application/json; charset=utf-8')
        .json({
            code: statusCode,
            status: statusCode < 400 ? 'success' : 'fail',
            message,
            data
        })
        .end();
};

export default response;