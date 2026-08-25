import 'dotenv/config'
import { Router } from "express";
import ticket from '../services/tickets/routes/index.js';
import auth from '../services/auth/routes/index.js'

const router = Router();

router.use('/', ticket);
router.use('/', auth);

export default router;