module.exports = catchAsync = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); // pega erro -> global err handl
    };
};
// catchAsync -> return anon func -> Controllers ...
