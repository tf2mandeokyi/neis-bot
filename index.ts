import { NeisApiClient } from './src/api/neis';
import * as discord from 'discord.js';
import * as fs from 'fs';


export const important = JSON.parse(fs.readFileSync('important.json').toString())
export const config = JSON.parse(fs.readFileSync('config.json').toString())


export const client = new discord.Client();
export const neisClient = new NeisApiClient(important['neis-token']);


import onMessage from './src/events/message';
import onReady from './src/events/ready';


client.on('message', onMessage);
client.on('ready', onReady)


client.login(important['bot-token']);