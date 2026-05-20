const { cmd } = require('../inconnuboy');
const config = require('../config');

cmd({
    pattern: "tagall",
    alias: ["everyone", "all"],
    desc: "Mention all members with a stylish header and forwarded newsletter style",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, args, q, reply, sender }) => {
    try {
        if (!isGroup) return reply("❌ *This command only works in groups!*");

        await conn.sendMessage(from, { react: { text: "📣", key: mek.key } });

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let mentions = [];

        let tagMessage = `╭───「 *𝐓𝐄D𝐃𝐘-𝐗𝐌𝐃 𝐓𝐀𝐆𝐒* 」
│
│ 📢 ${q ? q : 'Hey everyone, pay attention!'}
│
├───「 *INFO* 」
│ 👤 By: @${m.sender.split('@')[0]}
│ 👥 Members: ${participants.length}
│ ⏰ Time: ${new Date().toLocaleTimeString()}
│
├───「 *MEMBERS* 」
`;

        for (let participant of participants) {
            tagMessage += `│ ◦ @${participant.id.split('@')[0]}\n`;
            mentions.push(participant.id);
        }

        tagMessage += `╰───────────────
✨ *Powered by Teddy Tech 🇰🇪*`;

        const newsletterContextInfo = {
            mentionedJid: mentions.concat(sender),
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID || '120363421104812135@newsletter',
                newsletterName: config.OWNER_NAME || '𝐓𝐄𝐃𝐘-𝐗𝐌𝐃',
                serverMessageId: 1
            }
        };

        await conn.sendMessage(from, { 
            image: { url: 'https://files.catbox.moe/13nyhx.jpg' }, 
            caption: tagMessage, 
            mentions: mentions,
            contextInfo: newsletterContextInfo
        }, { quoted: mek });

    } catch (err) {
        console.error("TAGALL ERROR:", err);
        reply("❌ *Failed to tag all members.*");
    }
});