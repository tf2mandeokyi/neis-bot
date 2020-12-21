import * as discord from 'discord.js'
import fetch from 'node-fetch'


async function send(client: discord.Client, path: string, method: string, body?: string) {
    return await fetch('https://discord.com/api/v8' + path, {
        method,
        headers: {
            'Authorization': `Bot ${client.token}`
        },
        body
    })
}


export async function deleteAllReactions(client: discord.Client, channelId: string, messageId: string) {
    await send(client, `/channels/${channelId}/messages/${messageId}/reactions`, 'DELETE');
}


export async function deleteUserReaction(client: discord.Client, channelId: string, messageId: string, userId: string, emoji: string) {
    await send(client, `/channels/${channelId}/messages/${messageId}/reactions/${encodeURI(emoji)}/${userId}`, 'DELETE');
}


export async function editMessageEmbed(client: discord.Client, channelId: string, messageId: string, embed: discord.MessageEmbed) {
    await send(client, `/channels/${channelId}/messages/${messageId}`, 'PATCH', JSON.stringify({embed}))
}