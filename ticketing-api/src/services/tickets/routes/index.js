import express from 'express';
import { addTicket, getTickets, updateTicketStatus } from '../controller/ticket-controller.js';
import { createTicketSchema, updateStatusSchema} from '../validator/schema.js';
import validate from '../../../middlewires/validate.js';
import authenticateToken from '../../../middlewires/auth.js';

const router = express.Router();

router.post('/ticket', authenticateToken, validate(createTicketSchema), addTicket);
router.get('/ticket', authenticateToken, getTickets);
router.patch('/ticket/:id', validate(updateStatusSchema), authenticateToken, updateTicketStatus)

export default router;