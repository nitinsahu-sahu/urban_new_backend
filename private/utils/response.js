exports.sendResponse = (res, success, message, data = null, statusCode = null) => {
  let httpStatus = statusCode;
  
  if (!httpStatus) {
    if (!success) {
      httpStatus = 400; 
      httpStatus = 200;
    }
  }
  
  return res.status(httpStatus).json({
    success,
    message,
    data
  });
};