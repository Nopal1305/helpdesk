import Joi from 'joi';

export const createTicketSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  category: Joi.string().trim().valid('Hardware', 'Software', 'Network', 'Other').required(),
  priority: Joi.string().trim().valid('LOW', 'MEDIUM', 'HIGH').required(),
  description: Joi.string().trim().min(5).max(1000).required(),
  issue_image: Joi.string().allow('', null).optional()
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED').required(),
  resolution_notes: Joi.string().allow('', null).optional(),
  resolution_image: Joi.string().allow('', null).optional()
});

export const feedbackSchema = Joi.object({
  action: Joi.string().valid('CLOSED', 'RE-OPENED').required(),
  rating: Joi.number().integer().min(1).max(5).when('action', {
    is: 'CLOSED',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  feedback_note: Joi.string().allow('', null).when('action', {
    is: 'RE-OPENED',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});