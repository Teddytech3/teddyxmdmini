const mongoose = require('mongoose');

// Clear cached model to avoid old collection issues
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
    collection: 'settings_v2' // new collection to avoid old index conflicts
});

const SettingsDB = mongoose.model('SettingsV2', settingsSchema);

const isMongoReady = () => mongoose.connection.readyState === 1;

const getSettings = async (userId) => {
    try {
        if (!isMongoReady()) {
            console.error('getSettings: MongoDB not connected. readyState:', mongoose.connection.readyState);
            return {};
        }
        let doc = await SettingsDB.findOne({ userId });
        if (!doc) {
            doc = await SettingsDB.create({ userId });
        }
        return doc.toObject();
    } catch (e) {
        console.error('getSettings error:', e.message);
        console.error('Full error:', e);
        return {};
    }
};

const updateSetting = async (userId, key, value) => {
    try {
        if (!userId) {
            console.error('updateSetting: userId is missing');
            return false;
        }
        if (!isMongoReady()) {
            console.error('updateSetting: MongoDB not connected. readyState:', mongoose.connection.readyState);
            return false;
        }

        await SettingsDB.findOneAndUpdate(
            { userId },
            { $set: { [key]: value } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return true;
    } catch (e) {
        console.error('updateSetting error:', e.message);
        console.error('Full error:', e); // shows code, keyPattern, etc
        return false;
    }
};

module.exports = { getSettings, updateSetting };
