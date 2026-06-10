const { get_profile_model } = require("./get_profile_model");
const { validateToken } = require("../methods/token_helper");
const get_profile_controller = async (request, response, next) => {
  try {
    const authorizationHeader = request.headers.authorization;
    const res = await validateToken(authorizationHeader);
    if (res.success) {
      const result = await get_profile_model(authorizationHeader);
      if (result.success) {
        response.status(200).json({
          ...result,
        });
      } else {
        response.status(200).json({
          ...result,
        });
      }
    } else {
      response.status(401).json({
        success: false,
        error: "Unauthorized access",
        message: "Your session has expired. Please log in again to continue.",
      });
    }
  } catch (error) {
    next(error);
    response.status(200).json({ success: false, error: error.message });
  }
};
module.exports = { get_profile_controller };
