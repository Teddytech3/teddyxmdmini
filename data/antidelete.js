const mongoose = require('mongoose');

// delete cached model if it exists to prevent strict mode errors
if (mongoose.models.AntiDel) {
    delete mongoose.models.AntiDel;
}

// ─── Mongoose Schema ─────────────────────────────────────────────────────────
const antiDelSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // connected bot number
    chatId: { type: String, required: true }, // 'gc', 'dm', or specific chat jid
    type: { type: String, enum: ['gc', 'dm', 'chat'], default: 'chat' },
    status: { type: Boolean, default: false },
}, { strict: false });

antiDelSchema.index({ userId: 1, chatId: 1 }, { unique: true });

const AntiDelDB = mongoose.model('AntiDel', antiDelSchema);

// ─── In-memory fallback ──────────────────────
const memoryCache = new Map(); // key: userId:chatId

// ─── Helpers ──────────────────────────────────
const isMongoReady = () => mongoose.connection.readyState === 1;
const makeKey = (userId, chatId) => `${userId}:${chatId}`;

/**
 * Initialize default anti-delete settings for a user
 */
const initializeAntiDeleteSettings = async (userId) => {
    try {
        if (!isMongoReady()) return;
        for (const type of ['gc', 'dm']) {
            await AntiDelDB.findOneAndUpdate(
                { userId, chatId: type },
                { $setOnInsert: { userId, chatId: type, type, status: false } },
                { upsert: true, new: true }
            );
        }
    } catch (e) {
        console.error('initializeAntiDeleteSettings error:', e.message);
    }
};

/**
 * Set anti-delete status for user + chat
 */
const setAnti = async (userId, chatId, status) => {
    try {
        const key = makeKey(userId, chatId);
        memoryCache.set(key, status);

        if (!isMongoReady()) return true;

        await AntiDelDB.findOneAndUpdate(
            { userId, chatId },
            { userId, chatId, status, type: chatId === 'gc' || chatId === 'dm'? chatId : 'chat' },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.error('setAnti error:', e.message);
        return false;
    }
};

/**
 * Get anti-delete status for user + chat
 */
const getAnti = async (userId, chatId) => {
    try {
        const key = makeKey(userId, chatId);

        if (isMongoReady()) {
            const doc = await AntiDelDB.findOne({ userId, chatId });
            const status = doc? doc.status : false;
            memoryCache.set(key, status);
            return status;
        }

        return memoryCache.get(key) || false;
    } catch (e) {
        return memoryCache.get(makeKey(userId, chatId)) || false;
    }
};

/**
 * Get all anti-delete settings for a user
 */
const getAllAntiDeleteSettings = async (userId) => {
    try {
        if (isMongoReady()) {
            return await AntiDelDB.find({ userId });
        }
        return [...memoryCache.entries()]
         .filter(([k]) => k.startsWith(userId + ':'))
         .map(([k, status]) => ({ chatId: k.split(':')[1], status }));
    } catch (e) {
        return [];
    }
};

module.exports = {
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings,
};
