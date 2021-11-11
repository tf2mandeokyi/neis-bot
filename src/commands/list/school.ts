import { Command } from "../command";
import { neisClient } from "../../..";
import searchEmbedGen from '../../util/school/searchEmbedGen';


export default new Command({
    description: "전국에 있는 학교 중 입력한 이름, 혹은 그와 유사한 이름을 가진 학교를 검색합니다.",
    options: {
        "학교명": {
            type: 'string',
            description: '학교의 이름',
            required: true
        }
    },
    onCommand: async function(options, interaction) {

        await searchEmbedGen(neisClient, options.getString("학교명"), interaction, async school => {
            return { content: school.name, embeds: [], components: [] };
        });

    }
});