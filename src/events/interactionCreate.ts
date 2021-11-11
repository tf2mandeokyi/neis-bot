import { CacheType, Interaction } from "discord.js";
import { handleCommandInteraction } from "../commands";

export default async function(interaction: Interaction<CacheType>) {
    if(interaction.isCommand()) handleCommandInteraction(interaction);
}