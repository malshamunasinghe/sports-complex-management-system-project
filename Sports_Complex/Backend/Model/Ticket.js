const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  url: String,
  key: String,
  filename: String,
  size: Number
}, { _id: false });

const TimelineSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  note: String
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, minlength: 5, maxlength: 120 },
  category: { type: String, enum: ['FACILITY','EVENT','PAYMENT','BOOKING','OTHER'], required: true },
  description: { type: String, required: true, minlength: 10, maxlength: 5000 },
  priority: { type: String, enum: ['LOW','MEDIUM','HIGH'], default: 'MEDIUM' },
  status: { type: String, enum: ['PENDING','IN_PROGRESS','RESOLVED','CLOSED'], default: 'PENDING' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  attachments: [AttachmentSchema],
  timeline: [TimelineSchema],
  slaDueAt: { type: Date },
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ createdBy: 1, createdAt: 1 });
TicketSchema.index({ subject: 'text', description: 'text' });

module.exports = mongoose.model('Ticket', TicketSchema);
