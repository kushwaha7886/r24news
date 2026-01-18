import Comment from '../models/Comment.model.js';
import mongoose from 'mongoose';

// Create a new comment
async function createComment(req, res) {
    try {
        const { article, text } = req.body;

        // Validate article ID
        if (!article || !mongoose.Types.ObjectId.isValid(article)) {
            return res.status(400).json({ error: 'Invalid or missing article ID' });
        }

        // Use authenticated user ID
        const user = req.user._id;

        const comment = new Comment({ article, user, text });
        await comment.save();
        return res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create comment' });
    }
}

// Get list of comments with optional pagination and filters
async function getComments(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const article = req.query.article;
        const user = req.query.user;

        const filter = {};
        if (article) filter.article = article;
        if (user) filter.user = user;

        const skip = (page - 1) * limit;
        const [total, comments] = await Promise.all([
            Comment.countDocuments(filter),
            Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('article').populate('user')
        ]);

        return res.json({ total, page, limit, data: comments });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
}

// Get a single comment by id
async function getCommentById(req, res) {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id).populate('article').populate('user');
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        return res.json(comment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch comment' });
    }
}

// Update a comment by id
async function updateComment(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const comment = await Comment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        return res.json(comment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update comment' });
    }
}

// Delete a comment by id
async function deleteComment(req, res) {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        return res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete comment' });
    }
}

export {
    
    createComment,
    getComments,
    getCommentById,
    updateComment,
    deleteComment
};
