const discord = require('discord.js');
const { NeisApiClient } = require('./neis/neis');
const { School } = require('./neis/classes/school/school');
const { SchoolMeal } = require('./neis/classes/school/school_meal')
const { SubjectTime } = require('./neis/classes/time/subject_time')
const config = require('./config.json');
const NeisDateUtil = require('./neis/util/dateutil')



/**
 * @typedef {Object} Command
 * @property {number} argsLength Least argument count.
 * @property {string} description Description.
 * @property {string[]} usages Usage of how to use the command.
 * @property {(message: discord.Message, args: string[], neisClient: NeisApiClient) => Promise<void>} execute function
 */



/**
 * 
 * @param {Date} date 
 */
const formatDate = function(date) {
    return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`;
}



/** @type {Object<string, Command>} */
const commands = {





    'commands': {
        argsLength: 0,
        description: '사용 가능한 명령어들을 출력합니다.',
        usages: ['commands'],
        execute: (message, args) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;
                let result = Object.entries(commands)
                    .map(([command, data]) => `\`${config.command.prefix}${command}\` ${data.description}\n`)
                    .reduce((prev, current) => current + prev, '');
                channel.send(
                    new discord.MessageEmbed().setTitle('커맨드 목록').setDescription(result)
                );
            })
        }
    },





    'help': {
        argsLength: 1,
        description: '특정 명령어의 설명문을 출력합니다.',
        usages: ['help <명령어>'],
        execute: (message, args) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;
                let command = commands[args[0]];
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
            })
        }
    },





    '학교정보': {
        argsLength: 1,
        description: '해당하는 학교의 정보를 출력합니다.',
        usages: ['학교정보 <학교명>'],
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





    '오늘의급식_코드': {
        argsLength: 2,
        description: '오늘의 학교 급식을 출력합니다. (Deprecated)',
        usages: [
            '오늘의급식_코드 <교육청 코드> <학교 코드>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {SchoolMeal[]} */
                let [data] = (await neisClient.getSchoolMeal(args[1], args[0], {from: new Date(), to: new Date()}).catch(rej));

                let date = data.date.day;
                channel.send(
                    new discord.MessageEmbed()
                        .setTitle(`${data.school.name}  급식 (${data.mealType})`)
                        .setColor('#00ff00')
                        .addFields([
                            {name: `식단`, value: data.menu, inline: true},
                            {name: '영양정보', value: data.nutritions, inline: true},
                            {name: '원산지', value: data.origins, inline: true},
                            {name: '칼로리', value: data.calorie}
                        ])
                )
            });
        }
    },





    '오늘급식': {
        argsLength: 1,
        description: '오늘의 학교 급식을 출력합니다.',
        usages: [
            '오늘급식 <학교명>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {School[]} */
                let schools = (await neisClient.getSchoolByName(args[0]).catch(rej));
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let currentDate = new Date();
                currentDate.setDate(6); // TODO remove this

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





    '이번주급식': {
        argsLength: 1,
        description: '이번주의 학교 급식을 출력합니다.',
        usages: [
            '이번주급식 <학교명>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {School[]} */
                let schools = (await neisClient.getSchoolByName(args[0]).catch(rej));
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let week = NeisDateUtil.getWeekEdge(new Date());

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
                        discord.MessageEmbed()
                            .setTitle(`${school.name} ${key} (${formatDate(week.from)} ~ ${formatDate(week.to)})`)
                            .setColor('#00ff00')
                            .addFields(
                                value.map(day => {
                                    return {
                                        name: `${day.date.day.getMonth()}/${day.date.day.getDate()} ${['일', '월', '화', '수', '목', '금', '토'][day.date.day.getDay()]} (${day.calorie})`,
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





    '이번주시간표': {
        argsLength: 4,
        description: '이번주의 시간표를 출력합니다.',
        usages: [
            '이번주시간표 <학년도> <학기> <학년> <반>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                /** @type {School[]} */
                let schools = await neisClient.getSchoolByName(args[0]).catch(rej);
                if(!schools) { rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`); return }
                let school = schools[0];

                let week = NeisDateUtil.getWeekEdge(new Date());

                /** @type {SubjectTime[]} */
                let responseData;
                try {
                    responseData = await neisClient.getSubjectTimes(school.code, school.eduOffice.code, {
                        year: args[1],
                        semester: args[2],
                        grade: args[3],
                        classname: args[4]
                    }, week);
                } catch(e) {
                    rej(e); return;
                }

                /** @type {Object<number, SubjectTime[]>} */
                const subjectSet = {};

                responseData.forEach(subject => {
                    let yyyymmdd = parseInt(NeisDateUtil.toYYYYMMDD(subject.date));
                    if(!subjectSet[yyyymmdd]) subjectSet[yyyymmdd] = [];
                    subjectSet[yyyymmdd].push(subject);
                })

                /** @type {[Date, string[]][]} */
                let timeTable = Object.entries(subjectSet).sort((entryA, entryB) => entryA[0] - entryB[0]).map(entry => ([
                    NeisDateUtil.parseYYYYMMDD(entry[0]),
                    entry[1].sort((timeA, timeB) => timeA.period - timeB.period).map(time => time.subject)
                ]));

                let embed = new discord.MessageEmbed()
                    .setTitle(`${school.name} ${args[1]}년도 ${args[2]}학기 ${args[3]}학년 ${args[4]}반 시간표`)
                    .setDescription(`${formatDate(week.from)} ~ ${formatDate(week.to)}`)
                    .setColor('#00ff00')
                    .addFields(
                        timeTable.map(entry => ({
                            name: `${entry[0].getMonth()+1}/${entry[0].getDate()} (${['일', '월', '화', '수', '목', '금', '토'][entry[0].getDay()]})`,
                            value: entry[1].reduce((prev, current) => prev + current + '\n', ''),
                            inline: true
                        }))
                    )

                await channel.send(embed);
                
            })
        }
    }

}

module.exports = commands;