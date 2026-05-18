const mongoose = require('mongoose');

if (mongoose.models.SettingsV2) {
    delete mongoose.models.SettingsV2;
}

const settingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '.' },
    workType: { type: String, default: 'public' },
    autoReact: { type: Boolean, default: false },
    autoReactNumbers: { type: [String], default: [] },
    autoReactEmojis: { type: [String], default: ['❤️', '👍'] },
    autoTyping: { type: Boolean, default: false },
    autoRecording: { type: Boolean, default: false },
    autoReadStatus: { type: Boolean, default: false },
    autoReactStatus: { type: Boolean, default: false },
    channelReact: { type: Boolean, default: false },
    channelReactEmojis: { type: [String], default: ['❤️'] },
}, {
    strict: false,
    collection: 'settings_v2' // new collection
});

const SettingsDB = mongoose.model('SettingsV2', settingsSchema);

const isMongoReady = () => mongoose.connection.readyState === 1;

const getSettings = async (userId) => {
    try {
        if (!isMongoReady()) return {};
        let doc = await SettingsDB.findOne({ userId });
        if (!doc) {
            doc = await SettingsDB.create({ userId });
        }
        return doc.toObject();
    } catch (e) {
        console.error('getSettings error:', e);
        return {};
    }
};

const updateSetting = async (userId, key, value) => {
    try {
        if (!isMongoReady()) return false;
        await SettingsDB.findOneAndUpdate(
            { userId },
            { $set: { [key]: value } },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.error('updateSetting error:', e);
        return false;
    }
};

module.exports = { getSettings, updateSetting };
