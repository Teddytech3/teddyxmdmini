const config = require('../config');
const { cmd } = require('../inconnuboy');
const { getUserConfigFromMongoDB, saveUserConfigToMongoDB } = require('../lib/database');

// --- WELCOME COMMAND ---
cmd({
    pattern: "welcome",
    desc: "Turn welcome messages on or off",
    category: "group",
    filename: __filename
}, async (conn, m, mek, { from, reply, isGroup, args, botNumber }) => {
    try {
        if (!isGroup) return reply("✨ This command is for groups only.");

        if (!args[0]) return reply("📍 *Usage:*.welcome on /.welcome off");

        const status = args[0].toLowerCase();
        let userConfig = await getUserConfigFromMongoDB(botNumber);

        if (status === "on") {
            userConfig.WELCOME_ENABLE = "true";
            await saveUserConfigToMongoDB(botNumber, userConfig);

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
            return await reply("🌟 *Welcome messages have been enabled!*");
        }

        else if (status === "off") {
            userConfig.WELCOME_ENABLE = "false";
            await saveUserConfigToMongoDB(botNumber, userConfig);

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
}, async (conn, m, mek, { from, reply, isGroup, args, botNumber }) => {
    try {
        if (!isGroup) return reply("✨ This command is for groups only.");

        if (!args[0]) return reply("📍 *Usage:*.goodbye on /.goodbye off");

        const status = args[0].toLowerCase();
        let userConfig = await getUserConfigFromMongoDB(botNumber);

        if (status === "on") {
            userConfig.GOODBYE_ENABLE = "true";
            await saveUserConfigToMongoDB(botNumber, userConfig);

            await conn.sendMessage(from, { react: { text: "👋", key: mek.key } });
            return await reply("🌟 *Goodbye messages have been enabled!*");
        }

        else if (status === "off") {
            userConfig.GOODBYE_ENABLE = "false";
            await saveUserConfigToMongoDB(botNumber, userConfig);

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