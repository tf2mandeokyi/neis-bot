import { CommandInteraction, MessageEmbed } from 'discord.js';

import { commands } from './';

function errorEmbed(reason: string | Error) : MessageEmbed {
    let message = reason instanceof Error ? reason.message : reason;
    message.replace('`', '"');
    return new MessageEmbed()
        .setTitle("에러 발생!")
        .setDescription(`사유: \`${message}\``)
        .setColor("RED")
}

export default async function(interaction: CommandInteraction) {
    const command = commands[interaction.commandName];
    if(command) {
        try {
            await command.onCommand(interaction.options, interaction);
        } catch(error) {
            if(interaction.replied) {
                (await interaction.editReply({ embeds: [ errorEmbed(error) ] }))
            }
            else {
                interaction.reply({ embeds: [ errorEmbed(error) ] });
            }
        }
    }
}