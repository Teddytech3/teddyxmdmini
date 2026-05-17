const { cmd } = require('../inconnuboy');
const { setAntiLink, getAntiLink, addWhitelist, removeWhitelist } = require('../data/antlink');

const linkRegex = /(https?:\/\/[^\s]+)|(wa\.me\/[^\s]+)|(chat\.whatsapp\.com\/[^\s]+)/gi;
const warnCount = new Map(); // key: userId:chatId:sender

cmd({
    pattern: "antilink",
    desc: "Manage antilink",
    category: "group",
    react: "🔗",
    use: ".antilink on/off delete/kick/warn | addwl domain | delwl domain",
    filename: __filename
},
async(conn, mek, m, { args, isOwner, reply, from, botNumber, isGroup, isAdmin }) => {
    if (!isGroup) return reply("❌ Group only");
    if (!isAdmin) return reply("❌ Admin only");

    const sub = args[0]?.toLowerCase();

    if (sub === 'on') {
        const action = args[1]?.toLowerCase() || 'delete';
        await setAntiLink(botNumber, from, true, action);
        return reply(`*✅ Antilink ON*\nAction: ${action}`);
    }
    if (sub === 'off') {
        await setAntiLink(botNumber, from, false);
        return reply("*❌ Antilink OFF*");
    }
    if (sub === 'addwl') {
        const domain = args[1];
        if (!domain) return reply("Usage:.antilink addwl youtube.com");
        await addWhitelist(botNumber, from, domain);
        return reply(`✅ Added *${domain}* to whitelist`);
    }
    if (sub === 'delwl') {
        const domain = args[1];
        if (!domain) return reply("Usage:.antilink delwl youtube.com");
        await removeWhitelist(botNumber, from, domain);
        return reply(`✅ Removed *${domain}* from whitelist`);
    }
    if (sub === 'limit') {
        const limit = parseInt(args[1]);
        if (isNaN(limit)) return reply("Usage:.antilink limit 3");
        await setAntiLink(botNumber, from, true, 'warn', limit);
        return reply(`✅ Warn limit set to ${limit}`);
    }

    const data = await getAntiLink(botNumber, from);
    return reply(`*🔗 ANTI-LINK*\nStatus: ${data.status? 'ON ✅' : 'OFF ❌'}\nAction: ${data.action}\nWarn Limit: ${data.warnLimit}\nWhitelist: ${data.whitelist.join(', ') || 'None'}`);
});

module.exports.linkRegex = linkRegex;
module.exports.warnCount = warnCount;