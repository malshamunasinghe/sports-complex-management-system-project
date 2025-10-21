const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  url: String,
  key: String,
  filename: String,
  size: Number
}, { _id: false });

const TicketCommentSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, minlength: 1, maxlength: 3000 },
  internal: { type: Boolean, default: false },
  attachments: [AttachmentSchema],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

TicketCommentSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model('TicketComment', TicketCommentSchema);
