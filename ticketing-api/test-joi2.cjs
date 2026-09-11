const Joi = require('joi');

const schema = Joi.object({
  status: Joi.string()
});

const req = {
  body: {
    status: 'RESOLVED',
    resolution_notes: 'Hello',
    resolution_image: 'World'
  }
};

const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
});

if (error) {
    console.log('error:', error.message);
} else {
    console.log('value:', value);
    console.log('req.body:', req.body);
}
