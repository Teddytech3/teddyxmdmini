const { cmd } = require('../inconnuboy');
const config = require('../config');
const process = require('process');

cmd({
  pattern: "menu",
  alias: ["help", "m", "list", "commands"],
  react: "⚡",
  category: "menu",
  desc: "Show full bot command list",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    const prefix = config.PREFIX || ".";
    const mode = config.WORK_TYPE?.toUpperCase() || "PUBLIC";

    // Loading message
    let loading = await conn.sendMessage(from, {
      text: '*TEDDY XMD Loading...* ⚡'
    }, { quoted: mek });

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

    await new Promise(resolve => setTimeout(resolve, 1200));

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

*👥 GROUP*
  ${prefix}tagall | ${prefix}kick | ${prefix}add | ${prefix}promote
  ${prefix}demote | ${prefix}mute | ${prefix}unmute | ${prefix}delete
  ${prefix}antilink | ${prefix}antitag | ${prefix}lockgc

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

    const imgUrl = 'https://files.catbox.moe/13nyhx.jpg';

    try {
      await conn.sendMessage(from, {
        image: { url: imgUrl },
        caption: menu,
        mentions: [sender],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID || '120363421104812135@newsletter',
            newsletterName: config.OWNER_NAME || 'TEDDY XMD OFFICIAL',
            serverMessageId: -1
          }
        }
      }, { quoted: loading });
    } catch (imgErr) {
      console.log("Menu image failed, sending text only:", imgErr.message);
      await conn.sendMessage(from, {
        text: menu,
        mentions: [sender]
      }, { quoted: loading });
    }

  } catch (err) {
    console.log("MENU ERROR:", err);
    reply("*❌ Failed to load menu*");
  }
});