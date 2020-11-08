const { NeisApiClient } = require('./lib/neis/neis');
const discord = require('discord.js');
const important = require('./important.json');


const commands = require('./lib/commands');
const config = require('./lib/config.json');


const client = new discord.Client();
const neisClient = new NeisApiClient(important['neis-token']);


client.on('message', async (message) => {

    if(message.content.startsWith(config.command.prefix)) {
        
        if(message.author === client.user) return;

        let { channel } = message;

        let withoutPrefix = message.content.substring(config.command.prefix.length);
        let args = withoutPrefix.split(' ');
        let command = commands[args.shift()];

        if(!command) return;

        if(command.argsLength > args.length) {
            let commandUsages = command.usages.map(usage => `\`${config.command.prefix}${usage}\``)
                .reduce((prev, current) => prev + '\n' + current, '')
            channel.send(
                new discord.MessageEmbed().setColor('#ff0000').setTitle('잘못된 사용법입니다.')
                    .setDescription(`올바른 사용법:${commandUsages}`)
            );
            return;
        }

        await command.execute(message, args, neisClient).catch(async reason => {
            channel.send(
                new discord.MessageEmbed().setColor('#ff0000').setTitle(`Error: ${reason}`)
            );
        });

    }
});

client.on('ready', () => {
    client.user.setActivity('neis:help');
    console.log('NeisBot is online!');
})

client.login(important['bot-token']);