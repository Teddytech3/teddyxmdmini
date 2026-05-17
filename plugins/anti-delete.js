const { cmd } = require('../inconnuboy');
const { setAnti, getAnti } = require('../data/antidelete');

cmd({
    pattern: "antidelete",
    alias: ["antidel", "nodelete"],
    desc: "Turn anti-delete on/off for this chat",
    category: "owner",
    react: "🛡️",
    use: ".antidelete on/off",
    filename: __filename
},
async(conn, mek, m, { args, isOwner, reply, from, botNumber }) => {
    if (!isOwner) return reply("*❌ This command is for owner only*");

    const mode = args[0]?.toLowerCase();
    const isGroup = from.endsWith('@g.us');
    const type = isGroup? 'gc' : 'dm';

    if (mode === 'on' || mode === 'enable') {
        await setAnti(botNumber, from, true);
        return reply("*✅ Anti-delete activated*\n_Deleted messages will be forwarded to owner inbox_");
    } else if (mode === 'off' || mode === 'disable') {
        await setAnti(botNumber, from, false);
        return reply("*❌ Anti-delete deactivated*");
    } else {
        const current = await getAnti(botNumber, from);
        const globalType = isGroup? await getAnti(botNumber, 'gc') : await getAnti(botNumber, 'dm');

        return reply(
            `*🛡️ ANTI-DELETE*\n\n` +
            `*Usage:*\n.antidelete on\n.antidelete off\n` +
            `*Chat Status:* ${current? "ON ✅" : "OFF ❌"}\n` +
            `*Global ${type.toUpperCase()} Status:* ${globalType? "ON ✅" : "OFF ❌"}\n\n` +
            `*⚡ TEDDY-XMD*`
        );
    }
});