import { Command } from "..";
import { formatDate } from "../../api/neis/util/dateutil";
import * as discord from 'discord.js'

export default new Command({
    regex: /^오늘급식$/,
    argsLength: 1,
    category: '급식',
    usages: [{usage: '오늘급식 <학교>', description: '오늘의 학교 급식을 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return new Promise(async (res, rej) => {
            let { channel } = message;

            /** @type {School[]} */
            let schools;
            try { schools = (await neisClient.getSchoolByName(args[0])).schools } catch(e) { rej(e); return }

            if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
            let school = schools[0];

            let currentDate = new Date();

            /**@type {SchoolMeal[]}*/
            let responseData; 
            try {
                responseData = (await neisClient.getSchoolMeal(school.code, school.eduOffice.code, {from: currentDate, to: currentDate}))
            } catch(e) {
                rej(e); return;
            }

            responseData.forEach(async (meal) => {
                await channel.send(
                    new discord.MessageEmbed()
                        .setTitle(`${meal.school.name} ${formatDate(currentDate)} ${meal.mealType}`)
                        .setColor('#00ff00')
                        .addFields([
                            {name: `식단`, value: meal.menu, inline: true},
                            {name: '영양정보', value: meal.nutritions, inline: true},
                            {name: '원산지', value: meal.origins, inline: true},
                            {name: '칼로리', value: meal.calorie}
                        ])
                )
            });
        });
    }
})