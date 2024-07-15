import Joi from "joi";
import { generalRules } from "../../utils/general-rules.utils.js";

export const addTaskSchema = {
  body: Joi.object({
    list: Joi.array().items(Joi.string()).optional(),
    text: Joi.string().optional(),
    privacy: Joi.string().optional().valid("public", "private"),
  }).xor("list", "text"),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
  params: Joi.object({
    _id: generalRules._id.required(),
  }),
};

export const getTaskOfAuthUserSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const deleteMyTaskSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
  params: Joi.object({
    _id: generalRules._id.required(),
  }),
};

export const updateMyTaskSchema = {
  body: Joi.object({
    privacy: Joi.string().optional().valid("public", "private"),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
  params: Joi.object({
    _id: generalRules._id.required(),
  }),
};
