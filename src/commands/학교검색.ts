import { Command } from ".";
import { client, reactionListeners } from "../..";
import * as SchoolSearchEmbedGenerator from '../util/school/schoolsearch_embed_gen';
import * as DiscordRawRequest from '../util/discord/rawrequest'
import { School } from "../api/neis/classes/school";


function checkReactionEmoji(emoji: string, page_count: number, variable: {page: number}) : boolean {
    switch(emoji) {
        case '⏪':
            if(variable.page !== 1) {
                variable.page = 1;
                return true;
            }
            break;
        case '◀️':
            if(variable.page !== 1) {
                variable.page -= 1; return true;
            }
            break;
        case '▶️':
            if(variable.page !== page_count) {
                variable.page += 1; return true;
            }
            break;
        case '⏩':
            if(variable.page !== page_count) {
                variable.page = page_count;
                return true;
            }
            break;
    }
    return false;
}


export default new Command({
    regex: /^학교검색$/,
    argsLength: 1,
    category: '학교',
    usages: [{usage: '학교검색 <학교>', description: '해당하는 학교의 정보를 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return new Promise(async (res, rej) => {
            let { channel, author } = message;

            let schools: School[], total_count: number;
            try { 
                let tmp = (await neisClient.getSchoolByName(args[0]));
                schools = tmp.schools; total_count = tmp.total_count;
            } catch(e) { rej(e); return }

            let {embed, page_count} = await SchoolSearchEmbedGenerator.generate(schools, total_count, 1, {schoolCountPerPage: 5});

            let sentMessage = await channel.send(embed);
            
            if(page_count >= 2) {
                if(page_count > 2) await sentMessage.react('⏪'); // Add pagination reactions
                for (let emoji of ['◀️', '▶️']) {
                    await sentMessage.react(emoji);
                }
                if(page_count > 2) await sentMessage.react('⏩');
                
                reactionListeners.addListener(sentMessage, {m: 3}, {
                    execute: async (reaction, user, variable) => {
                        if(user.id !== author.id) {
                            return false;
                        }
                        let fix: boolean = checkReactionEmoji(reaction.emoji.name, page_count, variable);
                        if(fix) {
                            let fixed_embed = (await SchoolSearchEmbedGenerator.generate(variable.schools, variable.total_count, variable.page, {schoolCountPerPage: 5})).embed;
                            await DiscordRawRequest.editMessageEmbed(client, channel.id, sentMessage.id,
                                fixed_embed
                            );
                            return true;
                        }
                        return false;
                    },
                    variable: {page: 1, schools, total_count}
                }, {
                    deleteAllReactionsOnExpiration: true,
                    deleteReactionOnAdded: true
                });
            }
        })
    }
})