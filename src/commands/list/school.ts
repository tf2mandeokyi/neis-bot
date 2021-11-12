import { MessageEmbed } from "discord.js";

import { Command } from "../command";
import { neisClient } from "../../..";
import searchEmbedGen from '../../util/school/searchEmbedGen';
import { formatDate } from "../../util/dateutil";


export default new Command({
    description: "전국에 있는 학교 중 입력한 이름, 혹은 그와 유사한 이름을 가진 학교를 검색합니다.",
    options: {
        "학교명": {
            type: 'string',
            description: '학교의 이름',
            required: true
        }
    },
    onCommand: async function(event) {
        let school = await searchEmbedGen(neisClient, event.options.getString("학교명"), event);
        let embed = new MessageEmbed()
            .setTitle(`${school.name} (${school.engName})`)
            .addField("종류", school.type, true)
            .addField("소재지", school.location, true)
            .addField("개교일", formatDate(school.openingDay), true)
            .setColor("GREEN")
            .setURL(school.homepage)
            .addField("주소", school.roadName.address, true);

        await event.update({ embeds: [ embed ], components: [] });
    }
});