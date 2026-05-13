const { cmd } = require('../inconnuboy');
const config = require('../config');

cmd({
  pattern: "menu",
  alias: ["help", "m", "list", "commands"],
  react: "⚡",
  category: "menu",
  desc: "Show full bot command list",
  filename: __filename
}, async (conn, mek, m, { from, prefix, pushname }) => {
  try {
    const sender = m.sender;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const start = Date.now();

    let loadingMsg = await conn.sendMessage(from, {
        text: `╭━━━〔 *${config.BOT_NAME || 'TEDDY-XMD'}* 〕━━━╮
┃ ⏳ Loading menu...
╰━━━━━━━━━━━━╯`
    }, { quoted: mek });

    const speed = Date.now() - start;

    const menuMsg = `┏━━❐✧ ${config.BOT_NAME || 'TEDDY-XMD'} ✧❐
┃✦ User: @${sender.split('@')[0]}
┃✦ Prefix: [${prefix}]
┃✦ Mode: ${config.WORK_TYPE || 'PUBLIC'}
┃✦ Uptime: ${uptimeStr}
┃✦ Speed: ${speed}ms
┗❐

┏━━❐ \`OWNER\` ❐
┃ ✧ setprefix
┃ ✧ mode
┃ ✧ autorecording
┃ ✧ autotyping
┃ ✧ autoread
┃ ✧ autostatusview
┃ ✧ anticall
┃ ✧ antidelete
┃ ✧ broadcast
┗❐

┏━━❐ \`GROUP\` ❐
┃ ✧ tagall
┃ ✧ kick
┃ ✧ add
┃ ✧ promote
┃ ✧ demote
┃ ✧ mute
┃ ✧ unmute
┃ ✧ delete
┃ ✧ antilink
┃ ✧ antitag
┃ ✧ lockgc
┗❐

┏━━❐ \`DOWNLOAD\` ❐
┃ ✧ play
┃ ✧ video
┃ ✧ tiktok
┃ ✧ fb
┃ ✧ ig
┃ ✧ app
┃ ✧ movie
┃ ✧ gitclone
┗❐

┏━━❐ \`AI\` ❐
┃ ✧ gpt
┃ ✧ imagine
┃ ✧ gemini
┃ ✧ ai
┃ ✧ deepseek
┃ ✧ metaai
┗❐

┏━━❐ \`TOOLS\` ❐
┃ ✧ ping
┃ ✧ trt
┃ ✧ attp
┃ ✧ ss
┃ ✧ tts
┃ ✧ img
┃ ✧ tomp3
┃ ✧ tourl
┃ ✧ weather
┃ ✧ vv
┃ ✧ caption
┗❐

┏━━❐ \`FUN\` ❐
┃ ✧ hug
┃ ✧ kiss
┃ ✧ slap
┃ ✧ poke
┃ ✧ insult
┃ ✧ hack
┃ ✧ dance
┃ ✧ cry
┗❐

┏━━❐ \`LOGO\` ❐
┃ ✧ neon
┃ ✧ glitch
┃ ✧ galaxy
┃ ✧ marvel
┃ ✧ naruto
┃ ✧ blackpink
┃ ✧ dragonball
┗❐

┏━━❐ \`SETTINGS\` ❐
┃ ✧ always-online
┃ ✧ autoreact
┃ ✧ dashboard
┃ ✧ readreceipt
┃ ✧ setprefix1
┗❐

┏━━❐ \`SEARCH\` ❐
┃ ✧ define
┃ ✧ yts
┃ ✧ shazam
┃ ✧ ytstalk
┗❐

┏━━❐ \`MAIN\` ❐
┃ ✧ alive
┃ ✧ menu
┃ ✧ owner
┃ ✧ repo
┃ ✧ speed
┃ ✧ uptime
┗❐

_⚡ Powered by ${config.BOT_NAME || 'TEDDY-XMD'}_`;

    // Delete loading msg and send menu. Editing to image fails on most Baileys versions
    await conn.sendMessage(from, { delete: loadingMsg.key });

    await conn.sendMessage(from, {
        image: { url: 'https://files.catbox.moe/13nyhx.jpg' },
        caption: menuMsg,
        mentions: [sender]
    }, { quoted: mek });

  } catch (err) {
    console.log("MENU ERROR:", err);
    await conn.sendMessage(from, {
        text: `*❌ Menu Error:* ${err.message}`
    }, { quoted: mek });
  }
});