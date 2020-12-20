import { NeisApiClient } from './lib/neis';
import * as discord from 'discord.js';
import * as CommandUtil from './lib/neis/util/commandutil';
import * as fs from 'fs';


let important : any, config: any;
important = JSON.parse(fs.readFileSync('important.json').toString())
config = JSON.parse(fs.readFileSync('lib/config.json').toString())


const client = new discord.Client();
const neisClient = new NeisApiClient(important['neis-token']);


client.on('message', async (message) => {

    if(message.content.startsWith(config.command.prefix)) {
        
        if(message.author === client.user) return;

        let { channel } = message;

        let { command, args, commandString } = CommandUtil.parse(message.content, config.command.prefix);

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

        await command.execute(message, args, neisClient, commandString).catch(async reason => {
            channel.send(
                new discord.MessageEmbed().setColor('#ff0000').setTitle(`Error: ${reason}`)
            );
            console.log(reason);
        });

    }
});

client.on('ready', () => {
    client.user.setActivity(`${config.command.prefix}help`);
    console.log('NeisBot is online!');
})

client.login(important['bot-token']);