import { CacheType, CommandInteraction, Message, MessageComponentInteraction, MessageEmbed, MessageInteraction, MessageOptions } from 'discord.js';
import { MessageActionRow, MessageButton } from "discord.js";

import { NeisApiClient } from '../../api/neis';
import { School } from '../../api/neis/classes/school';



async function generateEmbed(schools: School[], total_count: number, page: number, per_page: number)
 : Promise<{embed: MessageEmbed, page_count: number}> {

    let page_count = Math.ceil(schools.length / per_page);

    let description = total_count > 1000 ? '1000개 이상의 검색결과가 있습니다' : `${total_count}개의 검색결과가 있습니다.`;

    let embed = new MessageEmbed().setTitle('검색 결과').setColor('YELLOW').setTimestamp()
        .setDescription(description)
        .addFields(
            schools.slice((page-1) * per_page, page * per_page).map((school, i) => ({
                name: `${(page-1) * per_page + i + 1}. ${school.name} (${school.code})`,
                value: `> **교육청**: ${school.eduOffice.name} (코드: ${school.eduOffice.code})\n` +
                        `> **종류**: ${school.type}\n` +
                        `> **영문명**: ${school.engName}\n` +
                        `> **도로명 주소**: ${school.roadName.address}\n`, // \n\u200B
                inline: false
            }))
        )
        .addField('\u200B', `${page} / ${page_count}`);

    return { embed, page_count }
}



async function createContent(neisClient: NeisApiClient, search: string, page: number, per_page: number) {
    let { schools, total_count } = await neisClient.getSchoolByName(search);
    let { embed, page_count } = await generateEmbed(schools, total_count, page, per_page);

    let components : MessageActionRow[] = [ new MessageActionRow(), new MessageActionRow() ]

    for(var i = per_page * (page - 1) + 1; i <= Math.min(per_page * page, schools.length); ++i) {
        components[0].addComponents(new MessageButton().setCustomId(`school_${i}`).setLabel(i + '').setStyle("SECONDARY"));
    }

    components[1]
        .addComponents(new MessageButton().setCustomId('first_page').setLabel("<<").setStyle("SUCCESS"))
        .addComponents(new MessageButton().setCustomId('prev_page'). setLabel("<"). setStyle("SUCCESS"))
        .addComponents(new MessageButton().setCustomId('next_page'). setLabel(">"). setStyle("SUCCESS"))
        .addComponents(new MessageButton().setCustomId('last_page'). setLabel(">>").setStyle("SUCCESS"));

    return { schools, embed, components, page_count };
}



export default async function(
    neisClient: NeisApiClient, search: string, command: CommandInteraction<CacheType>,
    onSuccess: (school: School) => Promise<MessageOptions>, per_page: number = 3,
) : Promise<void> {

    let page = 1;

    let { schools, embed, components, page_count } = await createContent(neisClient, search, page, per_page);

    if(schools.length == 1) {
        await command.reply(await onSuccess(schools[0]));
        return;
    }

    let message = await command.reply({ embeds: [ embed ], components, fetchReply: true });

    const collector = command.channel.createMessageComponentCollector({
        filter: i => i.isMessageComponent() && i.user.id == command.user.id && i.message.id == message.id,
        time: 120000
    });

    return new Promise<void>((resolve, _) => {
        collector.on('collect', async interaction => {
            if(!interaction.isMessageComponent()) return;
    
            if(interaction.componentType == "BUTTON") {
                let { customId } = interaction;
                if(customId.startsWith('school_')) {
                    let school = schools[Number.parseInt(customId.substring('school_'.length)) - 1];
                    await interaction.update(await onSuccess(school));
                    resolve();
                }
                else {
                    switch(customId) {
                        case 'first_page': page = 1; break;
                        case 'prev_page': if(page != 1) page--; break;
                        case 'next_page': if(page != page_count) page++; break;
                        case 'last_page': page = page_count; break;
                    }
                    let { embed, components } = await createContent(neisClient, search, page, per_page);
                    await interaction.update({ embeds: [ embed ], components });
                }
            }
        });
    })

}