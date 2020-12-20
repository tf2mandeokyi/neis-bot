import { Message } from "discord.js";
import { client, config, neisClient } from "../..";
import * as CommandUtil from '../util/commandutil';
import * as discord from 'discord.js'

export default async function(message: Message) {

    if(message.content.startsWith(config.command.prefix)) {
        
        if(message.author === client.user) return;

        let { channel } = message;

        let { command, args, commandString } = CommandUtil.parse(message.content, config.command.prefix);

        if(!command) return;

        if(command.argsLength > args.length) {
            let commandUsages = command.usages.map(usage => `\`${config.command.prefix}${usage.usage}\`: ${usage.description}`)
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

}