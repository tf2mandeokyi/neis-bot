import { MessageAttachment } from "discord.js";

import { neisClient } from "../../..";
import { Command } from "../command";
import { parseYYYYMMDD } from '../../util/dateutil';
import searchEmbedGen from "../../util/school/searchEmbedGen";
import * as ScheduleTableImageGenerator from '../../util/subject_schedule/images/table_img_gen';

export default new Command({
    description: "반 시간표를 출력합니다.",
    options: {
        "학교": {
            type: "string",
            description: "학교 이름",
            required: true
        },
        "년도": {
            type: "integer",
            description: "현재 년도 (예: 2018)",
            required: true
        },
        "학년": {
            type: "string",
            description: "학년",
            required: true
        },
        "반": {
            type: "string",
            description: "반",
            required: true
        },
        "n주후": {
            type: "integer",
            description: "n번째 주 후의 시간표가 출력됩니다. 예: 0=이번주, 1=다음주"
        },
    },
    onCommand: async function(event) {
        let { options } = event;
        let school = await searchEmbedGen(neisClient, options.getString("학교"), event);
        let n_weeks = options.getInteger("n주후") ?? 0;

        let schoolType : 'ele' | 'mid' | 'high' | 'others' = 'others';
        switch(school.type) {
            case '초등학교': schoolType = 'ele'; break;
            case '중학교': schoolType = 'mid'; break;
            case '고등학교': schoolType = 'high'; break;
        }

        let tempDate = new Date();
        tempDate.setDate(tempDate.getDate() + 7 * n_weeks);

        let { table } = await neisClient.getWeekSubjectSchedule(school.code, school.eduOffice.code, schoolType, {
            year: options.getInteger("년도"),
            grade: options.getString("학년"),
            classname: options.getString("반")
        }, tempDate);

        let timeTable : [Date, {[x: number]: string}][] = Object.entries(table)
            .sort((entryA, entryB) => parseInt(entryA[0]) - parseInt(entryB[0]))
            .map(entry => [ parseYYYYMMDD(entry[0]), entry[1] ]);
        
        let image = ScheduleTableImageGenerator.generate(timeTable);
        
        await event.update({ 
            files: [{
                attachment: image.toBuffer('image/png'),
                name: 'table.png'
            }],
            embeds: [],
            components: []
        })
    }
})