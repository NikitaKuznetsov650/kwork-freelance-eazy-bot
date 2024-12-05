// assets/keyboards/keyboard.js
module.exports = {
    startKeyboard: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "Подпишитесь на канал", url: "t.me//sdhjajh", callback_data: "firstChannel" }],
                [{ text: "Подпишитесь на канал", url: "t.me//osipfjsdfhjk", callback_data: "secondChannel" }],
                [{ text: "Я подписался", callback_data: "checkSubscriptions" }]
            ]
        })
    },
    adminKeyboard: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: "Все пользователи", callback_data: "allusers"}]
            ] 
        })
    }
}
