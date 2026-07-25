const { validateToken } = require("./token_helper");

const validateTokenMiddleware = async (request, response, next) => {
  try {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(200).json({
        success: false,
        error: "Bearer token not sent",
      });
    } else {
      const res = await validateToken(authorizationHeader);
      if (res.success) {
        request.user = {
          user_id: res.user_id,
          email: res.email,
        };
        next();
      } else {
        return response.status(200).json({
          success: false,
          error: "Invalid Token",
          message: "Your session has expired. Please log in again to continue.",
        });
      }
    }
  } catch (err) {
    next(err);
    console.error(err);
    return response.status(200).json({
      success: false,
      message: "Issue in db Handling",
      error: err,
    });
  }
};

module.exports = validateTokenMiddleware;
