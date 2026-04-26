const config = require('../config');
const { cmd } = require('../inconnuboy');

// --- WELCOME COMMAND ---
cmd({
    pattern: "welcome",
    desc: "Turn welcome messages on or off",
    category: "group",
    filename: __filename
}, async (conn, m, mek, { from, reply, isGroup, args }) => {
    try {
        if (!isGroup) return reply("✨ This command is for groups only.");

        if (!args[0]) return reply("📍 *Usage:* .welcome on / .welcome off");

        const status = args[0].toLowerCase();

        if (status === "on") {
            config.WELCOME = "true";
            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
            return await reply("🌟 *Welcome messages have been enabled!*");
        } 
        
        else if (status === "off") {
            config.WELCOME = "false";
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return await reply("🚫 *Welcome messages have been disabled!*");
        } 
        
        else {
            return reply("❓ Invalid option. Use *.welcome on* or *.welcome off*");
        }
    } catch (e) {
        console.error(e);
        reply("⚠️ Error updating Welcome status.");
    }
});

// --- GOODBYE COMMAND ---
cmd({
    pattern: "goodbye",
    desc: "Turn goodbye messages on or off",
    category: "group",
    filename: __filename
}, async (conn, m, mek, { from, reply, isGroup, args }) => {
    try {
        if (!isGroup) return reply("✨ This command is for groups only.");

        if (!args[0]) return reply("📍 *Usage:* .goodbye on / .goodbye off");

        const status = args[0].toLowerCase();

        if (status === "on") {
            config.GOODBYE = "true";
            await conn.sendMessage(from, { react: { text: "👋", key: mek.key } });
            return await reply("🌟 *Goodbye messages have been enabled!*");
        } 
        
        else if (status === "off") {
            config.GOODBYE = "false";
            await conn.sendMessage(from, { react: { text: "📴", key: mek.key } });
            return await reply("🚫 *Goodbye messages have been disabled!*");
        } 
        
        else {
            return reply("❓ Invalid option. Use *.goodbye on* or *.goodbye off*");
        }
    } catch (e) {
        console.error(e);
        reply("⚠️ Error updating Goodbye status.");
    }
});
