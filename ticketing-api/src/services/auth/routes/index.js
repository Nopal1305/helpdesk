import express from 'express';
import { register, login, refreshToken, logout, updateProfile, updatePassword, getUsers, deleteUser, forgotPassword, resetPassword, registerTech, getUserDetailsAndStats } from '../controller/auth-controller.js'
import validate from '../../../middlewires/validate.js';
import authenticateToken from '../../../middlewires/auth.js';
import { registerSchema, updateProfileSchema, updatePasswordSchema } from '../validator/schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/register-tech', authenticateToken, registerTech);
router.post('/login', login);
router.put('/refresh', refreshToken);
router.delete('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);
router.put('/password', authenticateToken, validate(updatePasswordSchema), updatePassword);
router.get('/users', authenticateToken, getUsers);
router.get('/users/:id/details', authenticateToken, getUserDetailsAndStats);
router.delete('/users/:id', authenticateToken, deleteUser);

export default router;