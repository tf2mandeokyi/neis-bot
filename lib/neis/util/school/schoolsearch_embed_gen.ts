import * as discord from 'discord.js';
import { NeisApiClient } from '../../../neis';
import { School } from '../../classes/school';



export const numberEmojiSet = {'1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4, '5️⃣': 5, '6️⃣': 6, '7️⃣': 7, '8️⃣': 8, '9️⃣': 9, '🔟': 10};
export const numberEmojiArray = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];



const getPaginationRange = function(page: number, pageCount: number, elementCount: number) {
    let page_end = Math.ceil(elementCount/pageCount);
    return {
        min: Math.min(Math.max(1, page-2), page_end-4),
        max: Math.max(5, Math.min(page+2, page_end)),
        page_end: page_end
    };
}



/*
export async function generate_deprecated(
        neisClient: NeisApiClient,
        schoolName: string,
        page: number,
        {schoolCountPerPage} : {schoolCountPerPage: number}
)
{
    const schools = await neisClient.getSchoolByName(schoolName); // Getting data

    let schoolsobj = schools.slice(0, schoolCountPerPage).map((school, i) => ({name: numberEmojiArray[i], value: school.name, inline: true})); // Preparing embed object

    let { min: it_min, max: it_max } = getPaginationRange(page, schoolCountPerPage, schools.total_count);

    let pagination = '⏪ ◀️ ';
    if(1 !== it_min) pagination += '1 ... '
    for(let i=it_min;i<=it_max;i++) {
        pagination += i === page ? `__**${i}**__ ` : `${i} `;
    }
    if(page_end !== it_max) pagination += `... ${page_end} `
    pagination += '▶️ ⏩'; // Setting up pagination string

    let embed = new discord.MessageEmbed().setTitle('검색 결과').setColor('#00ff00').setTimestamp()
        .setDescription(`Found ${schools.length} ${schools.length === 1 ? 'school' : 'schools'}\n`)
        .addFields(schoolsobj)
        .addField('\u200B', pagination);

    return {
        embed: embed,
        schools: schoolsobj
    }
}
*/



export async function generate(
    neisClient: NeisApiClient,
    schoolName: string,
    page: number,
    {schoolCountPerPage=5}
) : Promise<discord.MessageEmbed>
{

    return new Promise(async (res, rej) => {

        let schools : School[];
        let total_count : number;
        
        try { 
            let tmp = (await neisClient.getSchoolByName(schoolName));
            schools = tmp.schools; total_count = tmp.total_count;
        } catch(e) { rej(e); return }

        let { min: it_min, max: it_max, page_end } = getPaginationRange(page, schoolCountPerPage, schools.length);

        let pagination = '⏪ ◀️ ';
        if(1 !== it_min) pagination += '1 ... '
        for(let i=it_min;i<=it_max;i++) {
            pagination += i === page ? `__**${i}**__ ` : `${i} `;
        }
        if(page_end !== it_max) pagination += `... ${page_end} `
        pagination += '▶️ ⏩'; // Setting up pagination string

        let description = `Found ${total_count} ${total_count === 1 ? 'school' : 'schools'}`;
        if(total_count > 1000) {
            description += ', limiting to 1000 schools.'
        }

        let embed = new discord.MessageEmbed().setTitle('검색 결과').setColor('#00ff00').setTimestamp()
            .setDescription(description)
            .addFields(
                schools.slice(page-1, 5).map(school => ({
                    name: `▫️${school.name} (${school.code})`,
                    value: `> **교육청**: ${school.eduOffice.name} (코드: ${school.eduOffice.code})\n` +
                            `> **종류**: ${school.type}\n` +
                            `> **영문명**: ${school.engName}\n` +
                            `> **도로명 주소**: ${school.roadName.address} (우편번호: ${school.roadName.zipCode})\n` +
                            `> **Tel**: ${school.telephone} (팩스: ${school.fax})` // \n\u200B
                }))
            )
            .addField('\u200B', pagination);

        res(embed);
    })
}