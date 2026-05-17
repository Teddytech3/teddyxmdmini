const { cmd } = require('../inconnuboy');
const { updateSetting, getSettings } = require('../data/settings');

cmd({
    pattern: "set",
    desc: "Change bot settings",
    category: "owner",
    use: ".set prefix! |.set worktype private |.set autoreact on"
},
async(conn, mek, m, { args, isOwner, reply, botNumber }) => {
    if (!isOwner) return reply("❌ Owner only");

    const key = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    if (!key) {
        const s = await getSettings(botNumber);
        return reply(`*Current Settings:*
Prefix: ${s.prefix}
Mode: ${s.workType}
Auto React: ${s.autoReact}
Auto Typing: ${s.autoTyping}
Auto Recording: ${s.autoRecording}`);
    }

    const validKeys = ['prefix','worktype','autoreact','autotyping','autorecording'];
    if (!validKeys.includes(key)) return reply(`Invalid key. Use: ${validKeys.join(', ')}`);

    let val = value;
    if (['autoreact','autotyping','autorecording'].includes(key)) {
        val = value === 'on' || value === 'true';
    }
    if (key === 'worktype' &&!['public','private','inbox','group'].includes(value)) {
        return reply("Worktype: public, private, inbox, group");
    }

    await updateSetting(botNumber, key === 'worktype'? 'workType' : key, val);
    reply(`✅ Set ${key} to ${val}`);
});