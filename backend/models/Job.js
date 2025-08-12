const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  payment: { type: Number, required: true },
  category: { type: String, required: true },
  urgencyFlag: { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  selectedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'paid', 'canceled'],
    default: 'open',
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);