import { Command, ObjectMap } from "../../commands";
import { SchoolMeal } from "../../neis/classes/school/school_meal";
import * as DateUtil from '../../neis/util/dateutil';
import * as discord from 'discord.js'
import { formatDate } from "../../neis/util/dateutil";

export default new Command({
    regex: /^(\-*\d+)주후급식$/,
    argsLength: 1,
    category: '급식',
    usages: [{usage: '<숫자>주후급식 <학교>', description: '몇주 후의 학교 급식을 출력합니다.'}],
    execute: async (message, args, neisClient, command) => {
        return new Promise(async (res, rej) => {
            let { channel } = message;

            let [_, weekFromCommand] = /^(\-*\d+)주후급식$/.exec(command);

            let week_number = parseInt(weekFromCommand);

            if(week_number === NaN) {
                rej(`반드시 "주후시간표" 이전에는 숫자가 들어가야 합니다.`); return;
            }

            /** @type {School[]} */
            let schools;
            try { schools = (await neisClient.getSchoolByName(args[0])).schools } catch(e) { rej(e); return }

            if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
            let school = schools[0];

            let tempDate = new Date();
            tempDate.setDate(tempDate.getDate() + 7*week_number);
            let week = DateUtil.getWeekEdge(tempDate);

            /** @type {SchoolMeal[]} */
            let responseData;
            try {
                responseData = await neisClient.getSchoolMeal(school.code, school.eduOffice.code, week);
            } catch(e) {
                rej(e); return;
            }

            let mealTypeSet : ObjectMap<SchoolMeal[]> = {};

            responseData.forEach(day => {
                if(!mealTypeSet[day.mealType]) mealTypeSet[day.mealType] = [];
                mealTypeSet[day.mealType].push(day);
            });

            Object.entries(mealTypeSet).forEach(async ([key, value]) => {
                await channel.send(
                    new discord.MessageEmbed()
                        .setTitle(`${school.name} ${key} (${formatDate(week.from)} ~ ${formatDate(week.to)})`)
                        .setColor('#00ff00')
                        .addFields(
                            value.map(day => {
                                return {
                                    name: `${day.date.day.getMonth()+1}/${day.date.day.getDate()} ${DateUtil.weekdays[day.date.day.getDay()]} (${day.calorie})`,
                                    value: day.menu,
                                    inline: true
                                }
                            })
                        )
                );
            })
        });
    }
})