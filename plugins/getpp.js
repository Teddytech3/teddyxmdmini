const { cmd } = require('../inconnuboy');
const config = require('../config');

cmd({
    pattern: "getpp",
    alias: ["pp", "profile", "dp"],
    desc: "Fetch user profile picture natively",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        // 1. Identify Target
        let target;
        if (m.quoted) {
            target = m.quoted.key.participant || m.quoted.key.remoteJid;
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            target = m.mentionedJid[0];
        } else if (q) {
            let num = q.replace(/[^0-9]/g, '');
            if (!num) return reply("❌ Enter a valid number");
            target = num + '@s.whatsapp.net';
        } else {
            target = m.sender;
        }

        await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } }).catch(() => {});

        // 2. Fetch the Profile Picture
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(target, 'image');
        } catch (e) {
            ppUrl = 'https://telegra.ph/file/0285437887752697a29f8.jpg'; // Default placeholder
        }

        const userNumber = target.split('@')[0];

        // 3. Craft the message
        const stylishMsg = `
✨ *𝐓𝐄𝐃𝐘-𝐗𝐌𝐃 𝐏𝐑𝐎𝐅𝐈𝐋𝐄* ✨

👤 *𝐔𝐬𝐞𝐫:* @${userNumber}
📂 *𝐒𝐭𝐚𝐭𝐮𝐬:* Successfully Retrieved
🛡️ *𝐒𝐨𝐮𝐫𝐜𝐞:* Native WhatsApp Server

> *𝐓𝐄𝐃𝐘-𝐗𝐌𝐃: 𝐒𝐢𝐦𝐩𝐥𝐞. 𝐅𝐚𝐬𝐭. 𝐑𝐞𝐥𝐢𝐚𝐛𝐥𝐞.*
`.trim();

        // 4. Send the result
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: stylishMsg,
            mentions: [target],
            footer: config.BOT_FOOTER || '𝚃𝙴𝙳𝚈-𝚇𝙼𝙳 ᴋᴇɴʏᴀ 🇰🇪'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } }).catch(() => {});

    } catch (err) {
        console.error("GETPP ERROR:", err);
        reply("❌ *Teddy, I couldn't fetch that!* \n\nThis happens if the user has hidden their profile picture or if the number is not on WhatsApp.");
    }
});