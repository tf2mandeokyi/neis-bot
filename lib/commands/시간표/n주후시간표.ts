import { Command } from "../../commands";
import { ScheduleTable } from "../../neis";
import { School } from "../../neis/classes/school";
import * as ScheduleTableImageGenerator from '../../neis/util/subject_schedule/images/table_img_gen';
import * as DateUtil from '../../neis/util/dateutil';
import * as discord from 'discord.js'

export default new Command({
    regex: /^(\-*\d+)주후시간표$/,
    argsLength: 5,
    category: '시간표',
    usages: [{usage: '<숫자>주후시간표 <학교> <학년도> <학기> <학년> <반>', description: '몇주 후의 시간표를 출력합니다.'}],
    execute: (message, args, neisClient, command) => {
        return new Promise(async (res, rej) => {
            let { channel } = message;

            let [_, weekFromCommand] = /^(\-*\d+)주후시간표$/.exec(command);

            let week_number = parseInt(weekFromCommand);

            if(week_number !== week_number) {
                rej(`반드시 "주후시간표" 이전에는 숫자가 들어가야 합니다.`); return;
            }

            if(args[0].length === 0) rej(`학교명이 비워져있습니다.`);

            let schools : School[];
            try { schools = (await neisClient.getSchoolByName(args[0])).schools } catch(e) { rej(e); return }

            if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
            let school = schools[0];

            let schoolType : ('ele'|'mid'|'high'|'others') = 'others';
            switch(school.type) {
                case '초등학교': schoolType = 'ele'; break;
                case '중학교': schoolType = 'mid'; break;
                case '고등학교': schoolType = 'high'; break;
            }

            let tempDate = new Date();
            tempDate.setDate(tempDate.getDate() + 7*week_number);

            let table: ScheduleTable, week: {from: Date, to: Date};
            try {
                let responseData = await neisClient.getWeekSubjectSchedule(school.code, school.eduOffice.code, schoolType, {
                    year: parseInt(args[1]),
                    semester: args[2],
                    grade: args[3],
                    classname: args[4]
                }, tempDate);
                table = responseData.table;
                week = responseData.week;
            } catch(e) {
                rej(e); return;
            }

            let timeTable : any = Object.entries(table).sort((entryA, entryB) => parseInt(entryA[0]) - parseInt(entryB[0])).map(entry => {
                let result = [
                    DateUtil.parseYYYYMMDD(entry[0]),
                    entry[1]
                ]
                return result;
            });
            // TODO fix this

            let image = ScheduleTableImageGenerator.generate(timeTable);
            
            await channel.send('', new discord.MessageAttachment(image.toBuffer(), 'schedule_table.png'));
        })
    }
});