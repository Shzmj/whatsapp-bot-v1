const qrcode = require('qrcode-terminal');

const axios = require('axios');
const { Client, NoAuth, MessageMedia } = require('whatsapp-web.js');
const moment = require('moment');

const client = new Client({
    authStrategy: new NoAuth()
});
 
 
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    const content = message.body;

	if (content === '!meme') {
		const meme = await axios.get('https://meme-api.herokuapp.com/gimme')
        .then(res => res.data)

        client.sendMessage(message.from, await MessageMedia.fromUrl(meme.url));
	} else if (content === '!joke') {
        const joke = await axios("https://v2.jokeapi.dev/joke/Any?safe-mode") 
        .then(res => res.data)

        const jokeMsg = await client.sendMessage(message.from, joke.setup || joke.joke);
        if (joke.delivery) setTimeout(function() { jokeMsg.reply(joke.delivery) }, 2000);
    } else if (content.split(' ')[0] === '!remind') {
        const messageDeets = content.substring(content.indexOf('!remind') + 8);
        const messageArr = messageDeets.split(' at ')
        const dateNow = moment()
        const dateLater = moment(messageArr[1])
        if (dateLater.isBefore(dateNow)) { //Need to do debugging for incorrect inputs...
            client.sendMessage(message.from, 'SHZMBOT: You can\'t set a reminder for a date in the past!');
        } else { 
            client.sendMessage(message.from, `SHZMBOT: Reminder set for ${dateLater.format('LT')}`);
            setTimeout(function() { client.sendMessage(message.from, `SHZMBOT: Reminder ${messageArr[0]}`) }, dateLater.diff(dateNow));
        }
    } else if (content === '!ping') {
        message.reply('pong');
    }else if (content === '!quote') {
        const quote = await axios.get('https://zenquotes.io/api/random')
        .then(res => res.json())
        .then(data => data[0]["q"] + "-" + data[0]["a"])

        client.sendMessage(message.from, quote.quote);
    }

});
 

client.initialize();