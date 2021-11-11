import { Client, Intents } from 'discord.js';
import { NeisApiClient } from './src/api/neis';
import { bot_token, neis_token } from './config.json';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
export const neisClient = new NeisApiClient(neis_token);

import interactionCreate from './src/events/interactionCreate';
import prelogin from './src/events/prelogin';
import ready from './src/events/ready';

prelogin();
client.on('interactionCreate', interactionCreate);
client.on('ready', ready);
client.login(bot_token);