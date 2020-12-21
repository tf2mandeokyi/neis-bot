import * as discord from 'discord.js';
import { NeisApiClient } from '../../api/neis';
import { School } from '../../api/neis/classes/school';



export const numberEmojiSet = {'1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4, '5️⃣': 5, '6️⃣': 6, '7️⃣': 7, '8️⃣': 8, '9️⃣': 9, '🔟': 10};
export const numberEmojiArray = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];



const getPaginationRange = function(page: number, pageCount: number, arrayLength: number) {
    let delta = Math.floor(pageCount / 2);
    let page_first = page - delta, page_last = page + delta;
    if(page_first < 1 && page_last > arrayLength) {
        return {min: 1, max: arrayLength};
    }
    else if(page_first < 1) {
        let d = 1 - page_first;
        return {min: 1, max: Math.min(arrayLength, page_last + d)}
    }
    else if(page_last > arrayLength) {
        let d = page_last - arrayLength;
        return {min: Math.max(1, page_first - d), max: arrayLength};
    }
    else {
        return {min: page_first, max: page_last}
    }
}



export async function generate(
    schools: School[],
    total_count: number,
    page: number,
    {schoolCountPerPage=5}
) : Promise<{embed: discord.MessageEmbed, page_count: number}>
{

    return new Promise(async (res, rej) => {

        let page_count = Math.ceil(schools.length / schoolCountPerPage);
        let { min: page_min, max: page_max } = getPaginationRange(page, schoolCountPerPage, page_count);

        let pagination = '⏪ ◀️ ';
        if(1 !== page_min) pagination += '1 ... '
        for(let i=page_min;i<=page_max;i++) {
            pagination += i === page ? `__**${i}**__ ` : `${i} `;
        }
        if(page_count !== page_max) pagination += `... ${page_count} `
        pagination += '▶️ ⏩'; // Setting up pagination string

        let description = `Found ${total_count} ${total_count === 1 ? 'school' : 'schools'}`;
        if(total_count > 1000) {
            description += ', limiting to 1000 schools.'
        }

        let embed = new discord.MessageEmbed().setTitle('검색 결과').setColor('#00ff00').setTimestamp()
            .setDescription(description)
            .addFields(
                schools.slice((page*5)-5, (page*5)).map(school => ({
                    name: `▫️${school.name} (${school.code})`,
                    value: `> **교육청**: ${school.eduOffice.name} (코드: ${school.eduOffice.code})\n` +
                            `> **종류**: ${school.type}\n` +
                            `> **영문명**: ${school.engName}\n` +
                            `> **도로명 주소**: ${school.roadName.address} (우편번호: ${school.roadName.zipCode})\n` +
                            `> **Tel**: ${school.telephone} (팩스: ${school.fax})` // \n\u200B
                }))
            )
            .addField('\u200B', pagination);

        res({embed, page_count});
    })
}