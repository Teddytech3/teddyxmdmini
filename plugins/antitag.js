const { cmd } = require('../inconnuboy');
const { setAntiTag, getAntiTag } = require('../data/antitag');

cmd({
    pattern: "antitag",
    desc: "Block mass tagging",
    category: "group",
    react: "📢",
    use: ".antitag on/off 5 kick",
    filename: __filename
},
async(conn, mek, m, { args, isOwner, reply, from, botNumber, isGroup, isAdmin }) => {
    if (!isGroup) return reply("❌ Group only");
    if (!isAdmin) return reply("❌ Admin only");

    const mode = args[0]?.toLowerCase();
    const limit = parseInt(args[1]) || 5;
    const action = args[2]?.toLowerCase() || 'delete';

    if (mode === 'on') {
        await setAntiTag(botNumber, from, true, action, limit);
        return reply(`*✅ Anti-tag ON*\nLimit: ${limit} tags\nAction: ${action}`);
    }
    if (mode === 'off') {
        await setAntiTag(botNumber, from, false);
        return reply("*❌ Anti-tag OFF*");
    }

    const data = await getAntiTag(botNumber, from);
    return reply(`*📢 ANTI-TAG*\nStatus: ${data.status? 'ON ✅' : 'OFF ❌'}\nLimit: ${data.limit}\nAction: ${data.action}`);
});