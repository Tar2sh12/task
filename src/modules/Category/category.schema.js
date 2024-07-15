import Joi from "joi";
import { generalRules } from "../../utils/general-rules.utils.js";

export const addCategorySchema= {
    body: Joi.object({
        name: Joi.string().min(3).max(30).required()
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}



export const getCategoriesOfAuthUserSchema = {
    headers: Joi.object({
      token: Joi.string().required(),
      ...generalRules.headers,
    }),
  };
  
  export const deleteMyCategorySchema = {
    headers: Joi.object({
      token: Joi.string().required(),
      ...generalRules.headers,
    }),
    params: Joi.object({
      _id: generalRules._id.required(),
    }),
  };
  
  export const updateMyCategorySchema = {
    body: Joi.object({
      name: Joi.string().min(3).max(30).required()
    }),
    headers: Joi.object({
      token: Joi.string().required(),
      ...generalRules.headers,
    }),
    params: Joi.object({
      _id: generalRules._id.required(),
    }),
  };
  