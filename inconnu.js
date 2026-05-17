const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const config = require('./config');
const { commands } = require('./inconnuboy');
const { sms } = require('./lib/msg');
const { saveMessage } = require('./data');
const { AntiDelete } = require('./lib/antidelete');
const {
    connectdb,
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    addNumberToMongoDB,
    getAllNumbersFromMongoDB,
    incrementStats,
    isSudo,
    isBanned,
    deleteSessionFromMongoDB
} = require('./lib/database');

const { initializeAntiDeleteSettings } = require('./data/antidelete');
const { getAntiTag } = require('./data/antitag');
const { getAntiCall } = require('./data/anticall');
const { getSettings, updateSetting } = require('./data/settings');

const path = require('path');
const fs = require('fs-extra');
const pino = require('pino');
const express = require('express');
const chalk = require('chalk');

const router = express.Router();

connectdb();
require('./telegram');

const activeSockets = new Map();
const reactedNewsletters = new Set();

// ================= LOAD PLUGINS =================
const pluginsDir = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginsDir)) {
    fs.readdirSync(pluginsDir)
  .filter(f => f.endsWith('.js'))
  .forEach(f => {
        try {
            require(path.join(pluginsDir, f));
        } catch (e) {
            console.error(`⚠️ Failed to load plugin ${f}:`, e.message);
        }
    });
}

// ================= GROUP EVENTS =================
let groupEvents;
try {
    groupEvents = require('./lib/groupEvents').groupEvents;
} catch (e) {
    groupEvents = async () => {};
}

// ================= MESSAGE HANDLER =================
async function handleMessage(conn, mek, botNumber, settings) {
    try {
        mek = sms(conn, mek);
        if (!mek.message) return;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (mek.isBaileys) return;

        try { await saveMessage(mek); } catch (_) {}

        const from = mek.chat;
        const sender = mek.sender;
        const body = mek.body || '';
        const isGroup = mek.isGroup;
        const fromMe = mek.fromMe;

        const prefix = settings.prefix;
        const ownerRaw = (config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = sender.replace(/[^0-9]/g, '');

        const isOwner = fromMe || senderNum === ownerRaw;
        const sudoAccess =!isOwner? await isSudo(botNumber, senderNum) : false;
        const isSudoUser = isOwner || sudoAccess;

        let isAdmin = false;
        if (isGroup) {
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const adminList = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                isAdmin = adminList.includes(sender);
            } catch {}
        }

        if (settings.autoReact &&!fromMe) {
            const cleanSender = senderNum.replace(/[^0-9]/g, '');
            if (settings.autoReactNumbers.includes(cleanSender)) {
                const emoji = settings.autoReactEmojis[Math.floor(Math.random() * settings.autoReactEmojis.length)];
                await conn.sendMessage(from, { react: { text: emoji, key: mek.key } }).catch(() => {});
            }
        }

        if (!isOwner &&!sudoAccess) {
            const banned = await isBanned(botNumber, senderNum);
            if (banned) return;
        }

        // ================= ANTI-TAG CHECK =================
        const antiTagData = await getAntiTag(botNumber, from);
        if (antiTagData.status &&!isAdmin &&!isOwner && body.includes('@')) {
            const mentionCount = (body.match(/@/g) || []).length;
            if (mentionCount > antiTagData.limit) {
                await conn.sendMessage(from, { delete: mek.key }).catch(() => {});
                if (antiTagData.action === 'kick') {
                    await conn.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
                    await conn.sendMessage(from, { text: `@${senderNum} kicked for mass tagging`, mentions: [sender] }).catch(() => {});
                } else {
                    await conn.sendMessage(from, { text: `@${senderNum} mass tagging not allowed`, mentions: [sender], quoted: mek }).catch(() => {});
                }
                return;
            }
        }

        if (settings.autoRecording &&!fromMe) {
            await conn.sendPresenceUpdate('recording', from).catch(() => {});
        } else if (settings.autoTyping &&!fromMe) {
            await conn.sendPresenceUpdate('composing', from).catch(() => {});
        }

        const workType = settings.workType.toLowerCase();
        if (workType === 'private' &&!isOwner &&!sudoAccess) return;
        if (workType === 'inbox' && isGroup) return;
        if (workType === 'group' &&!isGroup) return;

        const isCmd = body.startsWith(prefix);
        if (!isCmd) return;

        const cmdText = body.slice(prefix.length).trim();
        const cmdName = cmdText.split(' ')[0].toLowerCase();
        const args = cmdText.split(' ').slice(1);
        const q = args.join(' ');

        const command = commands.find(c => {
            const patterns = [c.pattern,...(c.alias || [])].map(p => p?.toLowerCase());
            return patterns.includes(cmdName);
        });

        if (!command) return;

        if (command.react) {
            await conn.sendMessage(from, { react: { text: command.react, key: mek.key } }).catch(() => {});
        }

        await incrementStats(botNumber, 'commandsUsed').catch(() => {});

        const reply = async (text) => {
            if (settings.autoRecording &&!fromMe) {
                await conn.sendPresenceUpdate('recording', from).catch(() => {});
                await delay(1000);
            } else if (settings.autoTyping &&!fromMe) {
                await conn.sendPresenceUpdate('composing', from).catch(() => {});
                await delay(1000);
            }
            try {
                const sent = await conn.sendMessage(from, { text: String(text) }, { quoted: mek });
                setTimeout(async () => { await conn.sendPresenceUpdate('paused', from).catch(() => {}); }, 2000);
                return sent;
            } catch (e) {
                console.error('reply error:', e.message);
            }
        };

        await command.function(conn, mek, mek, {
            from, sender, isOwner, isSudo: isSudoUser, isAdmin, args, q, reply, prefix,
            botNumber, myquoted: mek, quoted: mek.quoted, settings,
            isGroup, fromMe, react: (emoji) => conn.sendMessage(from, { react: { text: emoji, key: mek.key } }).catch(() => {})
        });

        setTimeout(async () => { await conn.sendPresenceUpdate('paused', from).catch(() => {}); }, 3000);

    } catch (e) {
        console.error('❌ handleMessage error:', e.message);
    }
}

