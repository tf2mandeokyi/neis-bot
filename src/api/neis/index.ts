import fetch from 'node-fetch';
import { RawSchoolInfo, School } from './classes/school';
import { RawSchoolMealInfo, SchoolMeal } from './classes/school/school_meal';
import { RawSubjectTime, SubjectTime } from './classes/time/subject_time';
import * as stringSimilarity from 'string-similarity';
import * as NeisDateUtil from './util/dateutil';



export type RawResponseHeader = [
    {list_total_count: number},
    {
        RESULT: {
            CODE: string, MESSAGE: string
        }
    }
]



export type RawNeisResponse<T> = [
    {head: RawResponseHeader},
    {row: T[]}
]



export type ScheduleTable = {[x: number]: {[x: number]: string}};



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



export class NeisResponse<T> {

    totalCount : number;
    resCode : string;
    data : T[];

    constructor(rawData: RawNeisResponse<T>) {
        if(rawData) {
            let head = rawData[0].head;

            this.totalCount = head[0].list_total_count;
            this.resCode = head[1].RESULT.CODE;
            this.data = rawData[1].row;
        }
    }
}



export class NeisApiClient {



    private key : string;



    constructor(key: string) {
        this.key = key;
    }
    


    async fetchData<T>(path: string, {index=1, size=1000}, param: any, name: string) : Promise<NeisResponse<T>> {
        param['KEY'] = this.key;
        param['pIndex'] = index; param['pSize'] = size; param['Type'] = 'json';

        const url = apiUrl + path + '?' + encodeObjectToURI(param);
        const data = await (await fetch(url)).json();
        return new NeisResponse<T>(data[name]);
    }



    getSchoolByName(
            name: string,
            options : {index: number, size: number} = {index: undefined, size: undefined}
    ) : Promise<{schools: School[], total_count: number}>
    {
        return new Promise(async (res, rej) => {
            const response = await this.fetchData<RawSchoolInfo>('/hub/schoolInfo', options, {SCHUL_NM: name}, 'schoolInfo')
            
            if(!response.data) rej(`\`${name}\` (이)라는 학교가 존재하지 않습니다.`);
            else res({
                total_count: response.totalCount,
                schools: response.data.map(i => new School(i))
                    .map((school) => ({school: school, similarity: stringSimilarity.compareTwoStrings(school.name, name)}))
                    .sort((a, b) => b.similarity - a.similarity).map(obj => obj.school)
            });
        })
    }



    getSchoolMeal(
            schoolCode: string,
            eduOfficeCode: string,
            {from, to} : {from: Date, to: Date}
    ) : Promise<SchoolMeal[]>
    {
        return new Promise(async (res, rej) => {
            const response = await this.fetchData<RawSchoolMealInfo>('/hub/mealServiceDietInfo', {}, {
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



    getSubjectSchedule(
            schoolCode: string,
            eduOfficeCode: string,
            schoolType: ('ele'|'mid'|'high'|'others'),
            {year, semester, grade, classname}: {year: number, semester: string, grade: string, classname: string},
            {from, to}: {from: Date, to: Date}
    ) : Promise<SubjectTime[]>
    {
        return new Promise(async (res, rej) => {
            let st;
            switch(schoolType) {
                case 'ele':    st = 'elsTimetable'; break;
                case 'mid':    st = 'misTimetable'; break;
                case 'high':   st = 'hisTimetable'; break;
                case 'others': st = 'spsTimetable'; break;
            }
            const response = await this.fetchData<RawSubjectTime>(`/hub/${st}`, {}, {
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



    getWeekSubjectSchedule(
            schoolCode: string,
            eduOfficeCode: string,
            schoolType: 'ele'|'mid'|'high'|'others',
            classInfo: {year: number, semester: string, grade: string, classname: string},
            date: Date
    ) : Promise<{table: ScheduleTable, week: {from: Date, to: Date}}>
    {
        return new Promise(async (res, rej) => {
            
            let week = NeisDateUtil.getWeekEdge(date);

            /** @type {SubjectTime[]} */
            let responseData;
            try {
                responseData = await this.getSubjectSchedule(schoolCode, eduOfficeCode, schoolType, classInfo, week);
            } catch(e) {
                rej(e); return;
            }

            const subjectSet : ScheduleTable = {};
            for(
                let i=0,d=week.from.getDate(),date=new Date(week.from);
                i<7;
                ++i,date.setDate(++d)
            ) {
                subjectSet[NeisDateUtil.toYYYYMMDD(date)] = [];
            }
    
            responseData.forEach(subject => {
                let yyyymmdd = parseInt(NeisDateUtil.toYYYYMMDD(subject.date));
                if(!subjectSet[yyyymmdd]) return;
                subjectSet[yyyymmdd][subject.period] = subject.subject;
            });

            res({
                table: subjectSet,
                week: week
            });

        })
        
    }
}