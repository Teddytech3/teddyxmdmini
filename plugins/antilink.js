const { cmd } = require('../inconnuboy');
const config = require('../config');

// Default mode (fallback)
if (!config.ANTI_LINK_MODE) {
  config.ANTI_LINK_MODE = "warn"; // warn | delete | kick
}

// All link patterns
const linkPatterns = [
  /https?:\/\/chat\.whatsapp\.com\/\S+/gi,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi
];

// ================= MENU COMMAND =================

cmd({
  pattern: "antilink",
  desc: "Configure anti-link settings",
  type: "group"
}, async (conn, m, store, {
  from,
  args,
  isGroup,
  isAdmins,
  reply
}) => {

  if (!isGroup) return reply("❌ This command works in groups only.");
  if (!isAdmins) return reply("❌ Only group admins can use this command.");

  const option = args[0]?.toLowerCase();

  if (!option) {
    return reply(
`🛡️ *ANTI-LINK SETTINGS*

Choose what action the bot should take:

1️⃣ Warn
2️⃣ Delete message
3️⃣ Kick user

📌 Commands:
.antilink warn
.antilink delete
.antilink kick

⚙️ Current Mode: *${config.ANTI_LINK_MODE.toUpperCase()}*`
    );
  }

  if (!["warn", "delete", "kick"].includes(option)) {
    return reply("❌ Invalid option.\nUse: warn | delete | kick");
  }

  config.ANTI_LINK_MODE = option;
  reply(`✅ Anti-Link mode set to *${option.toUpperCase()}*`);
});

// ================= CORE LOGIC =================

cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {

  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    if (config.ANTI_LINK !== "true") return;

    const containsLink = linkPatterns.some(p => p.test(body));
    if (!containsLink) return;

    const mode = config.ANTI_LINK_MODE;
    const user = sender.split("@")[0];

    // 🟡 WARN
    if (mode === "warn") {
      return await conn.sendMessage(from, {
        text: `⚠️ Warning @${user}\nLinks are not allowed in this group.`,
        mentions: [sender]
      }, { quoted: m });
    }

    // 🟠 DELETE
    if (mode === "delete") {
      await conn.sendMessage(from, { delete: m.key });
      return await conn.sendMessage(from, {
        text: `🗑️ Message deleted.\nLinks are not allowed here.`,
      }, { quoted: m });
    }

    // 🔴 KICK
    if (mode === "kick") {
      await conn.sendMessage(from, { delete: m.key });

      await conn.sendMessage(from, {
        text: `🚪 @${user} removed.\nReason: Sending links.`,
        mentions: [sender]
      }, { quoted: m });

      return await conn.groupParticipantsUpdate(from, [sender], "remove");
    }

  } catch (e) {
    console.error(e);
    reply("⚠️ Error while processing Anti-Link.");
  }
});
