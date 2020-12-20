import * as discord from 'discord.js';
import { NeisApiClient } from './neis';

export type ObjectMap<V> = {
    [x: string] : V
}

export interface CommandUsage {
    usage: string,
    description: string
}

export class Command {
    regex: RegExp;
    argsLength: number;
    category: string;
    unused?: boolean;
    usages: CommandUsage[];
    execute: (message: discord.Message, args: string[], neisClient: NeisApiClient, command: string) => Promise<void>;

    constructor(struct: Command) {
        this.regex = struct.regex;
        this.argsLength = struct.argsLength;
        this.category = struct.category;
        this.unused = struct.unused;
        this.usages = struct.usages;
        this.execute = struct.execute;
    }
}

export function getCommand(command: string) : Command {
    return commands.find(c => c.regex.test(command) && !c.unused)
}

import help from './commands/help';
import 학교검색 from './commands/학교검색';
import 오늘급식 from './commands/급식/오늘급식';
import 이번주급식 from './commands/급식/이번주급식';
import 다음주급식 from './commands/급식/다음주급식';
import 저번주급식 from './commands/급식/저번주급식';
import n주후급식 from './commands/급식/n주후급식';
import 이번주시간표 from './commands/시간표/이번주시간표';
import 다음주시간표 from './commands/시간표/다음주시간표';
import n주후시간표 from './commands/시간표/n주후시간표';
import 저번주시간표 from './commands/시간표/저번주시간표';

export const commands : Command[] = [
    help,
    학교검색,
    오늘급식,
    이번주급식,
    다음주급식,
    저번주급식,
    n주후급식,
    이번주시간표,
    다음주시간표,
    저번주시간표,
    n주후시간표
]