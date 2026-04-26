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

    const customMenu = `
*╭───〘 ⚡ TEDDY-XMD 〙───*
*│*
*│ 👤 User : @${sender.split("@")[0]}*
*│ ⚙️ Prefix : ${prefix}*
*│ 🌐 Mode : ${mode}*
*│ ⏱️ Uptime : ${uptime()}*
*│ 📡 Speed : ${ping}ms*
*│*
*╰────────────────*

*╭─〔 👑 OWNER MENU 〕*
*│ • ${prefix}setprefix*
*│ • ${prefix}mode*
*│ • ${prefix}autorecording*
*│ • ${prefix}autotyping*
*│ • ${prefix}autoread*
*│ • ${prefix}autostatusview*
*│ • ${prefix}autobio*
*│ • ${prefix}anticall*
*│ • ${prefix}antidelete*
*│ • ${prefix}broadcast*
*│ • ${prefix}ch*
*│ • ${prefix}chatbot*
*│ • ${prefix}clearchats*
*│ • ${prefix}forward*
*│ • ${prefix}getstatusreact*
*│ • ${prefix}gjid*
*│ • ${prefix}nulpp*
*│ • ${prefix}block*
*│ • ${prefix}unblock*
*│ • ${prefix}welcome*
*│ • ${prefix}goodbye*
*│ • ${prefix}restart*
*│ • ${prefix}setpp*
*│ • ${prefix}setstatusreact*
*│ • ${prefix}shutdown*
*│ • ${prefix}update*
*│ • ${prefix}xx*
*╰────────────────*

*╭─〔 👥 GROUP MENU 〕*
*│ • ${prefix}tagall*
*│ • ${prefix}online*
*│ • ${prefix}kick*
*│ • ${prefix}add*
*│ • ${prefix}promote*
*│ • ${prefix}demote*
*│ • ${prefix}mute*
*│ • ${prefix}unmute*
*│ • ${prefix}acceptall*
*│ • ${prefix}antibad*
*│ • ${prefix}antilink*
*│ • ${prefix}antitag*
*│ • ${prefix}delete*
*│ • ${prefix}join*
*│ • ${prefix}left*
*│ • ${prefix}lockgc*
*│ • ${prefix}unlockgc*
*│ • ${prefix}newgroup*
*│ • ${prefix}rejectall*
*│ • ${prefix}requestlist*
*│ • ${prefix}tagadmins*
*╰────────────────*

*╭─〔 ⬇️ DOWNLOAD MENU 〕*
*│ • ${prefix}video*
*│ • ${prefix}tiktok*
*│ • ${prefix}fb*
*│ • ${prefix}play*
*│ • ${prefix}play2*
*│ • ${prefix}ig*
*│ • ${prefix}app*
*│ • ${prefix}movie*
*│ • ${prefix}pair*
*│ • ${prefix}pair2*
*│ • ${prefix}pindl*
*│ • ${prefix}gitclone*
*│ • ${prefix}instagram*
*╰────────────────*

*╭─〔 🤖 AI MENU 〕*
*│ • ${prefix}gpt*
*│ • ${prefix}imagine*
*│ • ${prefix}gemini*
*│ • ${prefix}ai*
*│ • ${prefix}deepseek*
*│ • ${prefix}metaai*
*│ • ${prefix}openai*
*╰────────────────*

*╭─〔 ✨ TOOLS MENU 〕*
*│ • ${prefix}ping*
*│ • ${prefix}tempmail*
*│ • ${prefix}trt*
*│ • ${prefix}attp*
*│ • ${prefix}ss*
*│ • ${prefix}tts*
*│ • ${prefix}img*
*│ • ${prefix}tomp3*
*│ • ${prefix}toptt*
*│ • ${prefix}s*
*│ • ${prefix}tiny*
*│ • ${prefix}getpp*
*│ • ${prefix}savecontact*
*│ • ${prefix}tiktoksearch*
*│ • ${prefix}vv*
*│ • ${prefix}caption*
*│ • ${prefix}jid*
*│ • ${prefix}person*
*│ • ${prefix}screenshot*
*│ • ${prefix}tourl*
*│ • ${prefix}weather*
*│ • ${prefix}wstalk*
*╰────────────────*

*╭─〔 🎮 FUN MENU 〕*
*│ • ${prefix}awoo*
*│ • ${prefix}bite*
*│ • ${prefix}blush*
*│ • ${prefix}bonk*
*│ • ${prefix}bully*
*│ • ${prefix}cringe*
*│ • ${prefix}cry*
*│ • ${prefix}cuddle*
*│ • ${prefix}dance*
*│ • ${prefix}glomp*
*│ • ${prefix}hack*
*│ • ${prefix}handhold*
*│ • ${prefix}happy*
*│ • ${prefix}highfive*
*│ • ${prefix}hug*
*│ • ${prefix}insult*
*│ • ${prefix}kill*
*│ • ${prefix}kiss*
*│ • ${prefix}lick*
*│ • ${prefix}me*
*│ • ${prefix}nom*
*│ • ${prefix}pat*
*│ • ${prefix}poke*
*│ • ${prefix}slap*
*│ • ${prefix}smile*
*│ • ${prefix}smug*
*│ • ${prefix}technologia*
*│ • ${prefix}wave*
*│ • ${prefix}wink*
*│ • ${prefix}yeet*
*╰────────────────*

*╭─〔 🖼️ LOGO MENU 〕*
*│ • ${prefix}america*
*│ • ${prefix}angel*
*│ • ${prefix}avengers*
*│ • ${prefix}balloon*
*│ • ${prefix}beach*
*│ • ${prefix}blackpink*
*│ • ${prefix}broken*
*│ • ${prefix}cartoon*
*│ • ${prefix}clouds*
*│ • ${prefix}comic*
*│ • ${prefix}deadpool*
*│ • ${prefix}delete*
*│ • ${prefix}devil*
*│ • ${prefix}dragonball*
*│ • ${prefix}firework*
*│ • ${prefix}fog*
*│ • ${prefix}football*
*│ • ${prefix}future*
*│ • ${prefix}galaxy*
*│ • ${prefix}glitch*
*│ • ${prefix}glow*
*│ • ${prefix}hacker*
*│ • ${prefix}luxury*
*│ • ${prefix}maker*
*│ • ${prefix}marvel*
*│ • ${prefix}metal*
*│ • ${prefix}multicolor*
*│ • ${prefix}naruto*
*│ • ${prefix}neon*
*│ • ${prefix}neonglitch*
*│ • ${prefix}nigeria*
*│ • ${prefix}pixel*
*│ • ${prefix}pornhub*
*│ • ${prefix}sand*
*│ • ${prefix}shield*
*│ • ${prefix}shirt*
*│ • ${prefix}silver*
*│ • ${prefix}sketch*
*│ • ${prefix}snow*
*│ • ${prefix}space*
*│ • ${prefix}tattoo*
*│ • ${prefix}thor*
*│ • ${prefix}tiktok*
*│ • ${prefix}typo*
*│ • ${prefix}underwater*
*│ • ${prefix}vintage*
*│ • ${prefix}watercolor*
*│ • ${prefix}wolf*
*│ • ${prefix}write*
*╰────────────────*

*╭─〔 ⚙️ SETTINGS MENU 〕*
*│ • ${prefix}always-online*
*│ • ${prefix}antiviewonce*
*│ • ${prefix}auto-sticker*
*│ • ${prefix}autoreact*
*│ • ${prefix}dashboard*
*│ • ${prefix}readreceipt*
*│ • ${prefix}setprefix1*
*│ • ${prefix}status-react*
*╰────────────────*

*╭─〔 🔍 SEARCH MENU 〕*
*│ • ${prefix}define*
*│ • ${prefix}githubstalk2*
*│ • ${prefix}shazam*
*│ • ${prefix}yts*
*│ • ${prefix}ytstalk*
*╰────────────────*

*╭─〔 🔌 PLUGIN MENU 〕*
*│ • ${prefix}deleteplugin*
*│ • ${prefix}install*
*│ • ${prefix}pluginlist*
*╰────────────────*

*╭─〔 📱 MAIN MENU 〕*
*│ • ${prefix}alive*
*│ • ${prefix}fetch*
*│ • ${prefix}host*
*│ • ${prefix}menu*
*│ • ${prefix}owner*
*│ • ${prefix}quran*
*│ • ${prefix}repo*
*│ • ${prefix}save*
*│ • ${prefix}speed*
*│ • ${prefix}uptime*
*╰────────────────*

*╭─〔 🎬 MEDIA MENU 〕*
*│ • ${prefix}convert*
*│ • ${prefix}getimage*
*│ • ${prefix}movieinfo*
*╰────────────────*

*╭─〔 ℹ️ INFO MENU 〕*
*│ • ${prefix}praytime*
*│ • ${prefix}news*
*│ • ${prefix}githubstalk*
*│ • ${prefix}list*
*│ • ${prefix}quranmenu*
*╰────────────────*

*╭─〔 📦 MISC MENU 〕*
*│ • ${prefix}vv3*
*│ • ${prefix}gpass*
*│ • ${prefix}srepo*
*│ • ${prefix}vsticker*
*│ • ${prefix}config*
*│ • ${prefix}rw*
*│ • ${prefix}cid*
*╰────────────────*

*📢 Official Channel*
https://whatsapp.com/channel/0029Vb6NveDBPzjPa4vIRt3n

*💬 Support Group*
https://chat.whatsapp.com/CLClgqJIC59GrcI4sRzLu8

*⚡ TEDDY-XMD BOT*
`;

    await conn.sendMessage(from, {
      image: { url: config.IMAGE_PATH || 'https://files.catbox.moe/13nyhx.jpg' },
      caption: customMenu,
      contextInfo: { mentionedJid: [sender] }
    }, { quoted: m });

  } catch (err) {
    console.log("MENU ERROR:", err);
    reply("*❌ Failed to load menu*");
  }
});