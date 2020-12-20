import { client, config } from "../..";

export default async function() {
    client.user.setActivity(`${config.command.prefix}help`);
    console.log('NeisBot is online!');
}