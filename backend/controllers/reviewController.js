const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    const { reviewedUserId, jobId, rating, comment } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Check 1: Job must be completed or paid
        if (!['completed', 'paid'].includes(job.status)) {
            return res.status(400).json({ message: "You cannot review a user for a job that is not completed." });
        }

        // Check 2: The reviewer must be the poster or the worker
        const isPoster = job.postedBy.toString() === req.user.id;
        const isWorker = job.selectedWorkerId && job.selectedWorkerId.toString() === req.user.id;
        if (!isPoster && !isWorker) {
            return res.status(403).json({ message: "You are not authorized to review for this job." });
        }
        
        // Check 3: A user cannot review themselves
        if (req.user.id === reviewedUserId) {
            return res.status(400).json({ message: "You cannot review yourself." });
        }

        // Check 4: The reviewed user must be the other party in the job
        const isReviewingPoster = isWorker && job.postedBy.toString() === reviewedUserId;
        const isReviewingWorker = isPoster && job.selectedWorkerId.toString() === reviewedUserId;
        if (!isReviewingPoster && !isReviewingWorker) {
            return res.status(400).json({ message: "You can only review the other party involved in the job." });
        }

        // Check 5: Ensure a review for this job by this user doesn't already exist
        const existingReview = await Review.findOne({ jobId, reviewerId: req.user.id });
        if (existingReview) {
            return res.status(409).json({ message: "You have already submitted a review for this job." });
        }

        const review = new Review({
            reviewerId: req.user.id,
            reviewedUserId,
            jobId,
            rating,
            comment,
        });

        const createdReview = await review.save();

        // Update the average rating for the reviewed user
        const reviews = await Review.find({ reviewedUserId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await User.findByIdAndUpdate(reviewedUserId, { rating: avgRating.toFixed(1) });
        
        res.status(201).json(createdReview);

    } catch (error) {
        res.status(500).json({ message: "Server Error", details: error.message });
    }
};

// @desc    Get all reviews for a user
// @route   GET /api/users/:userId/reviews
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewedUserId: req.params.userId })
                                    .populate('reviewerId', 'name')
                                    .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};