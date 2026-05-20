const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Unknown content';
    deleteInfo += `\n\n*Content:* ${messageContent}`;

    await conn.sendMessage(
        jid,
        {
            text: deleteInfo,
            contextInfo: {
                mentionedJid: isGroup? [update.key.participant, mek.key.participant] : [update.key.remoteJid],
            },
        },
        { quoted: mek },
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    try {
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
            return;
        }
        await conn.relayMessage(jid, antideletedmek, {});
    } catch (e) {
        console.log('AntiDelete media relay failed:', e.message);
        await conn.sendMessage(jid, { text: `*🚨 Delete Detected!*\n\n${deleteInfo}\n\n⚠️ Couldn't recover media.` });
    }
};

const AntiDelete = async (conn, updates, botNumber) => {
    if (!conn.user?.id) return;

    for (const update of updates) {
        try {
            const isRevoke =
                update.update.message === null ||
                (update.update.message?.protocolMessage?.type === 0);

            if (!isRevoke) continue;

            const deletedId =
                update.update.message?.protocolMessage?.key?.id || update.key.id;

            const store = await loadMessage(deletedId);
            if (!store ||!store.message) continue;

            const mek = store.message;
            const isGroup = isJidGroup(store.jid);
            const antiDeleteType = isGroup? 'gc' : 'dm';
            const antiDeleteStatus = await getAnti(antiDeleteType);
            if (!antiDeleteStatus) continue;

            const deleteTime = new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Send to the connected bot number from MongoDB
            const targetJid = `${botNumber}@s.whatsapp.net`;

            let deleteInfo;
            if (isGroup) {
                let groupName = store.jid;
                try {
                    const groupMetadata = await conn.groupMetadata(store.jid);
                    groupName = groupMetadata.subject;
                } catch (_) {}
                const sender = (mek.key.participant || mek.key.remoteJid)?.split('@')[0];
                const deleter = (update.key.participant || update.key.remoteJid)?.split('@')[0];

                deleteInfo = `*AntiDelete Detected*\n\n*Time:* ${deleteTime}\n*Group:* ${groupName}\n*Deleted by:* @${deleter}\n*Sender:* @${sender}`;
            } else {
                const senderNumber = mek.key.remoteJid?.split('@')[0];
                const deleterNumber = (update.key.remoteJid || store.jid)?.split('@')[0];
                deleteInfo = `*-- AntiDelete Detected --*\n\n*Time:* ${deleteTime}\n*Deleted by:* @${deleterNumber}\n*Sender:* @${senderNumber}`;
            }

            if (mek.message?.conversation || mek.message?.extendedTextMessage) {
                await DeletedText(conn, mek, targetJid, deleteInfo, isGroup, update);
            } else {
                await DeletedMedia(conn, mek, targetJid, deleteInfo);
            }
        } catch (e) {
            console.error('AntiDelete loop error:', e.message);
        }
    }
};

module.exports = { DeletedText, DeletedMedia, AntiDelete };