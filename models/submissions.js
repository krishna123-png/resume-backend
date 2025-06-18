const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String],
    required: true
  },
  experience: {
    type: String, // You can also use Number if you're storing years only
    required: true
  },
  education: {
    type: String,
    required: true
  },
  resume: {
    type: String, // AI-generated resume text
    default: ''
  },
  coverLetter: {
    type: String, // AI-generated cover letter text
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;