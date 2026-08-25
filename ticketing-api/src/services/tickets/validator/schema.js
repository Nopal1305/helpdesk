import Joi from 'joi';

export const createTicketSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  category: Joi.string().trim().valid('Hardware', 'Software', 'Network', 'Other').required(),
  priority: Joi.string().trim().valid('LOW', 'MEDIUM', 'HIGH').required(),
  description: Joi.string().trim().min(5).max(1000).required(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED').required(),
  resolution_note: Joi.string().allow('', null).optional()
});