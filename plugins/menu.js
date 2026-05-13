const menu = async (conn, mek, m, { from, prefix, pushname }) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const start = Date.now();
    
    // Send loading message
    let loadingMsg = await conn.sendMessage(from, { 
        text: `╭━━━〔 *${config.BOT_NAME || 'TEDDY-XMD'}* 〕━━━╮
┃ ⏳ Loading menu...
╰━━━━━━━━━━━━╯` 
    }, { quoted: mek });

    // Calculate speed after loading msg is sent
    const speed = Date.now() - start;

    const menuMsg = `┏━━❐✧ ${config.BOT_NAME || 'TEDDY-XMD'} ✧❐
┃✦ User: @${m.sender.split('@')[0]}
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

    // Edit the loading message into the actual menu
    await conn.sendMessage(from, {
        edit: loadingMsg.key,
        image: { url: 'https://files.catbox.moe/13nyhx.jpg' },
        caption: menuMsg,
        mentions: [m.sender]
    });

};

export default menu;