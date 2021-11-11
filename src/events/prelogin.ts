import { client } from '../..';
import { bot_token, client_id, test_guild } from '../../config.json';

import { registerCommands } from "../commands";

export default async function() {
    await registerCommands(bot_token, client_id, test_guild);
}