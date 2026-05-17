const { cmd } = require('../inconnuboy');
const { setPrefix, getPrefix } = require('../data/settings');

cmd({
    pattern: "setprefix",
    desc: "Change bot prefix for this session",
    category: "owner",
    react: "⚙️",
    use: ".setprefix!",
    filename: __filename
},
async(conn, mek, m, { args, isOwner, reply, botNumber }) => {
    if (!isOwner) return reply("*❌ Owner only*");

    const newPrefix = args[0];
    if (!newPrefix) {
        const current = await getPrefix(botNumber);
        return reply(`*Current prefix:* \`${current}\`\n*Usage:*.setprefix!`);
    }

    if (newPrefix.length > 3) return reply("❌ Prefix too long. Max 3 characters");

    await setPrefix(botNumber, newPrefix);
    return reply(`*✅ Prefix changed to:* \`${newPrefix}\`\nNow use \`${newPrefix}menu\``);
});