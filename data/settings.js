const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '.' },
    workType: { type: String, default: 'public' }, // public, private, inbox, group
    autoReact: { type: Boolean, default: false },
    autoReactNumbers: { type: [String], default: [] },
    autoReactEmojis: { type: [String], default: ['❤️','🔥','💯','👑','⚡'] },
    autoTyping: { type: Boolean, default: false },
    autoRecording: { type: Boolean, default: false },
    channelReact: { type: Boolean, default: true },
    channelReactEmojis: { type: [String], default: ['❤️','👍','🔥','💯','🙏'] },
    autoReadStatus: { type: Boolean, default: false },
    autoReactStatus: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

const SettingsDB = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
const memoryCache = new Map();

const getSettings = async (userId) => {
    if (memoryCache.has(userId)) return memoryCache.get(userId);

    if (mongoose.connection.readyState === 1) {
        const doc = await SettingsDB.findOne({ userId });
        if (doc) {
            memoryCache.set(userId, doc.toObject());
            return doc.toObject();
        }
    }

    const defaults = {
        prefix: '.',
        workType: 'public',
        autoReact: false,
        autoReactNumbers: [],
        autoReactEmojis: ['❤️','🔥','💯','👑','⚡'],
        autoTyping: false,
        autoRecording: false,
        channelReact: true,
        channelReactEmojis: ['❤️','👍','🔥','💯','🙏'],
        autoReadStatus: false,
        autoReactStatus: false
    };
    memoryCache.set(userId, defaults);
    return defaults;
};

const updateSetting = async (userId, key, value) => {
    const current = await getSettings(userId);
    current[key] = value;
    current.updatedAt = new Date();
    memoryCache.set(userId, current);

    if (mongoose.connection.readyState === 1) {
        await SettingsDB.findOneAndUpdate(
            { userId },
            { $set: current },
            { upsert: true, new: true }
        );
    }
    return current;
};

module.exports = { getSettings, updateSetting };