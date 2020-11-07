const fetch = require('node-fetch');
const { School } = require('./classes/school/school');
const { SchoolMeal } = require('./classes/school/school_meal');
const { SubjectTime } = require('./classes/time/subject_time');
const stringSimilarity = require('string-similarity');
const NeisDateUtil = require('./util/dateutil');



/**
 * @typedef {[{list_total_count: number}, {RESULT: {CODE: string, MESSAGE: string}}]} RawResponseHeader
 */

/**
 * @typedef {[{head: RawResponseHeader}, {row: Object[]}]} RawNeisResponse
 */



const apiUrl = 'https://open.neis.go.kr';



const encodeObjectToURI = function(object) {
    let result = '';
    for (var key in object) {
        if(object[key] === 'undefined') continue;

        if (result != '')
            result += '&';
        result += key + '=' + encodeURIComponent(object[key]);
    }
    return result;
}



class NeisResponse {
    /**
     * @param {RawNeisResponse} rawData
     */
    constructor(rawData) {
        if(rawData) {
            this.resCode = rawData[0].head[1].RESULT.CODE;
            this.data = rawData[1].row;
        }
    }
}



class NeisApiClient {



    constructor(key) {
        this.key = key;
    }
    


    /**
     * @param {string} path 
     * @param {{index: number, size: number}} param1 
     * @param {any} param 
     * @param {string} name 
     */
    async fetchData(path, {index=1, size=1000}, param, name) {
        param['KEY'] = this.key;
        param['pIndex'] = index; param['pSize'] = size; param['Type'] = 'json';

        const url = apiUrl + path + '?' + encodeObjectToURI(param);
        const data = await (await fetch(url)).json();
        return new NeisResponse(data[name]);
    }



    /**
     * @param {string} name 
     * @returns {Promise<School[]>}
     * */
    getSchoolByName(name) {
        return new Promise(async (res, rej) => {
            const response = await this.fetchData('/hub/schoolInfo', {}, {SCHUL_NM: name}, 'schoolInfo')
            
            if(!response.data) rej(`\`${name}\` (이)라는 학교가 존재하지 않습니다.`);
            else res(
                response.data.map(i => new School(i))
                    .map((school) => ({school: school, similarity: stringSimilarity.compareTwoStrings(school.name, name)}))
                    .sort((a, b) => b.similarity - a.similarity).map(obj => obj.school)
            );
        })
    }



    /**
     * @param {string} schoolCode
     * @param {string} eduOfficeCode
     * @param {{from: Date, to: Date}} dateInfo
     * @returns {Promise<SchoolMeal[]>}
     */
    getSchoolMeal(schoolCode, eduOfficeCode, {from, to}) {
        return new Promise(async (res, rej) => {
            const response = await this.fetchData('/hub/mealServiceDietInfo', {}, {
                ATPT_OFCDC_SC_CODE: eduOfficeCode,
                SD_SCHUL_CODE: schoolCode,
                MLSV_FROM_YMD: NeisDateUtil.toYYYYMMDD(from),
                MLSV_TO_YMD: NeisDateUtil.toYYYYMMDD(to)
            }, 'mealServiceDietInfo');
            
            if(!response.data) rej(`주어진 값에 대한 데이터가 없습니다. (아마도 휴일이거나 아니면 급식이 없는거겠죠?)`);
            else res(
                response.data.map(i => new SchoolMeal(i))
            )
        })
    }



    /**
     * @param {string} eduOfficeCode 
     * @param {string} schoolCode
     * @param {'ele'|'mid'|'high'|'others'} schoolType
     * @param {{year: number, semester: string, grade: string, classname: string}} param2 
     * @param {{from: Date, to: Date}} param3 
     * @returns {Promise<SubjectTime[]>}
     */
    getSubjectSchedule(schoolCode, eduOfficeCode, schoolType, {year, semester, grade, classname}, {from, to}) {
        return new Promise(async (res, rej) => {
            let st;
            switch(schoolType) {
                case 'ele':    st = 'elsTimetable'; break;
                case 'mid':    st = 'misTimetable'; break;
                case 'high':   st = 'hisTimetable'; break;
                case 'others': st = 'spsTimetable'; break;
            }
            const response = await this.fetchData(`/hub/${st}`, {}, {
                ATPT_OFCDC_SC_CODE: eduOfficeCode,
                SD_SCHUL_CODE: schoolCode,
                AY: year,
                SEM: semester,
                GRADE: grade,
                CLASS_NM: classname,
                TI_FROM_YMD: NeisDateUtil.toYYYYMMDD(from),
                TI_TO_YMD: NeisDateUtil.toYYYYMMDD(to)
            }, st);
            
            if(!response.data) rej(`주어진 값에 대한 데이터가 없습니다.`);
            else res(
                response.data.map(i => new SubjectTime(i))
            )
        })
    }



    /**
     * @param {string} eduOfficeCode 
     * @param {string} schoolCode
     * @param {'ele'|'mid'|'high'|'others'} schoolType
     * @param {{year: number, semester: string, grade: string, classname: string}} classInfo 
     * @param {Date} date 
     * @returns {Promise<{table: Object<number, Object<number, string>>, week: {from: Date, to: Date}}>}
     */
    getWeekSubjectSchedule(schoolCode, eduOfficeCode, schoolType, classInfo={year, semester, grade, classname}, date) {
        return new Promise(async (res, rej) => {
            
            let week = NeisDateUtil.getWeekEdge(date);

            /** @type {SubjectTime[]} */
            let responseData;
            try {
                responseData = await this.getSubjectSchedule(schoolCode, eduOfficeCode, schoolType, classInfo, week);
            } catch(e) {
                rej(e); return;
            }

            /** @type {Object<number, Object<number, string>} */
            const subjectSet = {};
    
            responseData.forEach(subject => {
                let yyyymmdd = parseInt(NeisDateUtil.toYYYYMMDD(subject.date));
                if(!subjectSet[yyyymmdd]) subjectSet[yyyymmdd] = [];
                subjectSet[yyyymmdd][subject.period] = subject.subject;
            });

            res({
                table: subjectSet,
                week: week
            });

        })
        
    }



}



module.exports = {
    NeisApiClient: NeisApiClient,
    NeisResponse: NeisResponse
}