const express = require('express');
const router = express.Router();
const tc = require('../Controllers/ticket.controller');

// CRUD / actions
router.post('/', tc.createTicket);
router.get('/', tc.getTickets);
router.get('/stats/overview', tc.getOverviewStats);
router.get('/staff-users', tc.getStaffUsers);
router.get('/user/:userId', tc.getUserTickets); 
router.get('/:id', tc.getTicketById);
router.patch('/:id', tc.updateTicket);
router.delete('/:id', tc.deleteTicket);
router.post('/:id/assign', tc.assignTicket);
router.post('/:id/reopen', tc.reopenTicket);
router.post('/:id/close', tc.closeTicket);

// comments
router.post('/:id/comments', tc.addComment);
router.post('/:id/admin-reply', tc.adminReply);
router.get('/:id/comments', tc.getComments);

module.exports = router;
