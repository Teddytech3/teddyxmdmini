const { cmd } = require('../inconnuboy');
const config = require('../config');

cmd({
    on: "all", // Triggers on every message type
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner }) => {
    try {
        // Only react to real owner messages
        if (!isOwner) return;
        
        // Skip if it's bot's own message to avoid loops
        if (mek.key.fromMe) return;

        // Always react with crown for owner
        await conn.sendMessage(from, {
            react: {
                text: "👑",
                key: mek.key
            }
        });

    } catch (e) {
        // Silent fail so it doesn't spam console
    }
});
