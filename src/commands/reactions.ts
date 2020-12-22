import * as discord from 'discord.js';
import { client } from '../..';
import fetch from 'node-fetch'
import * as DiscordRawRequest from '../util/discord/rawrequest'


/** @returns True if the listener has to be continued, or false if otherwise. */
type ReactionListenerFunction<VariableType extends object> =
    (reaction: discord.MessageReaction, user: discord.User | discord.PartialUser, variable?: VariableType)
        => (boolean | Promise<boolean>);
type ReactionListenerExpireFunction = () => void;



type ReactionListenerOptions = {
    deleteAllReactionsOnExpiration?: boolean,
    deleteReactionOnAdded?: boolean
}


type MessageIdPack = {
    channelId: string,
    id: string
}


export type ReactionListener<VariableType extends object> = {
    message: MessageIdPack,
    execute: ReactionListenerFunction<VariableType>,
    expire?: ReactionListenerExpireFunction,
    delta: number,
    expiringDate: Date,
    variable: VariableType,
    options?: ReactionListenerOptions;
}



export class ReactionListenerList {
    private list: ReactionListener<object>[];

    constructor() {this.list = []}

    start() {
        return setInterval(async () => {await this.update()}, 1000);
    }



    addListener<T extends object>(
            message: discord.Message,
            {h, m, s, ms} : {h?: number, m?: number, s?: number, ms?: number},
            {execute, expire, variable}: {
                execute: ReactionListenerFunction<T>,
                expire?: ReactionListenerExpireFunction,
                variable?: T
            },
            options?: ReactionListenerOptions
    ) {
        let delta = (((h??0)*60 + (m??0))*60 + (s??0))*1000 + (ms??0);

        this.list.push({
            message: {channelId: message.channel.id, id: message.id},
            execute,
            expire,
            expiringDate: new Date(new Date().getTime() + delta),
            delta,
            variable,
            options
        });
    }



    async check(messageId: string, reaction: discord.MessageReaction, user: discord.User | discord.PartialUser) {
        let date = new Date().getTime();
        for(let listener of this.list) {
            if(listener.message.id === messageId) {
                let again = await listener.execute(reaction, user, listener.variable);
                if(again) {
                    listener.expiringDate = new Date(date + listener.delta);
                }
                if(listener.options.deleteReactionOnAdded) {
                    DiscordRawRequest.deleteUserReaction(client, listener.message.channelId, listener.message.id, user.id, reaction.emoji.name);
                }
            }
        }
    }



    update() {
        let date = new Date().getTime();
        this.list = this.list.filter(listener => {
            if(listener.expiringDate.getTime() < date) {
                if(listener.expire) listener.expire();
                if(listener.options.deleteAllReactionsOnExpiration) {
                    DiscordRawRequest.deleteAllReactions(client, listener.message.channelId, listener.message.id)
                }
                return false;
            }
            return true;
        })
    }
}