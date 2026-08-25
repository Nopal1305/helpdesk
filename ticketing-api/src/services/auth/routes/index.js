import express from 'express';
import { register, login, refreshToken, logout } from '../controller/auth-controller.js'
import validate from '../../../middlewires/validate.js';
import { registerSchema } from '../validator/schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.put('/refresh', refreshToken);
router.delete('/logout', logout);

export default router;