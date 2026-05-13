const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Unknown content';
    deleteInfo += `\n\n*Content:* ${messageContent}`;

    await conn.sendMessage(
        jid,
        {
            text: deleteInfo,
            contextInfo: {
                mentionedJid: isGroup ? [update.key.participant, mek.key.participant] : [update.key.remoteJid],
            },
        },
        { quoted: mek },
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    const antideletedmek = structuredClone(mek.message);
    const messageType = Object.keys(antideletedmek)[0];
    if (antideletedmek[messageType]) {
        antideletedmek[messageType].contextInfo = {
            stanzaId: mek.key.id,
            participant: mek.sender,
            quotedMessage: mek.message,
        };
    }
    if (messageType === 'imageMessage' || messageType === 'videoMessage') {
        antideletedmek[messageType].caption = deleteInfo;
    } else if (messageType === 'audioMessage' || messageType === 'documentMessage') {
        await conn.sendMessage(jid, { text: `*🚨 Delete Detected!*\n\n${deleteInfo}` }, { quoted: mek });
    }
    await conn.relayMessage(jid, antideletedmek, {});
};

const AntiDelete = async (conn, updates) => {
    for (const update of updates) {
        try {
            // Support both deletion signals:
            // 1. message === null  (Baileys store-based deletion)
            // 2. protocolMessage.type === 0  (WhatsApp revoke protocol)
            const isRevoke =
                update.update.message === null ||
                (update.update.message?.protocolMessage?.type === 0);

            if (!isRevoke) continue;

            // The deleted message ID:
            // - For message===null: it's the update key itself
            // - For protocolMessage: it's stored in protocolMessage.key.id
            const deletedId =
                update.update.message?.protocolMessage?.key?.id || update.key.id;

            const store = await loadMessage(deletedId);
            if (!store || !store.message) continue;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);
            const antiDeleteType = isGroup ? 'gc' : 'dm';
            const antiDeleteStatus = await getAnti(antiDeleteType);
            if (!antiDeleteStatus) continue;

            const deleteTime = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Fix conn.user.id: it comes as "number:device@s.whatsapp.net"
            const botJid = conn.user.id.includes(':')
                ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
                : conn.user.id;

            let deleteInfo, jid;
            if (isGroup) {
                let groupName = store.jid;
                try {
                    const groupMetadata = await conn.groupMetadata(store.jid);
                    groupName = groupMetadata.subject;
                } catch (_) {}
                const sender = (mek.key.participant || mek.key.remoteJid)?.split('@')[0];
                const deleter = (update.key.participant || update.key.remoteJid)?.split('@')[0];

                deleteInfo = `*AntiDelete Detected*\n\n*Time:* ${deleteTime}\n*Group:* ${groupName}\n*Deleted by:* @${deleter}\n*Sender:* @${sender}`;
                jid = config.ANTI_DEL_PATH === 'log' ? botJid : store.jid;
            } else {
                const senderNumber = mek.key.remoteJid?.split('@')[0];
                const deleterNumber = (update.key.remoteJid || store.jid)?.split('@')[0];

                deleteInfo = `*-- AntiDelete Detected --*\n\n*Time:* ${deleteTime}\n*Deleted by:* @${deleterNumber}\n*Sender:* @${senderNumber}`;
                jid = config.ANTI_DEL_PATH === 'log' ? botJid : (update.key.remoteJid || store.jid);
            }

            if (mek.message?.conversation || mek.message?.extendedTextMessage) {
                await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
            } else {
                await DeletedMedia(conn, mek, jid, deleteInfo);
            }
        } catch (e) {
            console.error('AntiDelete loop error:', e.message);
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};