module.exports = {
  name: "antilink",
  alias: ["nolink"],
  desc: "Delete links in group. Admin only.",
  category: "group",
  react: "🚫",
  start: async (conn, mek, m, { isGroup, isAdmin, isBotAdmin, reply }) => {
    if (!isGroup) return reply("❌ Group only");
    if (!isAdmin) return reply("❌ Admin only");
    if (!isBotAdmin) return reply("❌ Bot needs admin");
    
    const body = m.body || "";
    const linkRegex = /chat\.whatsapp\.com|t\.me|https?:\/\/|www\./i;
    
    if (linkRegex.test(body)) {
      await conn.sendMessage(m.from, { delete: mek.key });
      return reply("⚠️ Links not allowed");
    }
  }
}