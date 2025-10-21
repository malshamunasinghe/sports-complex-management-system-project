const Ticket = require('../Model/Ticket');
const TicketComment = require('../Model/TicketComment');
const User = require('../Model/User');

function calcSlaDueAt(priority) {
  const now = new Date();
  if (priority === 'HIGH') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (priority === 'MEDIUM') return new Date(now.getTime() + 72 * 60 * 60 * 1000);
  return new Date(now.getTime() + 120 * 60 * 60 * 1000);
}

function getActorId(req) {
  if (req.user && req.user._id) {
    return req.user._id.toString();
  }

  const body = req.body || {};
  const query = req.query || {};

  return (
    body.updatedBy ||
    body.deletedBy ||
    body.userId ||
    query.userId ||
    query.updatedBy ||
    query.deletedBy ||
    null
  );
}

// Create a ticket
exports.createTicket = async (req, res) => {
  try {
    if (!req.body.createdBy && req.user && req.user._id) {
      req.body.createdBy = req.user._id;
    }
    const { subject, description, category, priority = 'MEDIUM' } = req.body;
    if (!req.body.createdBy) return res.status(400).json({ error: 'createdBy is required' });
    if (!subject || subject.length < 5) return res.status(400).json({ error: 'Subject is required (min 5 chars)' });
    if (!description || description.length < 10) return res.status(400).json({ error: 'Description is required (min 10 chars)' });
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const ticket = new Ticket({
      ...req.body,
      priority,
      slaDueAt: calcSlaDueAt(priority),
      timeline: [{ action: 'CREATED', note: 'Ticket created', by: req.body.createdBy }]
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List tickets (basic pagination)
exports.getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;

    // Role-based filtering: Members only see their own tickets, Admin/Staff see all
    const userRole = req.query.userRole || 'MEMBER';
    const userId = req.query.userId;
    
    if (userRole === 'MEMBER' && userId) {
      filter.createdBy = userId;
    }
    // Admin and Staff can see all tickets (no additional filter)

    const [items, total] = await Promise.all([
      Ticket.find(filter)
        .populate('createdBy', 'firstName lastName email role')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(filter)
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get ticket by id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email');
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });
    
    // Role-based access: Members can only view their own tickets
    const userId = req.query.userId;
    const userRole = req.query.userRole || 'MEMBER';
    
    if (userRole === 'MEMBER' && ticket.createdBy._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update ticket: change status/priority/assignedTo (simple rules)
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });

  const actorId = getActorId(req);
    const isOwner = actorId && ticket.createdBy && ticket.createdBy.toString() === actorId;
    const updates = [];

    const allowedCategories = Ticket.schema.path('category').enumValues || [];
    const allowedPriorities = Ticket.schema.path('priority').enumValues || [];

    if (isOwner) {
      const { subject, description, category, priority } = req.body;

      if (typeof subject !== 'undefined') {
        const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
        if (!trimmedSubject || trimmedSubject.length < 5 || trimmedSubject.length > 120) {
          return res.status(400).json({ error: 'Subject must be between 5 and 120 characters' });
        }
        if (trimmedSubject !== ticket.subject) {
          ticket.subject = trimmedSubject;
          updates.push('Subject updated');
        }
      }

      if (typeof description !== 'undefined') {
        const trimmedDescription = typeof description === 'string' ? description.trim() : '';
        if (!trimmedDescription || trimmedDescription.length < 10 || trimmedDescription.length > 5000) {
          return res.status(400).json({ error: 'Description must be between 10 and 5000 characters' });
        }
        if (trimmedDescription !== ticket.description) {
          ticket.description = trimmedDescription;
          updates.push('Description updated');
        }
      }

      if (typeof category !== 'undefined') {
        if (!allowedCategories.includes(category)) {
          return res.status(400).json({ error: 'Invalid category' });
        }
        if (category !== ticket.category) {
          ticket.category = category;
          updates.push(`Category changed to ${category}`);
        }
      }

      if (typeof priority !== 'undefined') {
        if (!allowedPriorities.includes(priority)) {
          return res.status(400).json({ error: 'Invalid priority' });
        }
        if (priority !== ticket.priority) {
          ticket.priority = priority;
          ticket.slaDueAt = calcSlaDueAt(priority);
          updates.push(`Priority changed to ${priority}`);
        }
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No valid fields provided to update' });
      }
    } else {
      const { status, priority, assignedTo } = req.body;
      const prevStatus = ticket.status;
      const prevPriority = ticket.priority;

      if (priority) {
        if (!allowedPriorities.includes(priority)) {
          return res.status(400).json({ error: 'Invalid priority' });
        }
        if (priority !== ticket.priority) {
          ticket.priority = priority;
          ticket.slaDueAt = calcSlaDueAt(priority);
          updates.push(`Priority ${prevPriority} -> ${priority}`);
        }
      }

      if (typeof assignedTo !== 'undefined') {
        ticket.assignedTo = assignedTo || null;
        updates.push(assignedTo ? `Assigned to ${assignedTo}` : 'Assignment cleared');
      }

      if (status) {
        const allowed = {
          PENDING: ['IN_PROGRESS', 'CLOSED'],
          IN_PROGRESS: ['RESOLVED', 'CLOSED'],
          RESOLVED: ['CLOSED', 'IN_PROGRESS'],
          CLOSED: []
        };
        if (!allowed[prevStatus] || !allowed[prevStatus].includes(status)) {
          return res.status(400).json({ error: `Invalid status transition ${prevStatus} -> ${status}` });
        }
        if (status !== ticket.status) {
          ticket.status = status;
          updates.push(`Status ${prevStatus} -> ${status}`);
        }
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No valid fields provided to update' });
      }

    }

    ticket.timeline.push({
      action: 'UPDATED',
      note: `${isOwner ? 'Member update' : 'Staff update'}: ${updates.join(' | ')}`,
      by: actorId || (req.user && req.user._id)
    });

    await ticket.save();
    const populatedTicket = await ticket.populate('createdBy assignedTo');
    res.json(populatedTicket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });

    const actorId = getActorId(req);
    const isOwner = actorId && ticket.createdBy && ticket.createdBy.toString() === actorId;

    if (!isOwner) {
      return res.status(403).json({ error: 'You can only delete your own tickets' });
    }

    ticket.isDeleted = true;
    ticket.timeline.push({
      action: 'DELETED',
      note: 'Ticket deleted by owner',
      by: actorId || (req.user && req.user._id)
    });
    await ticket.save();

    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Comments
exports.addComment = async (req, res) => {
  try {
    if (!req.body.author && req.user && req.user._id) req.body.author = req.user._id;
    if (!req.body.author) return res.status(400).json({ error: 'author is required' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });

    const comment = new TicketComment({
      ticketId: ticket._id,
      author: req.body.author,
      message: req.body.message,
      internal: !!req.body.internal,
      attachments: req.body.attachments || []
    });
    await comment.save();

    ticket.timeline.push({ action: 'COMMENT', note: 'New comment added', by: req.body.author });
    await ticket.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userRole = req.query.userRole || 'MEMBER';
    const userId = req.query.userId;
    
    // First check if user can access this ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Ticket not found' });
    
    if (userRole === 'MEMBER' && ticket.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Filter comments based on role
    let filter = { ticketId, isDeleted: false };
    if (userRole === 'MEMBER') {
      // Members can't see internal comments
      filter.internal = false;
    }
    
    const comments = await TicketComment.find(filter)
      .populate('author', 'firstName lastName email role')
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reopen (RESOLVED -> IN_PROGRESS within 7 days)
exports.reopenTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });
    if (ticket.status !== 'RESOLVED') return res.status(400).json({ error: 'Only RESOLVED tickets can be reopened' });
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(ticket.updatedAt).getTime() > sevenDays) {
      return res.status(400).json({ error: 'Reopen window (7 days) has passed' });
    }
    ticket.status = 'IN_PROGRESS';
    ticket.timeline.push({ action: 'REOPEN', note: 'Ticket reopened', by: (req.user && req.user._id) || req.body.by });
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Close
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });
    ticket.status = 'CLOSED';
    ticket.timeline.push({ action: 'CLOSED', note: 'Ticket closed', by: (req.user && req.user._id) || req.body.by });
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Simple stats overview
exports.getOverviewStats = async (req, res) => {
  try {
    const userRole = req.query.userRole || 'MEMBER';
    const userId = req.query.userId;
    
    let baseFilter = { isDeleted: false };
    if (userRole === 'MEMBER' && userId) {
      baseFilter.createdBy = userId;
    }
    
    const [open, inProgress, resolved, closed] = await Promise.all([
      Ticket.countDocuments({ ...baseFilter, status: 'PENDING' }),
      Ticket.countDocuments({ ...baseFilter, status: 'IN_PROGRESS' }),
      Ticket.countDocuments({ ...baseFilter, status: 'RESOLVED' }),
      Ticket.countDocuments({ ...baseFilter, status: 'CLOSED' })
    ]);
    res.json({ open, inProgress, resolved, closed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tickets for a specific user
exports.getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;
    
    const filter = { 
      createdBy: userId,
      isDeleted: false
    };
    
    // Apply optional filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    
    const [items, total] = await Promise.all([
      Ticket.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(filter)
    ]);
    
    res.json({
      items,
      page,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin assigns ticket to staff
exports.assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const userRole = req.body.userRole || req.query.userRole;
    
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({ error: 'Only admin/staff can assign tickets' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Not found' });
    
    // Verify assignee exists and is staff/admin
    let assignee = null;
    if (assignedTo) {
      assignee = await User.findById(assignedTo);
      if (!assignee || !['ADMIN', 'STAFF'].includes(assignee.role)) {
        return res.status(400).json({ error: 'Can only assign to admin or staff members' });
      }
    }
    
    ticket.assignedTo = assignedTo || null;
    ticket.timeline.push({
      action: 'ASSIGNED',
      note: assignedTo ? `Assigned to ${assignee.firstName} ${assignee.lastName}` : 'Unassigned',
      by: req.body.assignedBy
    });
    
    await ticket.save();
    await ticket.populate('createdBy assignedTo');
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin reply to ticket
exports.adminReply = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;
    const userRole = req.body.userRole || req.query.userRole;
    const adminId = req.body.adminId;
    
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({ error: 'Only admin/staff can use this endpoint' });
    }
    
    if (!message || !adminId) {
      return res.status(400).json({ error: 'Message and adminId are required' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isDeleted) return res.status(404).json({ error: 'Ticket not found' });
    
    // Create admin comment
    const comment = new TicketComment({
      ticketId: ticket._id,
      author: adminId,
      message: message,
      internal: isInternal,
      attachments: req.body.attachments || []
    });
    await comment.save();
    
    // Update ticket timeline
    ticket.timeline.push({
      action: isInternal ? 'INTERNAL_NOTE' : 'ADMIN_REPLY',
      note: isInternal ? 'Internal note added' : 'Admin replied to customer',
      by: adminId
    });
    
    // Auto-assign if not assigned and status is pending
    if (!ticket.assignedTo && ticket.status === 'PENDING') {
      ticket.assignedTo = adminId;
      ticket.status = 'IN_PROGRESS';
      ticket.timeline.push({
        action: 'STATUS_CHANGE',
        note: 'Status changed to IN_PROGRESS (auto-assigned)',
        by: adminId
      });
    }
    
    await ticket.save();
    await comment.populate('author', 'firstName lastName email role');
    
    res.status(201).json({
      comment,
      ticket: await ticket.populate('createdBy assignedTo')
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all staff/admin users for assignment dropdown
exports.getStaffUsers = async (req, res) => {
  try {
    const userRole = req.query.userRole;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can view staff list' });
    }
    
    const staff = await User.find({
      role: { $in: ['ADMIN', 'STAFF'] },
      isActive: true,
      isDeleted: false
    }).select('firstName lastName email role');
    
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};