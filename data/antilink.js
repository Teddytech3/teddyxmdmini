const mongoose = require('mongoose');

const antiLinkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    status: { type: Boolean, default: false },
    action: { type: String, enum: ['delete', 'kick', 'warn'], default: 'delete' },
    whitelist: { type: [String], default: [] },
    warnLimit: { type: Number, default: 3 }
});

antiLinkSchema.index({ userId: 1, chatId: 1 }, { unique: true });

const AntiLinkDB = mongoose.models.AntiLink || mongoose.model('AntiLink', antiLinkSchema);
const memoryCache = new Map();
const makeKey = (userId, chatId) => `${userId}:${chatId}`;

const setAntiLink = async (userId, chatId, status, action = 'delete', warnLimit = 3) => {
    const key = makeKey(userId, chatId);
    memoryCache.set(key, { status, action, warnLimit });
    if (mongoose.connection.readyState === 1) {
        await AntiLinkDB.findOneAndUpdate(
            { userId, chatId },
            { $set: { userId, chatId, status, action, warnLimit } },
            { upsert: true, new: true }
        );
    }
    return true;
};

const getAntiLink = async (userId, chatId) => {
    const key = makeKey(userId, chatId);
    if (mongoose.connection.readyState === 1) {
        const doc = await AntiLinkDB.findOne({ userId, chatId });
        const data = doc? { status: doc.status, action: doc.action, whitelist: doc.whitelist, warnLimit: doc.warnLimit } : { status: false, action: 'delete', whitelist: [], warnLimit: 3 };
        memoryCache.set(key, data);
        return data;
    }
    return memoryCache.get(key) || { status: false, action: 'delete', whitelist: [], warnLimit: 3 };
};

const addWhitelist = async (userId, chatId, domain) => {
    if (mongoose.connection.readyState === 1) {
        await AntiLinkDB.findOneAndUpdate(
            { userId, chatId },
            { $addToSet: { whitelist: domain } },
            { upsert: true }
        );
    }
};

const removeWhitelist = async (userId, chatId, domain) => {
    if (mongoose.connection.readyState === 1) {
        await AntiLinkDB.findOneAndUpdate(
            { userId, chatId },
            { $pull: { whitelist: domain } }
        );
    }
};

module.exports = { setAntiLink, getAntiLink, addWhitelist, removeWhitelist };