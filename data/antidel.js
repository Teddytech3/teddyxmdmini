const mongoose = require('mongoose');

// ─── Mongoose Schema ─────────────────────────────────────────────────────────
const antiDelSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['gc', 'dm', 'all'], default: 'all' },
    status: { type: Boolean, default: false },
});

const AntiDelDB = mongoose.models.AntiDel || mongoose.model('AntiDel', antiDelSchema);

// ─── In-memory fallback (used when MongoDB is not ready) ──────────────────────
const memoryCache = new Map(); // key: "gc" | "dm" | chatId

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isMongoReady = () => mongoose.connection.readyState === 1;

/**
 * Initialize default anti-delete settings if not already present.
 * Call this once on bot startup.
 */
const initializeAntiDeleteSettings = async () => {
    try {
        if (!isMongoReady()) return;
        for (const type of ['gc', 'dm']) {
            await AntiDelDB.findOneAndUpdate(
                { chatId: type },
                { $setOnInsert: { chatId: type, type, status: false } },
                { upsert: true, new: true }
            );
        }
    } catch (e) {
        console.error('initializeAntiDeleteSettings error:', e.message);
    }
};

/**
 * Set anti-delete status.
 * @param {'gc'|'dm'|string} type  - 'gc' (groups), 'dm' (private), or a specific chatId
 * @param {boolean} status
 */
const setAnti = async (type, status) => {
    try {
        memoryCache.set(type, status); // always update memory
        if (!isMongoReady()) return true;
        await AntiDelDB.findOneAndUpdate(
            { chatId: type },
            { status },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.error('setAnti error:', e.message);
        return false;
    }
};

/**
 * Get anti-delete status.
 * @param {'gc'|'dm'|string} type
 * @returns {Promise<boolean>}
 */
const getAnti = async (type) => {
    try {
        if (isMongoReady()) {
            const doc = await AntiDelDB.findOne({ chatId: type });
            const status = doc ? doc.status : false;
            memoryCache.set(type, status); // keep memory in sync
            return status;
        }
        // Fallback to memory
        return memoryCache.get(type) || false;
    } catch (e) {
        return memoryCache.get(type) || false;
    }
};

/**
 * Get all anti-delete settings.
 * @returns {Promise<Array>}
 */
const getAllAntiDeleteSettings = async () => {
    try {
        if (isMongoReady()) {
            return await AntiDelDB.find({});
        }
        return [...memoryCache.entries()].map(([chatId, status]) => ({ chatId, status }));
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
