/**
 * yt-play.js
 * TEDDY-XMD YouTube Music Player
 * Requires: axios, yt-search
 */

const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../inconnuboy");
const config = require("../config");

// Newsletter and Bot Info
const NEWSLETTER_JID = config.NEWSLETTER_JID || "120363423997837331@newsletter";
const NEWSLETTER_NAME = "TEDDY-XMD";
const BOT = "TEDDY-XMD";
const CHANNEL_LINK = config.CHANNEL_LINK || "https://whatsapp.com/channel/0029Vb6NveDBPzjPa4vIRt3n";

const buildCaption = (type, video) => {
  const banner = type === "video"? `🎬 TEDDY-XMD VIDEO PLAYER` : `🎶 TEDDY-XMD MUSIC`;
  const duration = video.timestamp || video.duration || "N/A";
  const views = video.views? video.views.toLocaleString() : "N/A";

  return (
    `*${banner}*\n\n` +
    `╭────────────────◆\n` +
    `│ 🎵 *Title:* ${video.title}\n` +
    `│ ⏱️ *Duration:* ${duration}\n` +
    `│ 👁️ *Views:* ${views}\n` +
    `│ 📅 *Uploaded:* ${video.ago || "N/A"}\n` +
    `│ 👤 *Channel:* ${video.author.name || "Unknown"}\n` +
    `╰─────────────────◆\n\n` +
    `⚡ *Sending audio...*\n` +
    `⚡ *TEDDY-XMD*`
  );
};

const getContextInfo = (query = "") => ({
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: NEWSLETTER_JID,
    newsletterName: NEWSLETTER_NAME,
    serverMessageId: -1
  },
  body: query? `Requested: ${query}` : undefined,
  title: BOT
});

const BASE_URL = process.env.BASE_URL || "https://noobs-api.top";

/* ========== PLAY (audio stream) ========== */
cmd({
  pattern: "play",
  alias: ["p", "song", "music"],
  use: ".play <song name>",
  react: "🎵",
  desc: "Play audio from YouTube",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  const query = q || args.join(" ");
  if (!query) return conn.sendMessage(from, {
    text: "*🎵 YOUTUBE MUSIC*\n\n*Usage:*.play <song name>\n*Example:*.play faded alan walker\n\n*⚡ TEDDY-XMD*"
  }, { quoted: mek });

  try {
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // 1. YouTube Search
    const search = await yts(query);
    const video = (search && (search.videos && search.videos[0])) || (search.all && search.all[0]);
    if (!video) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return conn.sendMessage(from, { text: "*❌ No results found*\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
    }

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "");
    const fileName = `${safeTitle}.mp3`;

    // 2. Fetch using API
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId || video.url)}&format=mp3`;
    const { data } = await axios.get(apiURL);

    if (!data ||!data.downloadLink) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return conn.sendMessage(from, { text: "*❌ Failed to get download link*\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
    }

    // 3. Send Image Preview with View Channel link
    await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: buildCaption("audio", video),
      contextInfo: {
      ...getContextInfo(query),
        externalAdReply: {
            title: NEWSLETTER_NAME,
            body: "Join our channel for more updates",
            mediaType: 1,
            sourceUrl: CHANNEL_LINK,
            renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    // 4. Send Playable Audio
    await conn.sendMessage(from, {
      audio: { url: data.downloadLink },
      mimetype: "audio/mpeg",
      fileName: fileName,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "TEDDY-XMD Music Player",
          mediaType: 1,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    // Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (e) {
    console.error("[PLAY ERROR]", e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    await conn.sendMessage(from, { text: "*❌ An error occurred*\n_Please try again later_\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
  }
});

/* ========== VIDEO (video stream) ========== */
cmd({
  pattern: "video",
  alias: ["v", "ytv"],
  use: ".video <video name>",
  react: "🎬",
  desc: "Play video from YouTube",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  const query = q || args.join(" ");
  if (!query) return conn.sendMessage(from, {
    text: "*🎬 YOUTUBE VIDEO*\n\n*Usage:*.video <video name>\n*Example:*.video alan walker faded\n\n*⚡ TEDDY-XMD*"
  }, { quoted: mek });

  try {
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // 1. YouTube Search
    const search = await yts(query);
    const video = (search && (search.videos && search.videos[0])) || (search.all && search.all[0]);
    if (!video) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return conn.sendMessage(from, { text: "*❌ No results found*\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
    }

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "");
    const fileName = `${safeTitle}.mp4`;

    // 2. Fetch using API
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId || video.url)}&format=mp4`;
    const { data } = await axios.get(apiURL);

    if (!data ||!data.downloadLink) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return conn.sendMessage(from, { text: "*❌ Failed to get download link*\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
    }

    // 3. Send Video Preview
    await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: buildCaption("video", video).replace("Sending audio", "Sending video"),
      contextInfo: {
      ...getContextInfo(query),
        externalAdReply: {
            title: NEWSLETTER_NAME,
            body: "Join our channel for more updates",
            mediaType: 2,
            sourceUrl: CHANNEL_LINK,
            renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    // 4. Send Video
    await conn.sendMessage(from, {
      video: { url: data.downloadLink },
      mimetype: "video/mp4",
      fileName: fileName,
      caption: `*🎬 ${video.title}*\n\n*⚡ TEDDY-XMD*`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "TEDDY-XMD Video Player",
          mediaType: 2,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    // Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (e) {
    console.error("[VIDEO ERROR]", e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    await conn.sendMessage(from, { text: "*❌ An error occurred*\n_Please try again later_\n\n*⚡ TEDDY-XMD*" }, { quoted: mek });
  }
});