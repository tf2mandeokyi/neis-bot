import { Command } from '../command';
import school from './school';
import table from './table';
import food from './food';

const commands : { [x: string] : Command }= {
    '학교': school,
    '시간표': table,
    '급식': food
};

export default commands;