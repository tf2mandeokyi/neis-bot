import { CommandInteraction, MessageEmbed } from 'discord.js';

import { commands } from './';


export default async function(interaction: CommandInteraction) {
    const command = commands[interaction.commandName];
    if(command) {
        try {
            await command.handleCommandInteraction(interaction);
        } catch(error) {
            console.log(error);
        }
    }
}