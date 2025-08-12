const User = require('../models/User');
const Review = require('../models/Review');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ChatMessage = require('../models/ChatMessage');

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        // Find user but only select public-facing fields
        const user = await User.findById(req.params.userId).select('name location skills rating');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
};

// @desc    Get current user's full profile
// @route   GET /api/users/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    // req.user is attached by the 'protect' middleware
    // We already have the user object, so just send it
    const fullUser = await User.findById(req.user.id);
    res.json(fullUser);
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.location = req.body.location || user.location;
            user.phone = req.body.phone || user.phone;
            if (req.body.skills) {
                // Ensure skills is an array before assigning
                if (Array.isArray(req.body.skills)) {
                    user.skills = req.body.skills;
                } else {
                   return res.status(400).json({ message: 'Validation Error: Skills must be an array of strings.' });
                }
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Validation Error', details: error.message });
    }
};

// @desc    Delete user profile and all associated data
// @route   DELETE /api/users/me
// @access  Private
exports.deleteMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // --- Logic to handle associated data ---

        // 1. Delete all jobs posted by the user
        await Job.deleteMany({ postedBy: userId });

        // 2. Un-assign user from any jobs they were selected for
        // This reverts the job to 'open' so the poster can find a new worker.
        await Job.updateMany(
            { selectedWorkerId: userId },
            { $set: { status: 'open' }, $unset: { selectedWorkerId: "" } }
        );
        
        // 3. Delete all applications made by the user
        await Application.deleteMany({ applicantId: userId });

        // 4. Delete all reviews written by or about the user
        await Review.deleteMany({ $or: [{ reviewerId: userId }, { reviewedUserId: userId }] });

        // 5. Delete all chat messages sent by the user
        await ChatMessage.deleteMany({ senderId: userId });

        // Finally, delete the user account itself
        await user.deleteOne();
        
        res.json({ message: 'User account and all associated data deleted successfully.' });

    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
};