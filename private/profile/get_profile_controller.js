const { get_profile_model } = require("./get_profile_model");
const get_profile_controller = async (request, response, next) => {
  try {
    // The route middleware has already validated the current session and
    // attached the authenticated user. Reuse that identity rather than
    // decoding the token a second time.
    const result = await get_profile_model(request.user.email);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
module.exports = { get_profile_controller };
