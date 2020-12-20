import { config } from "../..";
import { Command, commands, getCommand, ObjectMap } from "../commands";
import * as discord from 'discord.js'

export default new Command({
    regex: /^help$/,
    argsLength: 0,
    category: '일반',
    usages: [
        {usage: 'help', description: '사용 가능한 명령어들을 출력합니다.'},
        {usage: 'help <명령어>', description: '주어진 명령어의 설명문을 출력합니다.'}
    ],
    execute: (message, args) => {
        return new Promise(async (res, rej) => {

            let { channel } = message;

            switch(args.length) {

                case 0: // No parameters
                    let categorySet : ObjectMap<Command[]> = {};

                    commands.forEach((c) => {
                        if(c.unused === true) return;
                        if(!categorySet[c.category]) categorySet[c.category] = [];
                        categorySet[c.category].push(c);
                    })

                    let result = Object.entries(categorySet)
                        .map(([category, clist]) => {
                            let clistcomb = clist.map((c) => {
                                return c.usages.map(({usage, description}) => `> ▫️\`${config.command.prefix}${usage}\` ${description}\n`)
                                    .reduce((prev, current) => prev + current, '');
                                    // Combines all usages of the command, and then returns it as a "command chunk".
                            })
                            .reduce((prev, current, i) => prev + (i != 0 ? '> \n' : '') + current, ''); // Combines command chunks into one category chunk.

                            return `**${category}**\n${clistcomb}\n`; // Returns category chunk.
                        })
                        .reduce((prev, current) => prev + current, ''); // Combines all category chunks into one embed.

                    channel.send(
                        new discord.MessageEmbed().setTitle('커맨드 목록').setDescription(result).setColor('#07b4ed')
                    );
                    break;

                default: 
                    let command = getCommand(args[0]);
                    if(!command) {
                        channel.send(
                            new discord.MessageEmbed()
                                .setTitle(`\`${config.command.prefix}${args[0]}\`라는 명령어가 존재하지 않습니다.`)
                                .setColor('#ff0000')
                        );
                        return;
                    }
                    channel.send(
                        new discord.MessageEmbed()
                            .setTitle(`명령어 \`${config.command.prefix}${args[0]}\`의 사용법`)
                            .setDescription(
                                command.usages.map(({usage, description}) => `\`${config.command.prefix + usage}\`: ${description}\n`)
                                    .reduce((prev, current) => prev + current, '')
                            )
                            .setColor('#07b4ed')
                    );
                
            }
        })
    }
})