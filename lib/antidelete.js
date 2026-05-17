const { getAnti } = require('../data/antidelete');
const { getUserConfigFromMongoDB } = require('./database');

async function AntiDelete(conn, updates) {
    for (const update of updates) {
        try {
            if (!update?.update?.message || update.key?.fromMe) continue;
            if (update.key?.remoteJid === 'status@broadcast') continue;

            const chat = update.key.remoteJid;
            const isGroup = chat.endsWith('@g.us');
            const botNumber = conn.user.id.split(':')[0];

            // Check anti-delete status for this user
            const chatStatus = await getAnti(botNumber, chat);
            const globalStatus = await getAnti(botNumber, isGroup? 'gc' : 'dm');
            if (!chatStatus &&!globalStatus) continue;

            const protoMsg = update.update.message.protocolMessage;
            if (!protoMsg || protoMsg.type!== 0) continue;

            const deletedKey = protoMsg.key;
            if (!deletedKey?.id) continue;

            const deletedMsg = await conn.loadMessage(chat, deletedKey.id);
            if (!deletedMsg ||!deletedMsg.message) continue;

            const sender = deletedKey.participant || deletedKey.remoteJid;
            const senderNum = sender.split('@')[0];
            const time = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' });

            // Get owner number from MongoDB for this bot session
            const userConfig = await getUserConfigFromMongoDB(botNumber).catch(() => ({}));
            const ownerNumber = userConfig.OWNER_NUMBER || process.env.OWNER_NUMBER;

            if (!ownerNumber) {
                console.log('AntiDelete: OWNER_NUMBER not set for', botNumber);
                continue;
            }

            const ownerJid = ownerNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

            const caption =
`*🛡️ ANTI-DELETE RECOVERY*\n\n` +
`*Chat:* ${chat}\n` +
`*Type:* ${isGroup? 'Group' : 'Private'}\n` +
`*Sender:* @${senderNum}\n` +
`*Time:* ${time}\n\n` +
`_Message was deleted and recovered below:_`;

            await conn.sendMessage(ownerJid, { text: caption, mentions: [sender] });
            await conn.relayMessage(ownerJid, deletedMsg.message, {
                messageId: deletedMsg.key.id
            });

        } catch (err) {
            console.error('AntiDelete forward error:', err.message);
        }
    }
}

module.exports = { AntiDelete };