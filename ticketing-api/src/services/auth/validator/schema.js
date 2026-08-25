import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('EMPLOYEE', 'IT_STAFF').optional(),  
  department: Joi.string().trim().min(2).max(100).required(),
});
