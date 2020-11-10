import * as discord from 'discord.js';
import * as fs from 'fs';
import { NeisApiClient } from './src/api/neis';
import { ReactionListenerList } from './src/commands/reactions';


export const important = JSON.parse(fs.readFileSync('important.json').toString())
export const config = JSON.parse(fs.readFileSync('config.json').toString())
export const reactionListeners : ReactionListenerList = new ReactionListenerList();


reactionListeners.start();


export const client = new discord.Client();
export const neisClient = new NeisApiClient(important['neis-token']);


import onMessage from './src/events/message';
import onReady from './src/events/ready';
import onMessageReactionAdd from './src/events/messageReactionAdd';


client.on('message', onMessage);
client.on('ready', onReady)
client.on('messageReactionAdd', onMessageReactionAdd)


client.login(important['bot-token']);