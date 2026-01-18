import Article from '../models/Articles.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { requireAdmin } from '../middleware/Auth.middleware.js';

// Create a new article
async function createArticle(req, res) {
    try {
        const { title, content, summary, category, tags = [], status } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Generate slug from title
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Ensure slug uniqueness
        let existingArticle = await Article.findOne({ slug });
        let counter = 1;
        while (existingArticle) {
            slug = `${slug}-${counter}`;
            existingArticle = await Article.findOne({ slug });
            counter++;
        }

        // Handle category: set to undefined if empty
        const categoryId = category && category.trim() !== '' ? category : undefined;

        // Set status based on user role: editors/admins can publish directly, users need approval
        let articleStatus;
        if (req.user.isEditor || req.user.isAdmin) {
            // Editors/Admins can set any status, default to Published if not specified
            articleStatus = status || 'Published';
        } else {
            // Regular users always create articles as "Pending Approval"
            articleStatus = 'Pending Approval';
        }

        const article = new Article({
            title,
            slug,
            content,
            summary,
            category: categoryId,
            tags,
            journalist: req.user.id,
            status: articleStatus
        });

        await article.save();
        return res.status(201).json(new ApiResponse(201, article, "Article created successfully"));
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: 'Article validation failed', details: err.errors });
        }
        return res.status(500).json({ error: 'Failed to create article' });
    }
}

// Get list of articles with optional pagination, search and filters
async function getArticles(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const q = req.query.q ? req.query.q.trim() : null;
        const tag = req.query.tag;
        const journalist = req.query.journalist;
        const category = req.query.category;
        const published = typeof req.query.published !== 'undefined' ? req.query.published === 'true' : undefined;
        const status = req.query.status; // Allow filtering by status for editors

        const filter = {};
        if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') }];
        if (tag) filter.tags = tag;
        if (journalist) filter.journalist = journalist;
        if (category) filter.category = category;
        if (typeof published !== 'undefined') filter.published = published;
        if (status) filter.status = status;

        // If user is not an editor, only show published articles
        if (!req.user?.isEditor) {
            filter.status = 'Published';
        }

        const skip = (page - 1) * limit;
        const [total, articlesData] = await Promise.all([
            Article.countDocuments(filter),
            Article.find(filter).populate('journalist', 'fullName designation email').populate('category', 'name').populate('media', 'url caption type').sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

        const articles = articlesData;

        const data = {
            total,
            page,
            limit,
            articles
        };

        return res.status(200).json(new ApiResponse(200, data, "Articles fetched successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch articles' });
    }
}

// Get a single article by id
async function getArticleById(req, res) {
    try {
        const { id } = req.params;
        const articleData = await Article.findById(id).populate('journalist', 'fullName designation email').populate('category', 'name').populate('media', 'url caption type');
        if (!articleData) return res.status(404).json({ error: 'Article not found' });

        return res.status(200).json(new ApiResponse(200, articleData, "Article fetched successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch article' });
    }
}

// Update an article by id
async function updateArticle(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const article = await Article.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!article) return res.status(404).json({ error: 'Article not found' });
        return res.status(200).json(new ApiResponse(200, article, "Article updated successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update article' });
    }
}

// Delete an article by id
async function deleteArticle(req, res) {
    try {
        const { id } = req.params;
        const article = await Article.findByIdAndDelete(id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        return res.status(200).json(new ApiResponse(200, {}, "Article deleted successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete article' });
    }
}

// Approve an article (editor only)
async function approveArticle(req, res) {
    try {
        const { id } = req.params;
        const articleData = await Article.findByIdAndUpdate(
            id,
            { status: 'Published', publishDate: new Date() },
            { new: true, runValidators: true }
        ).populate('journalist', 'fullName designation email').populate('category', 'name').populate('media', 'url caption type');

        if (!articleData) return res.status(404).json({ error: 'Article not found' });

        return res.status(200).json(new ApiResponse(200, articleData, "Article approved successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to approve article' });
    }
}

// Reject an article (editor only)
async function rejectArticle(req, res) {
    try {
        const { id } = req.params;
        const articleData = await Article.findByIdAndUpdate(
            id,
            { status: 'Draft' },
            { new: true, runValidators: true }
        ).populate('journalist', 'fullName designation email').populate('category', 'name').populate('media', 'url caption type');

        if (!articleData) return res.status(404).json({ error: 'Article not found' });

        return res.status(200).json(new ApiResponse(200, articleData, "Article rejected successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to reject article' });
    }
}

export {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    approveArticle,
    requireAdmin,
    rejectArticle,

};
