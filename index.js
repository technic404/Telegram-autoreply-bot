const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions')
const { NewMessage } = require ("telegram/events");
const fs = require('fs');
const input = require('input');


const API_ID = 00000000; // YOUR API_ID
const API_HASH = 'YOUR_API_HASH';


const stringSession = new StringSession('');
const config = JSON.parse(fs.readFileSync(`./config.json`));

(async () => {
    const client = new TelegramClient(stringSession, API_ID, API_HASH, { connectionRetries: 5 })
    await client.start({
        phoneNumber: async () => await input.text('number ?'),
        password: async () => await input.text('password?'),
        phoneCode: async () => await input.text('Code ?'),
        onError: (err) => console.log(err),
    });
    client.session.save()

    async function eventPrint(event) {
        const message = event.message;

        if(!event.isPrivate) return;
    
        const sender = await message.getSender();

        for(let [keyword, details] of Object.entries(config)) {
            let text = message.text;

            if(details.ignoreCase) {
                text = text.toLowerCase();
                keyword = keyword.toLowerCase();
            }

            if(details.containsWordInMessage) {
                if(!text.includes(keyword)) continue;
            } else {
                if(text !== keyword) continue;
            }

            const reply = details.reply;

            if(reply.text && Array.isArray(reply.text) && reply.text.length > 0) {
                reply.text.forEach(async textContent => {
                    await client.sendMessage(sender, { message: `${textContent}` });
                });
            }

            if(reply.images && Array.isArray(reply.images) && reply.images.length > 0) {
                reply.images.forEach(async imagePath => {
                    await client.sendFile(sender, { file: `${imagePath}` });
                });
            }
        }
    }
    
    client.addEventHandler(eventPrint, new NewMessage({}));
})()

