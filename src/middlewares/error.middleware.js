const ApiError = require("../utlis/ApiError");

const errorMiddleware = (err, req, res, next) => {
  console.log("REAL ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: err.stack,
  });
};

module.exports = errorMiddleware;
