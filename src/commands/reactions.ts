import * as discord from 'discord.js';


/** @returns True if the listener has to be continued, or false if otherwise. */
type ReactionListenerFunction = (reaction: discord.MessageReaction, user: discord.User | discord.PartialUser) => boolean;
type ReactionListenerExpireFunction = () => void;


export type ReactionListener = {
    messageId: string,
    execute: ReactionListenerFunction,
    expire?: ReactionListenerExpireFunction,
    delta: number,
    expiringDate: Date;
}


export class ReactionListenerList {
    private list: ReactionListener[];

    constructor() {this.list = []}

    start() {
        return setInterval(async () => {await this.update()}, 1000);
    }

    addListener(messageId: string, {h, m, s, ms} : {h?: number, m?: number, s?: number, ms?: number}, execute: ReactionListenerFunction, expire?: ReactionListenerExpireFunction) {
        let delta = (((h??0)*60 + (m??0))*60 + (s??0))*1000 + (ms??0);

        this.list.push({messageId, execute, expire, expiringDate: new Date(new Date().getTime() + delta), delta});

        console.log("Listener added.")
    }

    async check(messageId: string, reaction: discord.MessageReaction, user: discord.User | discord.PartialUser) {
        let date = new Date().getTime();
        for(let listener of this.list) {
            if(listener.messageId === messageId) {
                let again = await listener.execute(reaction, user);
                if(again) {
                    listener.expiringDate = new Date(date + listener.delta);
                }
            }
        }
    }

    async update() {
        let date = new Date().getTime();
        this.list = this.list.filter(listener => {
            if(listener.expiringDate.getTime() < date) {
                if(listener.expire) listener.expire();
                return false;
            }
            return true;
        })
    }
}