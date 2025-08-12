const Job = require('../models/Job');
const Application = require('../models/Application');
const ChatMessage = require('../models/ChatMessage');

// @desc    Get all open jobs with filtering
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
    try {
        const { category, location, urgency } = req.query;
        let filter = { status: 'open' };

        if (category) filter.category = category;
        if (location) filter.location = new RegExp(location, 'i'); // Case-insensitive search
        if (urgency === 'true') filter.urgencyFlag = true;

        const jobs = await Job.find(filter).select('-description -applicants').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:jobId
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('postedBy', 'name email');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
    const { title, description, location, payment, category, urgencyFlag } = req.body;
    try {
        const newJob = new Job({
            title,
            description,
            location,
            payment,
            category,
            urgencyFlag,
            postedBy: req.user.id,
        });
        const job = await newJob.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: 'Validation Error', details: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:jobId
// @access  Private
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is the poster
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }

        job = await Job.findByIdAndUpdate(req.params.jobId, req.body, { new: true, runValidators: true });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:jobId
// @access  Private
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is the poster
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }

        await job.deleteOne();
        res.json({ message: 'Job deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- Job Lifecycle ---

// @desc    Apply for a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        const existingApplication = await Application.findOne({ jobId: job._id, applicantId: req.user.id });
        if (existingApplication) {
            return res.status(409).json({ message: 'You have already applied for this job.' });
        }
        
        const application = new Application({ jobId: job._id, applicantId: req.user.id });
        job.applicants.push(req.user.id);

        await application.save();
        await job.save();
        res.status(201).json(application);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
};

// @desc    View applicants for a job
// @route   GET /api/jobs/:jobId/applicants
// @access  Private (Poster only)
exports.getApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('applicants', 'name rating skills');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }
        res.json(job.applicants);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Select an applicant for a job
// @route   PUT /api/jobs/:jobId/select
// @access  Private (Poster only)
exports.selectApplicant = async (req, res) => {
    const { applicantId } = req.body;
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }
        
        if (job.status !== 'open') {
            return res.status(400).json({ message: 'Job is not open for selection.' });
        }

        // Verify the selected user actually applied
        if (!job.applicants.includes(applicantId)) {
            return res.status(400).json({ message: 'This user did not apply for the job.' });
        }

        job.selectedWorkerId = applicantId;
        job.status = 'assigned';
        await job.save();

        res.json({
            message: `Job assigned successfully to user ${applicantId}.`,
            job: { id: job.id, status: job.status, selectedWorkerId: job.selectedWorkerId }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark a job as complete
// @route   PUT /api/jobs/:jobId/complete
// @access  Private (Worker only)
exports.markJobComplete = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.selectedWorkerId || job.selectedWorkerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the assigned worker can mark this job as complete.' });
        }

        if (job.status !== 'assigned') {
            return res.status(400).json({ message: 'Job must be in "assigned" status to be marked as complete.' });
        }

        job.status = 'completed';
        await job.save();
        res.json({ message: 'Job marked as complete.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Chat System ---

// @desc    Get chat messages for a job
// @route   GET /api/jobs/:jobId/messages
// @access  Private (Poster or Worker)
exports.getMessages = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const isPoster = job.postedBy.toString() === req.user.id;
        const isWorker = job.selectedWorkerId && job.selectedWorkerId.toString() === req.user.id;
        if (!isPoster && !isWorker) {
            return res.status(403).json({ message: 'You do not have access to this chat.' });
        }

        const messages = await ChatMessage.find({ jobId: req.params.jobId })
            .populate('senderId', 'name')
            .sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a chat message
// @route   POST /api/jobs/:jobId/messages
// @access  Private (Poster or Worker)
exports.sendMessage = async (req, res) => {
    const { message } = req.body;
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const isPoster = job.postedBy.toString() === req.user.id;
        const isWorker = job.selectedWorkerId && job.selectedWorkerId.toString() === req.user.id;
        if (!isPoster && !isWorker) {
            return res.status(403).json({ message: 'You do not have access to this chat.' });
        }

        const newMessage = new ChatMessage({
            jobId: req.params.jobId,
            senderId: req.user.id,
            message
        });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};