const { cmd } = require('../inconnuboy');
const config = require('../config');
const os = require('os');
const process = require('process');

cmd({
  pattern: "menu",
  alias: ["help", "m", "list", "commands"],
  react: "⚡",
  category: "menu",
  desc: "Show full bot command list",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const sender = m.sender || 'unknown@s.whatsapp.net';
    const prefix = config.PREFIX || ".";
    const mode = config.WORK_TYPE?.toUpperCase() || "PUBLIC";
    const pushname = m.pushName || 'User';

    // Uptime
    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let mns = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${mns}m ${s}s`;
    };

    // Ping
    const start = Date.now();
    await conn.sendPresenceUpdate('composing', from);
    const ping = Date.now() - start;

    const menu = `
╭━━〔 *⚡ TEDDY-XMD* 〕━━╮
┃ 👤 User : @${sender.split("@")[0]}
┃ ⚙️ Prefix : ${prefix}
┃ 🌐 Mode : ${mode}
┃ ⏱️ Uptime : ${uptime()}
┃ 📡 Speed : ${ping}ms
╰━━━━━━━━━━━━╯

*👑 OWNER*
  ${prefix}setprefix | ${prefix}mode | ${prefix}autorecording
  ${prefix}autotyping | ${prefix}autoread | ${prefix}autostatusview
  ${prefix}anticall | ${prefix}antidelete | ${prefix}broadcast
  ${prefix}chatbot | ${prefix}restart | ${prefix}update

*👥 GROUP*
  ${prefix}tagall | ${prefix}kick | ${prefix}add | ${prefix}promote
  ${prefix}demote | ${prefix}mute | ${prefix}unmute | ${prefix}delete
  ${prefix}antilink | ${prefix}antitag | ${prefix}lockgc | ${prefix}unlockgc

*⬇️ DOWNLOAD*
  ${prefix}play | ${prefix}video | ${prefix}tiktok | ${prefix}fb
  ${prefix}ig | ${prefix}app | ${prefix}movie | ${prefix}gitclone

*🤖 AI*
  ${prefix}gpt | ${prefix}imagine | ${prefix}gemini | ${prefix}ai
  ${prefix}deepseek | ${prefix}metaai

*✨ TOOLS*
  ${prefix}ping | ${prefix}trt | ${prefix}attp | ${prefix}ss
  ${prefix}tts | ${prefix}img | ${prefix}tomp3 | ${prefix}tourl
  ${prefix}weather | ${prefix}vv | ${prefix}caption

*🎮 FUN*
  ${prefix}hug | ${prefix}kiss | ${prefix}slap | ${prefix}poke
  ${prefix}insult | ${prefix}hack | ${prefix}dance | ${prefix}cry

*🖼️ LOGO*
  ${prefix}neon | ${prefix}glitch | ${prefix}galaxy | ${prefix}marvel
  ${prefix}naruto | ${prefix}blackpink | ${prefix}dragonball

*⚙️ SETTINGS*
  ${prefix}always-online | ${prefix}autoreact | ${prefix}dashboard
  ${prefix}readreceipt | ${prefix}setprefix1

*🔍 SEARCH*
  ${prefix}define | ${prefix}yts | ${prefix}shazam | ${prefix}ytstalk

*📱 MAIN*
  ${prefix}alive | ${prefix}menu | ${prefix}owner | ${prefix}repo
  ${prefix}speed | ${prefix}uptime

_⚡ Powered by TEDDY-XMD_
`;

    await conn.sendMessage(from, {
      image: { url: config.IMAGE_PATH || 'https://files.catbox.moe/13nyhx.jpg' },
      caption: menu,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421104812135@newsletter',
          newsletterName: 'TEDDY XMD OFFICIAL',
          serverMessageId: -1
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.log("MENU ERROR:", err);
    reply("*❌ Failed to load menu*");
  }
});