const { cmd } = require('../inconnuboy');
const config = require('../config');
const os = require('os');
const process = require('process');

// Ping Command
cmd({
    pattern: "ping",
    desc: "Check bot latency",
    category: "general",
    react: "⚡"
},
async(conn, mek, m, { from, sender, reply }) => {
    try {
        const start = Date.now();
        const msg = await conn.sendMessage(from, { text: '*Checking...*' }, { quoted: mek });
        const ping = Date.now() - start;

        let text = `╭─「 *BOT SPEED* 」
│
│ ⚡ *Status:* Online
│ 🚀 *Latency:* ${ping}ms
│ 🖥️ *Platform:* ${os.platform()}
│
╰─「 Requested by @${sender.split('@')[0]} 」`;

        await conn.sendMessage(from, {
            text,
            mentions: [sender]
        }, { quoted: msg });
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// Alive Command
cmd({
    pattern: "alive",
    desc: "Check if bot is alive",
    category: "general",
    react: "🤖"
},
async(conn, mek, m, { from, sender, reply }) => {
    try {
        let uptime = process.uptime();
        let hours = Math.floor(uptime / 3600);
        let minutes = Math.floor((uptime % 3600) / 60);
        let seconds = Math.floor(uptime % 60);

        let text = `╭─「 *TEDDY-XMD* 」
│
│ 🤖 *Status:* Online ✅
│ 👑 *Owner:* Teddy Tech
│ ⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
│ 💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
│ 🖥️ *Platform:* ${os.platform()}
│
╰─「 Requested by @${sender.split('@')[0]} 」`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: text,
            mentions: [sender]
        }, { quoted: mek });
    } catch (e) {
        reply("Error: " + e.message);
    }
});