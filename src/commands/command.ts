import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, User, CommandInteractionOptionResolver, CacheType, MessageOptions, Guild, TextBasedChannels, Message, MessageEmbed } from 'discord.js';
import { APIMessage, ChannelType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';


type CommonOption<T extends string> = { type: T; description: string; }
type Requirable = { required?: boolean; }
type Choosable<T> = { choices?: { [name: string] : T } }


type BooleanOption = CommonOption<'boolean'> & Requirable
type ChannelOption = CommonOption<'channel'> & Requirable & {
    channelTypes: Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>[];
}
type IntegerOption = CommonOption<'integer'> & Requirable & Choosable<number>;
type MentionOption = CommonOption<'mention'> & Requirable;
type NumberOption = CommonOption<'number'> & Requirable & Choosable<number>;
type RoleOption = CommonOption<'role'> & Requirable;
type StringOption = CommonOption<'string'> & Requirable & Choosable<string>;
type SubcommandOption = CommonOption<'subcommand'> & { options: { [name: string] : SubcommandOptions }; };
type SubcommandGroupOption = CommonOption<'subcommandgroup'> & { options: SubcommandGroupOptions; };
type UserOption = CommonOption<'user'> & Requirable;


type OptionTypes = BooleanOption | ChannelOption | IntegerOption | MentionOption | NumberOption | RoleOption | StringOption | SubcommandOption | SubcommandGroupOption | UserOption;
type SubcommandGroupOptions = SubcommandOption;
type SubcommandOptions = Exclude<Exclude<OptionTypes, SubcommandOption>, SubcommandGroupOptions>;


type CommandOptionSet = { [name: string] : OptionTypes };


interface CommandStruct {
    readonly description: string;
    readonly options?: CommandOptionSet;
    readonly onCommand: (event: CommandEvent) => Promise<void>;
}


export interface CommandEvent {
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">;
    update: (content: MessageOptions) => Promise<Message | APIMessage>;

    channel: TextBasedChannels;
    guild: Guild;
    user: User;
}


export class Command implements CommandStruct {

    readonly description: string;
    readonly options?: CommandOptionSet;
    readonly onCommand: (options: CommandEvent) => Promise<void>;

    constructor({ description, options, onCommand }: CommandStruct) {
        this.description = description;
        this.options = options;
        this.onCommand = onCommand;
    }

    async handleCommandInteraction(interaction: CommandInteraction) {
        const { options } = interaction;
        const update = async function(content: MessageOptions) : Promise<Message | APIMessage> {
            if(interaction.replied) {
                return await interaction.editReply(content);
            }
            else {
                return await interaction.reply({ ...content, fetchReply: true });
            }
        }
        const { channel, guild, user } = interaction;
        try {
            await this.onCommand({ options, update, channel, guild, user });
        } catch(error) {
            if(interaction.replied) {
                await update({ embeds: [ errorEmbed(error) ], components: [] });
            }
            else {
                await update({ embeds: [ errorEmbed(error) ], components: [] });
            }
        }
    }

    getCommandJSONBody(name: string) : RESTPostAPIApplicationCommandsJSONBody {

        let builder = new SlashCommandBuilder()
            .setName(name)
            .setDescription(this.description);

        addOptions(this.options, builder);

        return builder.toJSON();
    }
}


function errorEmbed(reason: string | Error) : MessageEmbed {
    let message = reason instanceof Error ? reason.message : reason;
    message.replace('`', '"');
    return new MessageEmbed()
        .setTitle("에러 발생!")
        .setDescription(`사유: \`${message}\``)
        .setColor("RED")
}


function addOptions(options: CommandOptionSet | CommandOptionSet, builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
    for(const optionName in options) {
        const option = options[optionName];
        const { description } = option;
        const required = 'required' in option ? option.required : undefined;
        const channelTypes = 'channelTypes' in option ? option.channelTypes : undefined;

        switch(option.type) {
            case 'boolean': 
                builder.addBooleanOption(o => {
                    o.setName(optionName).setDescription(description);
                    if(required) o.setRequired(required);
                    return o;
                });
                break;
            case 'channel': 
                builder.addChannelOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    if(channelTypes) o.addChannelTypes(channelTypes)
                    return o;
                });
                break;
            case 'integer': 
                builder.addIntegerOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    for(const choiceName in option.choices) {
                        o.addChoice(choiceName, option.choices[choiceName])
                    }
                    return o;
                });
                break;
            case 'mention':
                builder.addMentionableOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    return o;
                })
                break;
            case 'number': 
                builder.addNumberOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    for(const choiceName in option.choices) {
                        o.addChoice(choiceName, option.choices[choiceName])
                    }
                    return o;
                });
                break;
            case 'role':
                builder.addRoleOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    return o;
                })
                break;
            case 'string': 
                builder.addStringOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    for(const choiceName in option.choices) {
                        o.addChoice(choiceName, option.choices[choiceName])
                    }
                    return o;
                });
                break;
            case 'subcommand':
                if('addSubcommand' in builder) builder.addSubcommand(sc => {
                    sc.setName(optionName);
                    sc.setDescription(description);
                    if(option.options) {
                        addOptions(option.options, sc);
                    }
                    return sc;
                });
                else throw new Error("Subcommand in subcommand");
                break;
            case 'subcommandgroup':
                if('addSubcommandGroup' in builder) builder.addSubcommandGroup(scg => {
                    scg.setName(optionName);
                    scg.setDescription(description);
                    const subOptions = option.options;
                    if(subOptions) {
                        for(const subOption in subOptions) {
                            scg.addSubcommand(sc => {
                                sc.setName(optionName);
                                sc.setDescription(description);
                                if(option.options) {
                                    addOptions(subOptions[subOption], sc);
                                }
                                return sc;
                            })
                        }
                    }
                    return scg;
                });
                else throw new Error("Subcommand in subcommand");
                break;
            case 'user':
                builder.addUserOption(o => {
                    o.setName(optionName).setDescription(description)
                    if(required) o.setRequired(required);
                    return o;
                });
                break;
        }
    }
}