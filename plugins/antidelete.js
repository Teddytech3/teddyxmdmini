const { cmd } = require('../inconnuboy');
const { setAntiLink, getAntiLink } = require('../data/antilink'); // fixed spelling

const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi;
const warnCount = new Map();

cmd({
    pattern: "antilink",
    desc: "Manage anti-link settings",
    category: "group",
    react: "🔗",
    use: ".antilink on/off delete/kick/warn",
    filename: __filename
},
async(conn, mek, m, { args, isOwner, isAdmin, isGroup, reply, from, botNumber }) => {
    if (!isGroup) return reply("❌ Group only");
    if (!isAdmin &&!isOwner) return reply("❌ Admin only");

    const mode = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase() || 'delete';

    if (mode === 'on') {
        await setAntiLink(botNumber, from, true, action);
        return reply(`*✅ Anti-link ON*\nAction: ${action}`);
    }
    if (mode === 'off') {
        await setAntiLink(botNumber, from, false);
        return reply("*❌ Anti-link OFF*");
    }
    if (mode === 'limit' && args[1]) {
        await setAntiLink(botNumber, from, true, action, parseInt(args[1]));
        return reply(`*✅ Warn limit set to ${args[1]}*`);
    }
    if (mode === 'addwl' && args[1]) {
        const data = await getAntiLink(botNumber, from);
        if (!data.whitelist.includes(args[1])) {
            data.whitelist.push(args[1]);
            await setAntiLink(botNumber, from, data.status, data.action, data.warnLimit, data.whitelist);
        }
        return reply(`*✅ Added ${args[1]} to whitelist*`);
    }

    const data = await getAntiLink(botNumber, from);
    return reply(`*🔗 ANTI-LINK*\nStatus: ${data.status? 'ON ✅' : 'OFF ❌'}\nAction: ${data.action}\nWarn Limit: ${data.warnLimit}\nWhitelist: ${data.whitelist.join(', ') || 'none'}`);
});

module.exports = { linkRegex, warnCount };
