const discord = require('discord.js');
const { NeisApiClient } = require('../../neis');


const numberEmojiSet = {'1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4, '5️⃣': 5, '6️⃣': 6, '7️⃣': 7, '8️⃣': 8, '9️⃣': 9, '🔟': 10};
const numberEmojiArray = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {


    numberEmojiSet: numberEmojiSet,
    
    numberEmojiArray: numberEmojiArray,

    /**
     * 
     * @param {NeisApiClient} neisClient 
     * @param {string} schoolName 
     * @param {number} page 
     * @param {{schoolCountPerPage: number}} options
     */
    generate: async function (neisClient, schoolName, page, {schoolCountPerPage}) {
        const schools = await neisClient.getSchoolByName(schoolName); // Getting data

        let schoolsobj = schools.slice(0, schoolCountPerPage).map((school, i) => ({name: numberEmojiArray[i], value: school.name, inline: true})); // Preparing embed object

        let page_end = Math.ceil(schools.length/schoolCountPerPage);
        let it_min = Math.min(Math.max(1, page-2), page_end-4), it_max = Math.max(5, Math.min(page+2, page_end)); // Setting up for iterator

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


}