const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds the 10MB limit",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
    return;
  }

  if (err.message === "Unsupported file type") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (err.message === "CORS origin not allowed") {
    res.status(403).json({ success: false, message: err.message });
    return;
  }

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = globalErrorHandler;