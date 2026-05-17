const mongoose = require('mongoose');

const antiTagSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    status: { type: Boolean, default: false },
    action: { type: String, enum: ['delete', 'kick'], default: 'delete' },
    limit: { type: Number, default: 5 }
});

antiTagSchema.index({ userId: 1, chatId: 1 }, { unique: true });

const AntiTagDB = mongoose.models.AntiTag || mongoose.model('AntiTag', antiTagSchema);

const setAntiTag = async (userId, chatId, status, action = 'delete', limit = 5) => {
    if (mongoose.connection.readyState === 1) {
        await AntiTagDB.findOneAndUpdate(
            { userId, chatId },
            { userId, chatId, status, action, limit },
            { upsert: true, new: true }
        );
    }
};

const getAntiTag = async (userId, chatId) => {
    if (mongoose.connection.readyState === 1) {
        const doc = await AntiTagDB.findOne({ userId, chatId });
        return doc? { status: doc.status, action: doc.action, limit: doc.limit } : { status: false, action: 'delete', limit: 5 };
    }
    return { status: false, action: 'delete', limit: 5 };
};

module.exports = { setAntiTag, getAntiTag };