const axios = require('axios');
const { cmd } = require('../inconnuboy');
const config = require('../config');

cmd({
    pattern: "repo",
    alias: ["git", "sc", "script"],
    desc: "Fetch the bot repository details",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
    try {
        // Loading message
        let loading = await conn.sendMessage(from, {
            text: '*Fetching repo details...* 👑'
        }, { quoted: mek });

        const repoUrl = "https://github.com/Teddytech1/TEDDY-XMD";
        const apiUrl = "https://api.github.com/repos/Teddytech1/TEDDY-XMD";

        const response = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'TEDDY-XMD' },
            timeout: 10000
        });
        const data = response.data;

        let repoMsg = `╭─「 *TEDDY-XMD* 」
│
│ 🧬 *Repo:* ${data.name}
│ 👤 *Owner:* ${data.owner.login}
│ 📝 *Desc:* ${data.description || 'No description'}
│ 💻 *Language:* ${data.language || 'N/A'}
│
│ ⭐ *Stars:* ${data.stargazers_count}
│ 🍴 *Forks:* ${data.forks_count}
│ 👀 *Watchers:* ${data.watchers_count}
│ 📅 *Updated:* ${new Date(data.updated_at).toLocaleDateString()}
│
│ 🔗 *Link:* ${repoUrl}
│
╰─「 Requested by @${sender.split('@')[0]} 」`;

        const fakevCard = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "𝐓𝐄𝐃𝐘-𝐗𝐌𝐃",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:𝐓𝐄𝐃𝐘-𝐗𝐌𝐃\nORG:𝐓𝐄𝐃𝐘-𝐗𝐌𝐃;\nTEL;type=CELL;type=VOICE;waid=254799963583:+254799963583\nEND:VCARD`
                }
            }
        };

        const newsletterContextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID || '120363421104812135@newsletter',
                newsletterName: config.OWNER_NAME || '𝐓𝐄𝐃𝐘-𝐗𝐌𝐃',
                serverMessageId: 1
            }
        };

        const imgUrl = 'https://files.catbox.moe/13nyhx.jpg';

        try {
            await conn.sendMessage(from, {
                image: { url: imgUrl },
                caption: repoMsg,
                contextInfo: newsletterContextInfo,
                mentions: [sender]
            }, { quoted: fakevCard });
        } catch (imgErr) {
            console.log("Repo image failed, sending text only:", imgErr.message);
            await conn.sendMessage(from, {
                text: repoMsg,
                contextInfo: newsletterContextInfo,
                mentions: [sender]
            }, { quoted: fakevCard });
        }

    } catch (e) {
        console.error(e);
        reply("❌ Failed to fetch repo data. Try again later.");
    }
});