const { cmd } = require('../inconnuboy');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "vv2",
    alias: ["vo", "viewonce"],
    desc: "Resend view once media to inbox",
    category: "tools",
    react: "👁️",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
    try {
        const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) return reply("*❌ Reply to a view once message with vv2*");
        
        // Get the actual view-once wrapper
        const viewOnceMsg = quoted.viewOnceMessageV2 || quoted.viewOnceMessage;
        if (!viewOnceMsg) {
            return reply("*❌ That's not a view once message*\n\n*⚡ TEDDY-XMD*");
        }

        const mediaMessage = viewOnceMsg.message?.imageMessage || 
                            viewOnceMsg.message?.videoMessage || 
                            viewOnceMsg.message?.audioMessage;

        if (!mediaMessage) {
            return reply("*❌ Unsupported view once type*\n\n*⚡ TEDDY-XMD*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Download using the inner media object
        const buffer = await downloadMediaMessage(
            { message: mediaMessage },
            'buffer',
            {},
            { logger: conn.logger }
        );
        
        const mime = mediaMessage.mimetype || '';
        const caption = mediaMessage.caption || '';
        
        const ownerJid = sender;

        if (mime.startsWith('image/')) {
            await conn.sendMessage(ownerJid, {
                image: buffer,
                caption: caption ? `${caption}\n\n*👁️ View Once Recovered*\n*⚡ TEDDY-XMD*` 
                                : `*👁️ View Once Recovered*\n\n*⚡ TEDDY-XMD*`
            });
        } else if (mime.startsWith('video/')) {
            await conn.sendMessage(ownerJid, {
                video: buffer,
                caption: caption ? `${caption}\n\n*👁️ View Once Recovered*\n*⚡ TEDDY-XMD*` 
                                : `*👁️ View Once Recovered*\n\n*⚡ TEDDY-XMD*`
            });
        } else if (mime.startsWith('audio/')) {
            await conn.sendMessage(ownerJid, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: mediaMessage.ptt || false
            });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply("*✅ View once sent to your inbox*\n\n*⚡ TEDDY-XMD*");

    } catch (e) {
        console.error("[VV2 ERROR]", e);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("*❌ Failed to retrieve view once*\n_Media may be expired_\n\n*⚡ TEDDY-XMD*");
    }
});

// Auto-detect vv2 without prefix
cmd({
    on: "text",
    filename: __filename
}, async (conn, mek, m, { from, body, sender, reply }) => {
    try {
        if (body?.toLowerCase().trim() !== 'vv2') return;
        
        const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return;

        const viewOnceMsg = quoted.viewOnceMessageV2 || quoted.viewOnceMessage;
        if (!viewOnceMsg) return;

        const mediaMessage = viewOnceMsg.message?.imageMessage || 
                            viewOnceMsg.message?.videoMessage || 
                            viewOnceMsg.message?.audioMessage;
        if (!mediaMessage) return;

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const buffer = await downloadMediaMessage(
            { message: mediaMessage },
            'buffer',
            {},
            { logger: conn.logger }
        );

        const mime = mediaMessage.mimetype || '';
        const caption = mediaMessage.caption || '';
        const ownerJid = sender;

        if (mime.startsWith('image/')) {
            await conn.sendMessage(ownerJid, {
                image: buffer,
                caption: caption ? `${caption}\n\n*👁️ View Once Recovered*\n*⚡ TEDDY-XMD*` 
                                : `*👁️ View Once Recovered*\n\n*⚡ TEDDY-XMD*`
            });
        } else if (mime.startsWith('video/')) {
            await conn.sendMessage(ownerJid, {
                video: buffer,
                caption: caption ? `${caption}\n\n*👁️ View Once Recovered*\n*⚡ TEDDY-XMD*` 
                                : `*👁️ View Once Recovered*\n\n*⚡ TEDDY-XMD*`
            });
        } else if (mime.startsWith('audio/')) {
            await conn.sendMessage(ownerJid, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: mediaMessage.ptt || false
            });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply("*✅ View once sent to your inbox*\n\n*⚡ TEDDY-XMD*");

    } catch (e) {
        console.log("Auto VV2 Error:", e.message);
    }
});