const mongoose = require('mongoose');

const antiCallSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false },
    action: { type: String, enum: ['block', 'warn'], default: 'block' }
});

const AntiCallDB = mongoose.models.AntiCall || mongoose.model('AntiCall', antiCallSchema);
const memoryCache = new Map();

const setAntiCall = async (userId, status, action = 'block') => {
    memoryCache.set(userId, { status, action });
    if (mongoose.connection.readyState === 1) {
        await AntiCallDB.findOneAndUpdate(
            { userId },
            { userId, status, action },
            { upsert: true, new: true }
        );
    }
    return true;
};

const getAntiCall = async (userId) => {
    if (memoryCache.has(userId)) return memoryCache.get(userId);
    if (mongoose.connection.readyState === 1) {
        const doc = await AntiCallDB.findOne({ userId });
        const data = doc? { status: doc.status, action: doc.action } : { status: false, action: 'block' };
        memoryCache.set(userId, data);
        return data;
    }
    return { status: false, action: 'block' };
};

module.exports = { setAntiCall, getAntiCall };