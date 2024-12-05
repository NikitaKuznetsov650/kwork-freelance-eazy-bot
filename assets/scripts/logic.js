const db = require('../db/db.json')

async function checkUserSubscription(bot, userId, channelId) {
    try {
        const chatMember = await bot.getChatMember(channelId, userId);
        const isSubscribed = ['member', 'administrator', 'creator'].includes(chatMember.status);
        return isSubscribed;
    } catch (error) {
        if (error.response && error.response.body.error_code === 400) {
            throw Error('Bot is not an admin or channel does not exist');
        } else {
            throw Error('Error checking subscription:', error);
        }
        return false;
    }
}

async function checkUserSubscriptions(bot, userId, channels) {
    const subscriptionPromises = channels.map(channelId => checkUserSubscription(bot, userId, channelId));
    const subscriptions = await Promise.all(subscriptionPromises);
    return subscriptions;
}

async function sendSubscriptionMessage(bot, chatId, channels) {
    const inlineKeyboard = channels.map(channelId => {
        const cleanChannelId = channelId.replace('@', '');
        return [{ text: "Подпишитесь на канал", url: `https://t.me/${cleanChannelId}` }];
    });
    inlineKeyboard.push([{ text: "Я подписался", callback_data: "check_subscription" }]);
    await bot.sendMessage(chatId, 'Пожалуйста подпишитесь на данные каналы чтобы пользоваться ботом:', {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
}

async function refCount(bot, msg) {
    const referredUsers = db.filter(user => user.referredBy === msg.chat.id);
    await bot.sendMessage(msg.chat.id, `Вы пригласили столько пользователей: ${referredUsers.length}`);
}

module.exports = {
    checkUserSubscriptions: checkUserSubscriptions,
    sendSubscriptionMessage: sendSubscriptionMessage,
    refCount: refCount
}
