const discord = require('discord.js');
const { NeisApiClient } = require('./neis/neis');
const { School } = require('./neis/classes/school/school');
const { SchoolMeal } = require('./neis/classes/school/school_meal')
const { SubjectTime } = require('./neis/classes/time/subject_time')
const config = require('./config.json');
const DateUtil = require('./neis/util/dateutil');
const { ScheduleTableImageGenerator } = require('./neis/util/schedule_table/images/img_gen');





/**
 * @typedef {Object} Command
 * @property {RegExp} regex Regex for the command
 * @property {number} argsLength Least argument count.
 * @property {string} description Description.
 * @property {string[]} usages Usage of how to use the command.
 * @property {(message: discord.Message, args: string[], neisClient: NeisApiClient, command: string) => Promise<void>} execute function
 */





/**
 * 
 * @param {Date} date 
 */
const formatDate = function(date) {
    return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`;
}





/**
 * @param {string} command 
 */
const getCommand = function(command) {
    return commands.find(c => c.regex.test(command))
}





/** @type {[Command]} */
const commands = [





    {
        regex: /^help$/,
        argsLength: 0,
        description: '명령어가 주어지면 그 명령어의 설명문을 출력하고, 주어지지 않으면 사용 가능한 명령어들을 출력합니다.',
        usages: ['help (<명령어>)'],
        execute: (message, args) => {
            return new Promise(async (res, rej) => {

                let { channel } = message;

                switch(args.length) {

                    case 0: // No parameters
                        let result = commands
                            .map((data) => `▫️\`${config.command.prefix}${data.usages[0]}\` ${data.description}\n\n`)
                            .reduce((prev, current) => current + prev, '');
                        channel.send(
                            new discord.MessageEmbed().setTitle('커맨드 목록').setDescription(result)
                        );
                        break;

                    default: 
                        let command = commands.find(c => c.regex.test(args[0]));
                        if(!command) {
                            channel.send(
                                new discord.MessageEmbed()
                                    .setTitle(`\`${config.command.prefix}${args[0]}\`라는 명령어가 존재하지 않습니다.`)
                                    .setColor('#ff0000')
                            );
                            return;
                        }
                        channel.send(
                            new discord.MessageEmbed()
                                .setTitle(`\`${config.command.prefix}${args[0]}\``)
                                .setDescription(command.description)
                                .addField('사용법', `\`${config.command.prefix + command.usages}\``)
                        );
                    
                }
            })
        }
    },





    {
		regex: /^학교정보$/,
        argsLength: 1,
        description: '해당하는 학교의 정보를 출력합니다.',
        usages: ['학교정보 <학교>'],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;
                
                /** @type {School[]} */
                const schools = (await neisClient.getSchoolByName(args[0]).catch(rej));

                let result = new discord.MessageEmbed().setTitle('검색 결과').setColor('#00ff00').setTimestamp()
                    .setDescription(`Found ${schools.length} ${schools.length === 1 ? 'school' : 'schools'}`)
                    .addFields(
                        schools.slice(0, 5).map(school => ({
                            name: `${school.name} (${school.code})`,
                            value: `> **교육청**: ${school.eduOffice.name} (코드: ${school.eduOffice.code})\n` +
                                    `> **종류**: ${school.type}\n` +
                                    `> **영문명**: ${school.engName}\n` +
                                    `> **도로명 주소**: ${school.roadName.address} (우편번호: ${school.roadName.zipCode})\n` +
                                    `> **Tel**: ${school.telephone} (팩스: ${school.fax})\n\u200B`
                        }))
                    );
                
                if(schools.length > 5) {
                    result.addField('...', '\u200B');
                }

                channel.send(result);
            })
        }
    },





    {
		regex: /^오늘급식$/,
        argsLength: 1,
        description: '오늘의 학교 급식을 출력합니다.',
        usages: [
            '오늘급식 <학교>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {School[]} */
                let schools = (await neisClient.getSchoolByName(args[0]).catch(rej));
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let currentDate = new Date();

                /**@type {SchoolMeal[]}*/
                let responseData; 
                try {
                    responseData = (await neisClient.getSchoolMeal(school.code, school.eduOffice.code, {from: currentDate, to: currentDate}))
                } catch(e) {
                    rej(e); return;
                }

                responseData.forEach(async (meal) => {
                    await channel.send(
                        new discord.MessageEmbed()
                            .setTitle(`${meal.school.name} ${formatDate(currentDate)} ${meal.mealType}`)
                            .setColor('#00ff00')
                            .addFields([
                                {name: `식단`, value: meal.menu, inline: true},
                                {name: '영양정보', value: meal.nutritions, inline: true},
                                {name: '원산지', value: meal.origins, inline: true},
                                {name: '칼로리', value: meal.calorie}
                            ])
                    )
                });
            });
        }
    },





    {
		regex: /^이번주급식$/,
        argsLength: 1,
        description: '이번주의 학교 급식을 출력합니다.',
        usages: [
            '이번주급식 <학교>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {School[]} */
                let schools = (await neisClient.getSchoolByName(args[0]).catch(rej));
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let week = DateUtil.getWeekEdge(new Date());

                /** @type {SchoolMeal[]} */
                let responseData;
                try {
                    responseData = await neisClient.getSchoolMeal(school.code, school.eduOffice.code, week);
                } catch(e) {
                    rej(e); return;
                }

                /**
                 * @type {Object<string, SchoolMeal[]>}
                 */
                let mealTypeSet = {};

                responseData.forEach(day => {
                    if(!mealTypeSet[day.mealType]) mealTypeSet[day.mealType] = [];
                    mealTypeSet[day.mealType].push(day);
                });

                Object.entries(mealTypeSet).forEach(async ([key, value]) => {
                    await channel.send(
                        new discord.MessageEmbed()
                            .setTitle(`${school.name} ${key} (${formatDate(week.from)} ~ ${formatDate(week.to)})`)
                            .setColor('#00ff00')
                            .addFields(
                                value.map(day => {
                                    return {
                                        name: `${day.date.day.getMonth()+1}/${day.date.day.getDate()} ${DateUtil.weekdays[day.date.day.getDay()]} (${day.calorie})`,
                                        value: day.menu,
                                        inline: true
                                    }
                                })
                            )
                    );
                })
            });
        }
    },





    {
		regex: /^이번주시간표$/,
        argsLength: 5,
        description: '이번주의 시간표를 출력합니다.',
        usages: [
            '이번주시간표 <학교> <학년도> <학기> <학년> <반>'
        ],
        execute: (message, args, neisClient) => {
            return getCommand('0주후시간표').execute(message, args, neisClient, '0주후시간표');
        }
    },





    {
		regex: /^(\d+)주후시간표$/,
        argsLength: 5,
        description: '몇주 후의 시간표를 출력합니다.',
        usages: [
            '<숫자>주후시간표 <학교> <학년도> <학기> <학년> <반>'
        ],
        execute: (message, args, neisClient, command) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                let [_, week_number] = /^(\d+)주후시간표$/.exec(command);

                week_number -= 0;

                if(week_number === NaN) {
                    rej(`반드시 "주후시간표" 이전에는 숫자가 들어가야 합니다.`); return;
                }

                /** @type {School[]} */
                let schools = await neisClient.getSchoolByName(args[0]).catch(rej);
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let schoolType = 'others';
                switch(school.type) {
                    case '초등학교': schoolType = 'ele'; break;
                    case '중학교': schoolType = 'mid'; break;
                    case '고등학교': schoolType = 'high'; break;
                }

                let tempDate = new Date();
                tempDate.setDate(tempDate.getDate() + 7*week_number);

                let table;
                try {
                    let responseData = await neisClient.getWeekSubjectSchedule(school.code, school.eduOffice.code, schoolType, {
                        year: args[1],
                        semester: args[2],
                        grade: args[3],
                        classname: args[4]
                    }, tempDate);
                    table = responseData.table;
                    week = responseData.week;
                } catch(e) {
                    rej(e); return;
                }

                /** @type {[Date, Object<number, string>][]} */
                let timeTable = Object.entries(table).sort((entryA, entryB) => entryA[0] - entryB[0]).map(entry => ([
                    DateUtil.parseYYYYMMDD(entry[0]),
                    entry[1]
                ]));

                let image = ScheduleTableImageGenerator.generate(timeTable);
                
                await channel.send('', new discord.MessageAttachment(image.toBuffer(), 'schedule_table.png'));
            })
        }
    }

]





module.exports = {
    list: commands,
    getCommand: getCommand
};