// ================= START BOT =================
async function startBot(number, res = null, forceNew = false) {
    // Global error handlers to prevent crashes
    process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection:', err.message);
    });
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err.message);
    });

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionDir = path.join(__dirname, 'session', `session_${sanitizedNumber}`);

    try {
        if (forceNew) {
            await deleteSessionFromMongoDB(sanitizedNumber).catch(() => {});
            if (fs.existsSync(sessionDir)) fs.removeSync(sessionDir);
            if (activeSockets.has(sanitizedNumber)) {
                try {
                    const oldSocket = activeSockets.get(sanitizedNumber);
                    oldSocket.ws.close();
                    oldSocket.end();
                } catch {}
                activeSockets.delete(sanitizedNumber);
            }
            await delay(1000);
        }

        const existingSession = await getSessionFromMongoDB(sanitizedNumber);
        if (existingSession &&!forceNew) {
            fs.ensureDirSync(sessionDir);
            fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(existingSession));
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const logger = pino({ level: process.env.NODE_ENV === 'production'? 'fatal' : 'debug' });

        const conn = makeWASocket({
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            version: [2, 3000, 1033105955],
            browser: ['Mac OS', 'Safari', '10.15.7'],
        });

        activeSockets.set(sanitizedNumber, conn);

        if ((!existingSession || forceNew) && res) {
            await delay(1500);
            try {
                const code = await conn.requestPairingCode(sanitizedNumber);
                if (!res.headersSent) res.json({ code });
            } catch (e) {
                if (!res.headersSent) res.status(500).json({ error: e.message });
                throw e;
            }
        }

        conn.ev.on('creds.update', async () => {
            await saveCreds();
            try {
                const creds = JSON.parse(fs.readFileSync(path.join(sessionDir, 'creds.json'), 'utf-8'));
                await saveSessionToMongoDB(sanitizedNumber, creds);
            } catch (_) {}
        });

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log(chalk.green(`✅ Connected: ${sanitizedNumber}`));
                await addNumberToMongoDB(sanitizedNumber);
                await initializeAntiDeleteSettings(sanitizedNumber);

                const settings = await getSettings(sanitizedNumber);
                if (!settings.prefix) {
                    await updateSetting(sanitizedNumber, 'prefix', config.PREFIX || '.');
                }
                if (!settings.workType) {
                    await updateSetting(sanitizedNumber, 'workType', config.WORK_TYPE || 'public');
                }

                const currentSettings = await getSettings(sanitizedNumber);
                const antiCallStatus = await getAntiCall(sanitizedNumber);
                const connectedMsg = `
🤖 ${config.BOT_NAME} ONLINE

Prefix: ${currentSettings.prefix}
Mode: ${currentSettings.workType}
Anti-call: ${antiCallStatus.status? 'ON' : 'OFF'}

Type ${currentSettings.prefix}menu
`.trim();

                await conn.sendMessage(conn.user.id, { text: connectedMsg }).catch(() => {});
            }

            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                console.log('Connection closed. Code:', code);
                const shouldReconnect = code!== DisconnectReason.loggedOut;
                if (shouldReconnect) setTimeout(() => startBot(number), 5000);
                else {
                    activeSockets.delete(sanitizedNumber);
                    await deleteSessionFromMongoDB(sanitizedNumber).catch(() => {});
                }
            }
        });

        // ================= ANTI-CALL HANDLER =================
        conn.ev.on('call', async (calls) => {
            const antiCall = await getAntiCall(sanitizedNumber);
            if (!antiCall.status) return;

            for (let call of calls) {
                if (call.status === 'offer') {
                    const caller = call.from;
                    const callerNum = caller.split('@')[0];

                    try {
                        await conn.rejectCall(call.id, caller).catch(() => {});

                        if (antiCall.action === 'block') {
                            await conn.sendMessage(caller, {
                                text: `*📞 Call Declined*\nCalls are blocked on this bot. Message the owner if it's urgent.`
                            }).catch(() => {});
                            console.log(`📞 Declined call from ${callerNum}`);
                        } else if (antiCall.action === 'warn') {
                            await conn.sendMessage(caller, {
                                text: `*⚠️ Warning*\nDo not call this number. Calls are disabled.`
                            }).catch(() => {});
                            console.log(`📞 Declined and warned ${callerNum}`);
                        }
                    } catch (e) {
                        console.error('Anti-call error:', e.message);
                    }
                }
            }
        });

        conn.ev.on('group-participants.update', async (update) => {
            await groupEvents(conn, update);
        });

        conn.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type!== 'notify') return;
            const settings = await getSettings(sanitizedNumber);

            for (const mek of messages) {
                const from = mek.key.remoteJid;

                if (from === config.NEWSLETTER_JID && settings.channelReact) {
                    try {
                        const serverId = mek.message?.newsletterServerId || mek.key.id;
                        const uniqueKey = `${from}_${serverId}`;
                        if (reactedNewsletters.has(uniqueKey)) continue;
                        reactedNewsletters.add(uniqueKey);
                        setTimeout(() => reactedNewsletters.delete(uniqueKey), 600000);
                        const emoji = settings.channelReactEmojis[Math.floor(Math.random() * settings.channelReactEmojis.length)];
                        await conn.newsletterReactMessage(from, serverId, emoji).catch(() => {});
                    } catch (e) {}
                    continue;
                }

                if (from === 'status@broadcast') {
                    try {
                        const statusParticipant = mek.key.participant || mek.key.remoteJid;
                        if (statusParticipant && statusParticipant!== 'status@broadcast') {
                            const resolvedKey = { remoteJid: 'status@broadcast', id: mek.key.id, participant: statusParticipant };
                            if (settings.autoReadStatus) await conn.readMessages([resolvedKey]).catch(() => {});
                            if (settings.autoReactStatus) {
                                const emoji = settings.autoReactEmojis[0];
                                await conn.sendMessage(from, { react: { key: resolvedKey, text: emoji } }).catch(() => {});
                            }
                        }
                    } catch (e) {}
                    continue;
                }

                await handleMessage(conn, mek, sanitizedNumber, settings);
            }
        });

        conn.ev.on('messages.update', async (updates) => {
            try { await AntiDelete(conn, updates); } catch (e) {}
        });

    } catch (err) {
        console.error('❌ Error in startBot:', err);
        if (res &&!res.headersSent) res.json({ error: err.message });
    }
}

// ================= AUTO-RECONNECT =================
(async () => {
    await connectdb();
    try {
        const numbers = await getAllNumbersFromMongoDB();
        for (const num of numbers) {
            await startBot(num);
            await delay(2000);
        }
    } catch (e) {
        console.error('Auto-reconnect error:', e);
    }
})();

router.get('/code', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: 'Number required' });
    await startBot(number, res, true);
});

router.get('/status', (req, res) => {
    const sessions = [...activeSockets.keys()];
    res.json({ active: sessions.length, sessions });
});

module.exports.getActiveSockets = () => activeSockets;
module.exports = router;