const { Telegraf, Markup } = require('telegraf');
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const config = require('./config');

const BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
const BOT_IMAGE = config.IMAGE_PATH;
const OWNER_ID = config.TELEGRAM_CHAT_ID?.replace(/[^0-9]/g, '') || '';

if (!BOT_TOKEN) {
    console.log('❌ TELEGRAM_BOT_TOKEN missing. Telegram bot disabled.');
    module.exports = () => {};
    return;
}

const bot = new Telegraf(BOT_TOKEN);
const tempSessions = new Map();
const rateLimit = new Map();

bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    if (payload && payload.startsWith('pair_')) {
        const number = payload.replace('pair_', '');
        return await startTgPairing(ctx, number);
    }

    const user = ctx.from.first_name;
    const text = `👋 *Welcome to ${config.BOT_NAME} Pair Bot*\n\n` +
                 `Hi ${user}! I can pair your WhatsApp to ${config.BOT_NAME}.\n\n` +
                 `*How it works:*\n` +
                 `1. Tap "Pair WhatsApp"\n` +
                 `2. Send number: 254712345678\n` +
                 `3. Get 8-digit code\n` +
                 `4. WhatsApp → Linked Devices → Link with phone number\n\n` +
                 `${config.BOT_FOOTER}`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📱 Pair WhatsApp', 'pair')],
        [Markup.button.callback('❓ Help', 'help')],
        [Markup.button.url('🌐 Web Pair', `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:3000'}`)]
    ]);

    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: text,
        parse_mode: 'Markdown',
       ...keyboard
    });
});

bot.action('pair', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
        '*Send your WhatsApp number with country code*\n\n' +
        'Example: `254712345678`\n' +
        'No + or spaces',
        { parse_mode: 'Markdown' }
    );
});

bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithPhoto(BOT_IMAGE, {
        caption: `*${config.BOT_NAME} Help*\n\n` +
                 `*Steps:*\n` +
                 `1. Send number with country code\n` +
                 `2. Copy 8-digit code\n` +
                 `3. WhatsApp → Linked Devices\n` +
                 `4. Link with phone number\n\n` +
                 `*Support:* ${config.CHANNEL_LINK}\n\n` +
                 `${config.BOT_FOOTER}`,
        parse_mode: 'Markdown'
    });
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const isNumber = /^[0-9]{10,15}$/.test(text);
    if (!isNumber || text.startsWith('/')) return;
    await startTgPairing(ctx, text);
});

async function startTgPairing(ctx, number) {
    const tgId = ctx.from.id;

    const last = rateLimit.get(tgId) || 0;
    if (Date.now() - last < 30000) {
        return ctx.reply('⏳ Too many requests. Wait 30s and try again.');
    }
    rateLimit.set(tgId, Date.now());

    if (!/^[0-9]{10,15}$/.test(number)) {
        return ctx.reply('❌ Invalid number. Use format: 254712345678');
    }

    const loading = await ctx.reply('🔄 Generating pairing code...');

    try {
        if (tempSessions.has(tgId)) {
            const old = tempSessions.get(tgId);
            clearTimeout(old.timeout);
            try { old.sock.ws.close(); } catch {}
            tempSessions.delete(tgId);
        }

        const sessionDir = path.join(__dirname, 'temp', `tg_${tgId}_${Date.now()}`);
        fs.ensureDirSync(sessionDir);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: Browsers.macOS('Safari'),
            logger: pino({ level: 'silent' })
        });

        sock.ev.on('creds.update', saveCreds);

        const timeout = setTimeout(async () => {
            try { sock.ws.close(); } catch {}
            fs.removeSync(sessionDir);
            tempSessions.delete(tgId);
            await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, null, '⌛ Code expired. Tap /pair to get a new one.');
        }, 120000);

        tempSessions.set(tgId, { sock, timeout });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                clearTimeout(timeout);
                fs.removeSync(sessionDir);
                tempSessions.delete(tgId);
                await ctx.telegram.editMessageText(
                    ctx.chat.id,
                    loading.message_id,
                    null,
                    `✅ *Paired successfully!*\n\nYour WhatsApp is now linked to ${config.BOT_NAME}.\n\n${config.BOT_FOOTER}`,
                    { parse_mode: 'Markdown' }
                );
            }
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                if (code === DisconnectReason.loggedOut) {
                    clearTimeout(timeout);
                    fs.removeSync(sessionDir);
                    tempSessions.delete(tgId);
                }
            }
        });

        await new Promise(r => setTimeout(r, 2000));
        const code = await sock.requestPairingCode(number);

        const codeMsg = `✅ *Your Pairing Code*\n\n` +
                        `Number: \`${number}\`\n` +
                        `Code: \`${code}\`\n\n` +
                        `*Steps:*\n` +
                        `1. Open WhatsApp\n` +
                        `2. Linked Devices\n` +
                        `3. Link with phone number\n` +
                        `4. Enter code above\n\n` +
                        `⏳ Code expires in 60s\n\n` +
                        `${config.BOT_FOOTER}`;

        await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, null, codeMsg, {
            parse_mode: 'Markdown',
           ...Markup.inlineKeyboard([[Markup.button.callback('📋 Copy Code', `copy_${code}`)]])
        });

    } catch (e) {
        console.error('Pair error:', e);
        await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, null, '❌ Failed to generate code. Try again.');
    }
}

bot.action(/copy_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(`\`${ctx.match[1]}\``, { parse_mode: 'Markdown' });
});

bot.launch();
console.log(`✅ ${config.BOT_NAME} Telegram Bot started`);

module.exports = () => bot;