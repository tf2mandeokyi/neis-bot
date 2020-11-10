import { Command } from "..";
import { School } from "../../api/neis/classes/school";
import * as ScheduleTableImageGenerator from '../../util/subject_schedule/images/table_img_gen';
import * as DateUtil from '../../util/dateutil';
import * as discord from 'discord.js'

export default new Command({
    regex: /^(\-*\d+)주후시간표$/,
    argsLength: 4,
    category: '시간표',
    usages: [{usage: '<숫자>주후시간표 <학교> <학년도> <학년> <반>', description: '몇주 후의 시간표를 출력합니다.'}],
    execute: async (message, args, neisClient, command) => {
        let { channel } = message;
        let [_, weekFromCommand] = /^(\-*\d+)주후시간표$/.exec(command);
        let week_number = parseInt(weekFromCommand);
        if(week_number !== week_number) throw new Error(`반드시 "주후시간표" 이전에는 숫자가 들어가야 합니다.`);

        if(args[0].length === 0) throw new Error(`학교명이 비워져있습니다.`);

        let schools : School[] = (await neisClient.getSchoolByName(args[0])).schools;
        if(!schools) throw new Error(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`);
        let school = schools[0];

        let schoolType : 'ele' | 'mid' | 'high' | 'others' = 'others';
        switch(school.type) {
            case '초등학교': schoolType = 'ele'; break;
            case '중학교': schoolType = 'mid'; break;
            case '고등학교': schoolType = 'high'; break;
        }

        let tempDate = new Date();
        tempDate.setDate(tempDate.getDate() + 7*week_number);

        let { table, week } = await neisClient.getWeekSubjectSchedule(school.code, school.eduOffice.code, schoolType, {
            year: parseInt(args[1]),
            grade: args[2],
            classname: args[3]
        }, tempDate);

        console.log(JSON.stringify(table));
        console.log(JSON.stringify(week));

        let timeTable : [Date, {[x: number]: string}][] = Object.entries(table)
            .sort((entryA, entryB) => parseInt(entryA[0]) - parseInt(entryB[0]))
            .map(entry => [ DateUtil.parseYYYYMMDD(entry[0]), entry[1] ]);

        let image = ScheduleTableImageGenerator.generate(timeTable);
        
        await channel.send('', new discord.MessageAttachment(image.toBuffer(), 'schedule_table.png'));
    }
});