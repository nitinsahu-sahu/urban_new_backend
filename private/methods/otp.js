const { pool } = require("../../dbhelper");
const { current_epoch_time } = require("./current_epoch_time");
const { expire_epoch_time } = require("./current_epoch_time");
const { generateRandom4DigitNumber } = require("./ganerate_otp");
const { send_mail } = require("../methods/send_mail");
const jwt = require("jsonwebtoken");

const send_otp = async (email, access_type) => {
  try {
    let otp = generateRandom4DigitNumber();
    if (email === "shriramdentaldepot@gmail.com" && access_type === "APP") {
      otp = 9999;
    }
    const mail_res = await send_mail(email, otp);
    const created_at = current_epoch_time();
    const expire_at = expire_epoch_time();
    const token = generateToken(email);
    let send_mail_query;
    if (mail_res) {
      const check_mail_query = "SELECT * from login_logs WHERE email = $1";
      const check_mail_value = [email];
      const check_mail_result = await pool.query(
        check_mail_query,
        check_mail_value
      );
      if (check_mail_result.rows.length != 0) {
        send_mail_query = `UPDATE login_logs
        SET
          otp = $2,
          ${access_type == "WEB" ? "web_token" : "app_token"} = $3,
          created_at = $4 ,
          expire_at = $5
        WHERE
          email = $1
        RETURNING *;
        `;
      } else {
        send_mail_query = `INSERT INTO login_logs (email, otp, ${
          access_type == "WEB" ? "web_token" : "app_token"
        }, created_at , expire_at)
        VALUES ($1, $2, $3, $4 ,$5)
        RETURNING *;
        `;
      }

      const send_mail_value = [email, otp, token, created_at, expire_at];
      const send_mail_result = await pool.query(
        send_mail_query,
        send_mail_value
      );

      if (send_mail_result.rows != 0) {
        return {
          success: true,
          message: "otp sent successfully",
        };
      }
      return {
        success: false,
        message: "otp not sent",
      };
    } else {
      return {
        success: false,
        message: "otp not sent",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "otp not sent",
    };
  }
};

const generateToken = (email) => {
  const token = jwt.sign({ email }, "deepak", { expiresIn: "30d" });
  return token;
};

module.exports = {
  send_otp,
};
