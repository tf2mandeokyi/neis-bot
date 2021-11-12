import { MessageEmbed } from "discord.js";

import { neisClient } from "../../..";
import { SchoolMeal } from "../../api/neis/classes/school/school_meal";
import { Command } from "../command";
import { School } from "../../api/neis/classes/school";
import { getWeekEdge, formatDate, weekdays } from '../../util/dateutil';
import searchEmbedGen from "../../util/school/searchEmbedGen";


async function singleDay(school: School, date: Date) : Promise<MessageEmbed[]> {
    let responseData = await neisClient.getSchoolMeal(school.code, school.eduOffice.code, {from: date, to: date})

    return responseData.map(meal => {
        return new MessageEmbed()
            .setTitle(`${meal.school.name} ${formatDate(date)} ${meal.mealType}`)
            .setColor('#00ff00')
            .addFields([
                {name: `식단`, value: meal.menu, inline: true},
                {name: '영양정보', value: meal.nutritions, inline: true},
                {name: '원산지', value: meal.origins, inline: true},
                {name: '칼로리', value: meal.calorie}
            ])
    });
}


async function singleWeek(school: School, date: Date) : Promise<MessageEmbed[]> {
    let week = getWeekEdge(date);
    let responseData = await neisClient.getSchoolMeal(school.code, school.eduOffice.code, week);
    let mealTypeSet : { [x: string] : SchoolMeal[] } = {};

    responseData.forEach(day => {
        if(!mealTypeSet[day.mealType]) mealTypeSet[day.mealType] = [];
        mealTypeSet[day.mealType].push(day);
    });

    let embeds : MessageEmbed[] = [];

    Object.entries(mealTypeSet).forEach(([key, value]) => {
        embeds.push(
            new MessageEmbed()
                .setTitle(`${school.name} ${key} (${formatDate(week.from)} ~ ${formatDate(week.to)})`)
                .setColor('#00ff00')
                .addFields(value.map(day => ({
                    name: `${day.date.day.getMonth()+1}/${day.date.day.getDate()} ${weekdays[day.date.day.getDay()]} (${day.calorie})`,
                    value: day.menu,
                    inline: true
                })))
        );
    });

    return embeds;
}


export default new Command({
    description: "학교의 급식을 출력합니다",
    options: {
        "학교": {
            type: "string",
            description: "학교",
            required: true
        },
        "기간": {
            type: 'string',
            description: '선택된 기간의 급식 일정이 출력되며, 기본값은 "이번주"입니다.',
            choices: {
                '어제': 'yesterday',
                '오늘': 'today',
                '내일': 'tomorrow',
                '저번주': 'prevweek',
                '이번주': 'thisweek',
                '다음주': 'nextweek'
            }
        }
    },
    onCommand: async function(event) {
        let school = await searchEmbedGen(neisClient, event.options.getString("학교"), event);
        let embeds : MessageEmbed[];
        switch(event.options.getString("기간")) {
            case 'yesterday': embeds = await singleDay(school, new Date(new Date().getTime() - 8.64e+7)); break;
            case 'today':     embeds = await singleDay(school, new Date(new Date().getTime())); break;
            case 'tomorrow':  embeds = await singleDay(school, new Date(new Date().getTime() + 8.64e+7)); break;

            case 'prevweek': embeds = await singleWeek(school, new Date(new Date().getTime() - 7 * 8.64e+7)); break;
            case 'nextweek': embeds = await singleWeek(school, new Date(new Date().getTime() + 7 * 8.64e+7)); break;
            
            case 'thisweek':
            default: embeds = await singleWeek(school, new Date(new Date().getTime()));
        }

        await event.update({ embeds, components: [] });
    }
})