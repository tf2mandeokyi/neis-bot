import { Command } from ".";
import * as SchoolSearchEmbedGenerator from '../api/neis/util/school/schoolsearch_embed_gen';

export default new Command({
    regex: /^학교검색$/,
    argsLength: 1,
    category: '학교',
    usages: [{usage: '학교검색 <학교>', description: '해당하는 학교의 정보를 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return new Promise(async (res, rej) => {
            let { channel, author } = message;

            let result = await SchoolSearchEmbedGenerator.generate(neisClient, args[0], 1, {schoolCountPerPage: 5});

            let sentMessage = await channel.send(result);

            ['⏪', '◀️', '▶️', '⏩'].forEach(async emoji => await sentMessage.react(emoji)); // Add pagination reactions

            sentMessage.awaitReactions(
                (reaction, user) => {
                    const emoji = reaction.emoji.name;
                    return ['⏪', '◀️', '▶️', '⏩'].includes(emoji) // User reacted with right emoji.
                        && user.id === author.id; // User who has sent the command reacted.
                },
                {max: 10000, time: 60000}
            ).then(collection => {
                const reaction = collection.first();
                if(!reaction) return;
                const emoji = reaction.emoji.name; // Get reaction emoji

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