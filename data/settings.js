const mongoose = require('mongoose');

// Clear cached model
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
    autoReadStatus: { type: Boolean, default: true },
    autoReactStatus: { type: Boolean, default: true },
    channelReact: { type: Boolean, default: true },
    channelReactEmojis: { type: [String], default: ['❤️'] },
}, {
    strict: false,
    collection: 'settings_v2',
    autoIndex: true
});

const SettingsDB = mongoose.model('SettingsV2', settingsSchema);

const isMongoReady = () => mongoose.connection.readyState === 1;

// Auto-fix duplicate index on startup
const fixIndexes = async () => {
    try {
        const indexes = await SettingsDB.collection.indexes();
        const hasOldIndex = indexes.some(idx => idx.name === 'userId_1' && idx.unique === true);

        if (hasOldIndex) {
            await SettingsDB.collection.dropIndex('userId_1');
            console.log('✅ Dropped old userId_1 index');
        }
    } catch (e) {
        if (e.code!== 27) { // 27 = index not found, ignore it
            console.error('Index fix error:', e.message);
        }
    }
};

mongoose.connection.once('connected', fixIndexes);

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
        return false;
    }
};

module.exports = { getSettings, updateSetting };
