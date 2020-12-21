import { Command } from ".";
import { client, reactionListeners } from "../..";
import * as SchoolSearchEmbedGenerator from '../util/school/schoolsearch_embed_gen';
import * as DiscordRawRequest from '../util/discord/rawrequest'
import { MessageEmbed } from "discord.js";
import { School } from "../api/neis/classes/school";

export default new Command({
    regex: /^학교검색$/,
    argsLength: 1,
    category: '학교',
    usages: [{usage: '학교검색 <학교>', description: '해당하는 학교의 정보를 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return new Promise(async (res, rej) => {
            let { channel, author } = message;

            let {embed, page_count} = await SchoolSearchEmbedGenerator.generate(neisClient, args[0], 1, {schoolCountPerPage: 5});

            let sentMessage = await channel.send(embed);

            for (let emoji of ['⏪', '◀️', '▶️', '⏩']) {
                await sentMessage.react(emoji); // Add pagination reactions
            }
            
            reactionListeners.addListener(sentMessage, {m: 3}, {
                execute: async (reaction, user, variable) => {
                    if(user.id !== author.id) {
                        return false;
                    }
                    let fix: boolean = false;
                    switch(reaction.emoji.name) {
                        case '⏪':
                            if(variable.page !== 1) {
                                variable.page = 1; fix = true;
                            }
                            break;
                        case '◀️':
                            if(variable.page !== 1) {
                                variable.page -= 1; fix = true;
                            }
                            break;
                        case '▶️':
                            if(variable.page !== page_count) {
                                variable.page += 1; fix = true;
                            }
                            break;
                        case '⏩':
                            if(variable.page !== page_count) {
                                variable.page = page_count; fix = true;
                            }
                            break;
                    }
                    if(fix) {
                        let fixed_embed = (await SchoolSearchEmbedGenerator.generate(neisClient, args[0], variable.page, {schoolCountPerPage: 5})).embed;
                        await DiscordRawRequest.editMessageEmbed(client, channel.id, sentMessage.id,
                            fixed_embed
                        );
                        return true;
                    }
                    return false;
                },
                variable: {page: 1}
            }, {
                deleteAllReactionsOnExpiration: true,
                deleteReactionOnAdded: true
            });
        })
    }
})
/*{
    regex: /^학교검색(:(\d+))$/,
    argsLength: 1,
    category: '학교',
    unused: true,
    usages: [{usage: '학교검색 <검색어>', description: '검색어가 포함되어있는 학교들을 출력합니다.'}],
    execute: async (message, args, neisClient, command) => {
        return new Promise(async (res, rej) => {
            try {
                    
                let { channel, author } = message;
                
                let [_, __, page_number] = /^학교검색(:(\d+))$/.exec(command);
                let page = parseInt(page_number); // Getting page number

                const { embed, schools } = await SchoolSearchEmbedGenerator.generate(neisClient, args[0], page, {schoolCountPerPage: 6});

                let sentMessage = await channel.send(embed); // Send embed object

                // Number emoji array.
                let nearray = SchoolSearchEmbedGenerator.numberEmojiArray.slice(0, schools.length);

                ['⏪', '◀️'].forEach(async emoji => await sentMessage.react(emoji));
                nearray.slice(0, schools.length).forEach(async emoji => await sentMessage.react(emoji));
                ['▶️', '⏩'].forEach(async emoji => await sentMessage.react(emoji)); // Add pagination reactions

                const reactionFilter = function (reaction, user) {
                    const emoji = reaction.emoji.name;
                    let num = nearray.includes(emoji);
                    return (num !== undefined || ['⏪', '◀️', '▶️', '⏩'].includes(emoji)) // User reacted with right emoji.
                        && user.id === author.id; // User who has sent the command reacted.
                }

                sentMessage.awaitReactions(reactionFilter, {max: 10000, time: 60000, errors: ['time']}).then(collection => {
                    const reaction = collection.first();
                    if(!reaction) return;
                    const emoji = reaction.emoji.name; // Get reaction emoji

                    if(nearray.includes(emoji)) { // If the emoji is number
                        let num = SchoolSearchEmbedGenerator.numberEmojiSet[emoji];
                        console.log(schools[num-1]);
                    }
                    else {
                        switch(emoji) {
                            case '⏪':
                                console.log('go to the first page');
                                break;
                            case '◀️':
                                console.log('go to the previous page');
                                break;
                            case '▶️':
                                console.log('go to the next page');
                                break;
                            case '⏩':
                                console.log('go to the last page');
                                break;
                        }
                    }
                });
            } catch(e) {rej(e)}
        })
    }
},*/