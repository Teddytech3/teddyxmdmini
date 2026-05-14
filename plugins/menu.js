const { cmd } = require('../inconnuboy');
const config = require('../config');
const os = require('os');

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
    const speed = Date.now() - start;

    // Platform detection
    let platform = 'Unknown';
    if (process.env.PTERODACTYL || process.env.PANEL) {
      platform = '🖥️ Panel';
    } else if (process.env.REPLIT_USER) {
      platform = '🔄 Replit';
    } else if (process.env.RAILWAY_ENVIRONMENT) {
      platform = '🚂 Railway';
    } else if (process.env.RENDER) {
      platform = '🎨 Render';
    } else if (os.platform() === 'linux') {
      platform = '🐧 Linux VPS';
    } else if (os.platform() === 'win32') {
      platform = '🪟 Windows';
    } else if (os.platform() === 'darwin') {
      platform = '🍎 MacOS';
    }

    // RAM usage - fixed
    const totalMem = os.totalmem();
    const freeMem = os.freem();
    const usedMem = totalMem - freeMem;
    const usedPercent = Math.round((usedMem / totalMem) * 100);
    const usedMB = (usedMem / 1024 / 1024).toFixed(0);
    const totalMB = (totalMem / 1024 / 1024).toFixed(0);

    // RAM bar
    const barLength = 10;
    const filled = Math.round((usedPercent / 100) * barLength);
    const ramBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    // Readmore trick
    const readmore = String.fromCharCode(8206).repeat(2000);

    let loadingMsg = await conn.sendMessage(from, {
        text: `╭━━━〔 *${config.BOT_NAME || 'TEDDY-XMD'}* 〕━━━╮
┃ ⏳ Loading menu...
╰━━━━━━━━━━━━╯`
    }, { quoted: mek });

    const menuMsg = `┏━━❐✧ ${config.BOT_NAME || 'TEDDY-XMD'} ✧❐
┃✦ User: @${sender.split('@')[0]}
┃✦ Prefix: [${prefix}]
┃✦ Owner: ${config.OWNER_NAME || 'Not set!'}
┃✦ Mode: ${config.WORK_TYPE || 'PUBLIC'}
┃✦ Platform: ${platform}
┃✦ Speed: ${speed} ms
┃✦ Uptime: ${uptimeStr}
┃✦ Version: v2.7.6
┃✦ Usage: ${usedMB} MB of ${totalMB} MB
┃✦ RAM: [${ramBar} ${usedPercent}%]
┗❐${readmore}

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

    await conn.sendMessage(from, { delete: loadingMsg.key });

    await conn.sendMessage(from, {
        text: menuMsg,
        mentions: [sender]
    }, { quoted: mek });

  } catch (err) {
    console.log("MENU ERROR:", err);
    await conn.sendMessage(from, {
        text: `*❌ Menu Error:* ${err.message}`
    }, { quoted: mek });
  }
});