import Broadcast from '../models/Broadcast.model.js';


// Create a new broadcast
async function createBroadcast(req, res) {
    try {
        const { article, channelName, airDate, duration } = req.body;
        const broadcast = new Broadcast({ article, channelName, airDate, duration });
        await broadcast.save();
        return res.status(201).json(broadcast);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create broadcast' });
    }
}

// Get list of broadcasts with optional pagination, search and filters
async function getBroadcasts(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const q = req.query.q ? req.query.q.trim() : null;
        const channelName = req.query.channelName;
        const article = req.query.article;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const filter = {};
        if (q) filter.$or = [{ channelName: new RegExp(q, 'i') }];
        if (channelName) filter.channelName = new RegExp(channelName, 'i');
        if (article) filter.article = article;
        if (startDate || endDate) {
            filter.airDate = {};
            if (startDate) filter.airDate.$gte = new Date(startDate);
            if (endDate) filter.airDate.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const [total, broadcasts] = await Promise.all([
            Broadcast.countDocuments(filter),
            Broadcast.find(filter).populate('article').sort({ airDate: -1 }).skip(skip).limit(limit)
        ]);

        return res.json({ total, page, limit, data: broadcasts });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
}

// Get a single broadcast by id
async function getBroadcastById(req, res) {
    try {
        const { id } = req.params;
        const broadcast = await Broadcast.findById(id).populate('article');
        if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });
        return res.json(broadcast);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch broadcast' });
    }
}

// Update a broadcast by id
async function updateBroadcast(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const broadcast = await Broadcast.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });
        return res.json(broadcast);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update broadcast' });
    }
}

// Delete a broadcast by id
async function deleteBroadcast(req, res) {
    try {
        const { id } = req.params;
        const broadcast = await Broadcast.findByIdAndDelete(id);
        if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });
        return res.json({ message: 'Broadcast deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete broadcast' });
    }
}

export {
    createBroadcast,
    getBroadcasts,
    getBroadcastById,
    updateBroadcast,
    deleteBroadcast
    
};
