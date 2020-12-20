import * as discord from 'discord.js'
import { client, reactionListeners } from '../..'

export default async function(reaction: discord.MessageReaction, user: discord.User | discord.PartialUser) {

    if(user.id !== client.user.id) {
        await reactionListeners.check(reaction.message.id, reaction, user);
    }

}