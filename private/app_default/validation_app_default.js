const Joi = require("joi");

const create_app_default_auth = Joi.object({
  splash_image_url: Joi.string().uri().required(),
  app_main_logo: Joi.string().uri().required(),

  after_splash_data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        top_logo: Joi.string().uri().required(),
        middle_image: Joi.string().uri().required(),
        tag_line: Joi.string().required(),
      })
    )
    .required(),

  app_colors_theme: Joi.object({
    primary_color: Joi.string().required(),
    secondary_color: Joi.string().required(),
    background_color: Joi.string().required(),
    text_color: Joi.string().required(),
    text_color_secondary: Joi.string().required(),
  }).required(),

  home_page_data: Joi.object({
    id: Joi.string().required(),
    top_tag_line: Joi.string().required(),
    banner_data: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          banner_image: Joi.string().uri().required(),
          banner_title: Joi.string().required(),
          banner_subtitle: Joi.string().required(),
        })
      )
      .required(),
  }).required(),

  offer_coupon_page: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        offer_coupon_image_banner: Joi.string().uri().required(),
      })
    )
    .required(),

  app_version: Joi.string().required(),
  about_app: Joi.string().required(),
  copyright_line: Joi.string().required(),
});
const update_app_default_auth = Joi.object({
  id: Joi.number().required(),
  splash_image_url: Joi.string().uri().required(),
  app_main_logo: Joi.string().uri().required(),

  after_splash_data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        top_logo: Joi.string().uri().required(),
        middle_image: Joi.string().uri().required(),
        tag_line: Joi.string().required(),
      })
    )
    .required(),

  app_colors_theme: Joi.object({
    primary_color: Joi.string().required(),
    secondary_color: Joi.string().required(),
    background_color: Joi.string().required(),
    text_color: Joi.string().required(),
    text_color_secondary: Joi.string().required(),
  }).required(),

  home_page_data: Joi.object({
    id: Joi.string().required(),
    top_tag_line: Joi.string().required(),
    banner_data: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          banner_image: Joi.string().uri().required(),
          banner_title: Joi.string().required(),
          banner_subtitle: Joi.string().required(),
        })
      )
      .required(),
  }).required(),

  offer_coupon_page: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        offer_coupon_image_banner: Joi.string().uri().required(),
      })
    )
    .required(),

  app_version: Joi.string().required(),
  about_app: Joi.string().required(),
  copyright_line: Joi.string().required(),
});

module.exports = {
  create_app_default_auth,
  update_app_default_auth,
};
