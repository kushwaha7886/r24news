import mongoose from 'mongoose';
import MediaAsset from '../models/MediaAsset.model.js';
import Article from '../models/Articles.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';


// Create a new media asset
async function createMediaAsset(req, res) {
    try {
        let { type, url, caption, article } = req.body;

        // Handle file upload if a file is provided
        if (req.file) {
            console.log("File received:", req.file);
            console.log("File path:", req.file.path);
            // Upload file to cloudinary
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (!cloudinaryResponse) {
                console.error("Cloudinary upload failed for file:", req.file.originalname);
                return res.status(500).json({ error: 'Failed to upload file to cloud storage' });
            }
            
            // Determine type based on file mimetype if not provided
            if (!type) {
                if (req.file.mimetype.startsWith('image/')) {
                    type = 'Image';
                } else if (req.file.mimetype.startsWith('video/')) {
                    type = 'Video';
                } else {
                    type = 'Document';
                }
            }

            // Use cloudinary URL
            url = cloudinaryResponse.url;
            // Use original filename as caption if not provided
            if (!caption) {
                caption = req.file.originalname;
            }
        }
        
        const data = { type, url, caption };
        if (article && mongoose.Types.ObjectId.isValid(article)) {
            data.article = article;
        }

        const mediaAsset = new MediaAsset(data);
        await mediaAsset.save();


        // Add the media asset to the article's media array if article is provided
        if (article && mongoose.Types.ObjectId.isValid(article)) {
            await Article.findByIdAndUpdate(article, { $addToSet: { media: mediaAsset._id } });
        }

        return res.status(201).json(mediaAsset);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create media asset' });
    }
}

// Get list of media assets with optional pagination, search and filters
async function getMediaAssets(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const type = req.query.type;
        const article = req.query.article;

        const filter = {};
        if (type) filter.type = type;
        if (article) filter.article = article;

        const skip = (page - 1) * limit;
        const [total, mediaAssets] = await Promise.all([
            MediaAsset.countDocuments(filter),
            MediaAsset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('article')
        ]);

        return res.json({ total, page, limit, data: mediaAssets });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch media assets' });
    }
}

// Get a single media asset by id
async function getMediaAssetById(req, res) {
    try {
        const { id } = req.params;
        const mediaAsset = await MediaAsset.findById(id).populate('article');
        if (!mediaAsset) return res.status(404).json({ error: 'Media asset not found' });
        return res.json(mediaAsset);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch media asset' });
    }
}

// Update a media asset by id
async function updateMediaAsset(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Filter out invalid article ObjectId
        if (updates.article && !mongoose.Types.ObjectId.isValid(updates.article)) {
            delete updates.article;
        }
        const mediaAsset = await MediaAsset.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!mediaAsset) return res.status(404).json({ error: 'Media asset not found' });

        // If article is being updated, handle the media array
        if (updates.article) {
            // Remove from old article if it exists
            if (mediaAsset.article && mediaAsset.article.toString() !== updates.article) {
                await Article.findByIdAndUpdate(mediaAsset.article, { $pull: { media: id } });
            }
            // Add to new article
            if (updates.article && mongoose.Types.ObjectId.isValid(updates.article)) {
                await Article.findByIdAndUpdate(updates.article, { $addToSet: { media: id } });
            }
        }

        return res.json(mediaAsset);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update media asset' });
    }
}

// Delete a media asset by id
async function deleteMediaAsset(req, res) {
    try {
        const { id } = req.params;
        const mediaAsset = await MediaAsset.findByIdAndDelete(id);
        if (!mediaAsset) return res.status(404).json({ error: 'Media asset not found' });

        // Remove the media asset from the article's media array if it exists
        if (mediaAsset.article) {
            await Article.findByIdAndUpdate(mediaAsset.article, { $pull: { media: id } });
        }

        return res.json({ message: 'Media asset deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete media asset' });
    }
}

export {
    createMediaAsset,
    getMediaAssets,
    getMediaAssetById,
    updateMediaAsset,
    deleteMediaAsset
};
