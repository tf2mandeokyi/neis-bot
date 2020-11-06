const fetch = require('node-fetch');
const { School } = require('./classes/school/school');
const { SchoolMeal } = require('./classes/school/school_meal');
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
        // console.log(url);
        const response = await fetch(url);
        return new NeisResponse((await response.json())[name]);
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
            
            if(!response.data) rej(`주어진 값과 관련된 데이터가 없습니다.`);
            else res(
                response.data.map(i => new SchoolMeal(i))
            )
        })
    }
}



module.exports = {
    NeisApiClient: NeisApiClient,
    NeisResponse: NeisResponse
}