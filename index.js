require('dotenv').config({ path: "./assets/modules/.env" });
const TelegramBot = require('node-telegram-bot-api');
const { checkUserSubscriptions, sendSubscriptionMessage, refCount } = require('./assets/scripts/logic');
const bot = new TelegramBot(process.env.devStatus ? process.env.TEST_TOKEN : process.env.DEFAULT_TOKEN, { polling: true });
const db = require('./assets/db/db.json');
const fs = require('fs');
const { adminKeyboard, startKeyboard } = require('./assets/keyboards/keyboard');
const commands = JSON.parse(fs.readFileSync('./assets/commands/commands.json'));

bot.setMyCommands(commands);

bot.on('message', async (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const channels = [process.env.CHANNEL_1, process.env.CHANNEL_2];

    let user = db.find(user => user.id === chatId);

    if (msg.text.startsWith('/start')) {
        if (!user) {
            db.push({
                id: userId,
                name: msg.from.first_name,
                chat: chatId,
                sovaBalance: 0,
                SVHCBalance: 0,
                referralCode: `https://t.me/${process.env.BOT_LINK}?start=${chatId}`,
                referredBy: Number(msg.text.replace("/start", "")),
                isAdmin: false
            });
            fs.writeFileSync('./assets/db/db.json', JSON.stringify(db, null, '\t'));
        } else {
            const isAdminMessage = user.isAdmin ? `Ты админ!` : '';
            await bot.sendMessage(chatId, `Привет ${msg.from.username}. ${isAdminMessage}`, user?.isAdmin ? adminKeyboard : startKeyboard);
        }
        const subscriptions = await checkUserSubscriptions(bot, userId, channels);
        const unsubscribedChannels = channels.filter((_, index) => !subscriptions[index]);

        if (unsubscribedChannels.length > 0) {
            await sendSubscriptionMessage(bot, chatId, unsubscribedChannels);
        }
    } else if (msg.text === "/friends") {
        await bot.sendMessage(chatId, `Your personal link: <code>https://t.me/${process.env.BOT_LINK}?start=${chatId}</code>`, { parse_mode: "HTML" });
    } else if (msg.text === '/refcount') {
        await refCount(bot, msg);
    } else if (msg.text === 'Все пользователи') {
        await bot.sendMessage(msg.chat.id, `Нынешнее количество пользователей: ${db.length}`);
    }
});

bot.on('callback_query', async (msg) => {
    const userId = msg.from.id;
    const chatId = msg.message.chat.id;
    const channels = [process.env.CHANNEL_1, process.env.CHANNEL_2];

    if (msg.data === "check_subscription") {
        const subscriptions = await checkUserSubscriptions(bot, userId, channels);
        const unsubscribedChannels = channels.filter((_, index) => !subscriptions[index]);

        if (unsubscribedChannels.length === 0) {
            await bot.deleteMessage(chatId, msg.message.message_id);
            await bot.sendMessage(chatId, `Спасибо за подписку на все каналы!`);
        } else {
            await sendSubscriptionMessage(bot, chatId, unsubscribedChannels);
        }
    } else if (msg.data === 'allusers') {
        await bot.sendMessage(chatId, `Количество пользователей: ${db.length}`);
    }
});

// Обрабатываем ошибки polling
bot.on('polling_error', console.log);
