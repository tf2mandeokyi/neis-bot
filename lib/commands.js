const discord = require('discord.js');
const { NeisApiClient } = require('./neis/neis');
const config = require('./config.json');



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
                
                await neisClient.getSchoolByName(args[0]).then((schools) => {

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

                }).catch(rej);
            })
        }
    },

    '오늘의급식_코드': {
        argsLength: 2,
        description: '오늘의 학교 급식을 출력합니다.',
        usages: [
            '오늘의급식_코드 <교육청 코드> <학교 코드>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                await neisClient.getSchoolMeal(args[1], args[0], {from: new Date(), to: new Date()}).then(([data]) => {
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
                }).catch(rej);
            });
        }
    },

    '오늘의급식': {
        argsLength: 1,
        description: '오늘의 학교 급식을 출력합니다.',
        usages: [
            '오늘의급식 <학교명>'
        ],
        execute: async (message, args, neisClient) => {
            return new Promise(async (res, rej) => {
                let { channel } = message;

                let [school] = (await neisClient.getSchoolByName(args[0]).catch(rej));

                if(!school) {
                    rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`)
                }

                await neisClient.getSchoolMeal(school.code, school.eduOffice.code, {from: new Date(), to: new Date()}).then(([data]) => {
                    let date = data.date.day;
                    channel.send(
                        new discord.MessageEmbed()
                            .setTitle(`${data.school.name} ${formatDate(date)} 급식 (${data.mealType})`)
                            .setColor('#00ff00')
                            .addFields([
                                {name: `식단`, value: data.menu, inline: true},
                                {name: '영양정보', value: data.nutritions, inline: true},
                                {name: '원산지', value: data.origins, inline: true},
                                {name: '칼로리', value: data.calorie}
                            ])
                    )
                }).catch(rej);
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

                let [school] = (await neisClient.getSchoolByName(args[0]).catch(rej));

                if(!school) {
                    rej(`\`${args[0]}\` (이)라는 학교가 존재하지 않습니다.`)
                }

                let current = new Date(), fromDate = new Date(current), toDate = new Date(current);
                fromDate.setDate(current.getDate() - current.getDay());
                toDate.setDate(current.getDate() - 6 + current.getDay());

                await neisClient.getSchoolMeal(school.code, school.eduOffice.code, {from: fromDate, to: toDate}).then((days) => {
                    let embed = new discord.MessageEmbed()
                        .setTitle(`${school.name} 급식 (${formatDate(fromDate)} ~ ${formatDate(toDate)})`)
                        .setColor('#00ff00')
                        .addFields(
                            days.map(day => ({
                                name: `${day.date.day.getMonth()}/${day.date.day.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][day.date.day.getDay()]})`,
                                value: day.menu,
                                inline: true
                            }))
                        );
                    channel.send(embed);
                }).catch(rej);
            });
        }
    }
}

module.exports = commands;