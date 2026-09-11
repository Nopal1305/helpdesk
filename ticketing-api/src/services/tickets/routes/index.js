import express from 'express';
import { addTicket, getTickets, updateTicketStatus, deleteTicket, assignTicket, confirmTicket, claimTicket } from '../controller/ticket-controller.js';
import { createTicketSchema, updateStatusSchema, feedbackSchema} from '../validator/schema.js';
import validate from '../../../middlewires/validate.js';
import authenticateToken from '../../../middlewires/auth.js';

const router = express.Router();

router.post('/ticket', authenticateToken, validate(createTicketSchema), addTicket);
router.get('/ticket', authenticateToken, getTickets);
router.patch('/ticket/:id', validate(updateStatusSchema), authenticateToken, updateTicketStatus);
router.patch('/ticket/:id/assign', authenticateToken, assignTicket);
router.patch('/ticket/:id/claim', authenticateToken, claimTicket);
router.patch('/ticket/:id/confirm', authenticateToken, validate(feedbackSchema), confirmTicket);
router.delete('/ticket/:id', authenticateToken, deleteTicket);

export default router;