// Standard API response format middleware
const responseHandler = (req, res, next) => {
  res.success = (data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (error, statusCode = 500) => {
    const message = error.message || (typeof error === "string" ? error : "Server error");
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  };

  next();
};

module.exports = responseHandler;
