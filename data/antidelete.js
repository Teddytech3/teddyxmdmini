const mongoose = require('mongoose');

// delete cached model if it exists
if (mongoose.models.AntiDelV2) {
    delete mongoose.models.AntiDelV2;
}

const antiDelSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    type: { type: String, enum: ['gc', 'dm', 'chat'], default: 'chat' },
    status: { type: Boolean, default: false },
}, {
    strict: false,
    collection: 'antidels_v2'
});

const AntiDelDB = mongoose.model('AntiDelV2', antiDelSchema);

const memoryCache = new Map();

const isMongoReady = () => mongoose.connection.readyState === 1;
const makeKey = (userId, chatId) => `${userId}:${chatId}`;

const initializeAntiDeleteSettings = async (userId) => {
    try {
        if (!isMongoReady()) {
            console.log('Mongo not ready, skipping init');
            return;
        }
        for (const type of ['gc', 'dm']) {
            await AntiDelDB.findOneAndUpdate(
                { userId, chatId: type },
                { $setOnInsert: { userId, chatId: type, type, status: false } },
                { upsert: true, new: true }
            );
        }
    } catch (e) {
        console.error('initializeAntiDeleteSettings error:', e);
    }
};

const setAnti = async (userId, chatId, status) => {
    try {
        const key = makeKey(userId, chatId);
        memoryCache.set(key, status);

        if (!isMongoReady()) {
            console.log('Mongo not ready, saved to memory only');
            return true;
        }

        await AntiDelDB.findOneAndUpdate(
            { userId, chatId },
            { userId, chatId, status, type: chatId === 'gc' || chatId === 'dm'? chatId : 'chat' },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.error('setAnti error:', e);
        return false;
    }
};

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
        console.error('getAnti error:', e);
        return memoryCache.get(makeKey(userId, chatId)) || false;
    }
};

const getAllAntiDeleteSettings = async (userId) => {
    try {
        if (isMongoReady()) {
            return await AntiDelDB.find({ userId });
        }
        return [...memoryCache.entries()]
      .filter(([k]) => k.startsWith(userId + ':'))
      .map(([k, status]) => ({ chatId: k.split(':')[1], status }));
    } catch (e) {
        console.error('getAllAntiDeleteSettings error:', e);
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
