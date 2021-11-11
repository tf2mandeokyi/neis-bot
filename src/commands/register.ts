import { REST } from '@discordjs/rest';
import { Routes, RESTGetAPIApplicationCommandsResult } from 'discord-api-types/v9';
import { ApplicationCommand } from 'discord.js';

import { commands } from './'

export default async function(botToken: string, clientId: string, testGuildId?: string) : Promise<REST> {

    const rest = new REST({ version: '9' }).setToken(botToken);

    const strings = Object.keys(commands);

    const body = strings.map(str => commands[str].getCommandJSONBody(str));

    await rest.put(Routes.applicationCommands(clientId), { body });
    if(testGuildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, testGuildId), { body });
    }

    return rest;
}