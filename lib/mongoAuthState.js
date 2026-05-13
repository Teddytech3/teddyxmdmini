const mongoose = require('mongoose');
const { initAuthCreds } = require('@whiskeysockets/baileys');

const authSchema = new mongoose.Schema({
    _id: String,
    creds: Object,
    keys: Object
});
const AuthModel = mongoose.model('auth', authSchema);

const useMongoAuthState = async (id) => {
    let data = await AuthModel.findById(id).lean();

    const creds = data?.creds && Object.keys(data.creds).length > 0
      ? data.creds
        : initAuthCreds(); // <-- this line fixes it

    const state = {
        creds,
        keys: {
            get: async (type, ids) => {
                const keyData = await AuthModel.findById(`${id}:${type}:${ids[0]}`).lean();
                return keyData?.keys || {};
            },
            set: async (data) => {
                for (const category in data) {
                    for (const id in data[category]) {
                        await AuthModel.findByIdAndUpdate(
                            `${id}:${category}:${id}`,
                            { keys: data[category][id] },
                            { upsert: true }
                        );
                    }
                }
            },
            clear: async () => {
                await AuthModel.deleteMany({ _id: new RegExp(`^${id}:`) });
            }
        }
    };

    const saveCreds = async () => {
        await AuthModel.findByIdAndUpdate(id, { creds: state.creds }, { upsert: true });
    };

    return { state, saveCreds };
};

module.exports = { useMongoAuthState };
