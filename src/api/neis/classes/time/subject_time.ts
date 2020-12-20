import * as NeisDateUtil from '../../../../util/dateutil';



export interface RawSubjectTime {
    /**시도교육청코드*/
    ATPT_OFCDC_SC_CODE: string
    /**시도교육청명*/
    ATPT_OFCDC_SC_NM: string
    /**표준학교코드*/
    SD_SCHUL_CODE: string
    /**학교명*/
    SCHUL_NM: string
    /**학년도*/
    AY: string
    /**학기*/
    SEM: string
    /**시간표일자*/
    ALL_TI_YMD: string
    /**주야과정명*/
    DGHT_CRSE_SC_NM: string
    /**계열명*/
    ORD_SC_NM: string
    /**학과명*/
    DDDEP_NM: string
    /**학년*/
    GRADE: string
    /**강의실명*/
    CLRM_NM: string
    /**반명*/
    CLASS_NM: string
    /**교시*/
    PERIO: string
    /**수업내용*/
    ITRT_CNTNT: string
    /**적재일시*/
    LOAD_DTM: string
}




export class SubjectTime {


    
    /** 학교 */
    school: {
        /** 시도교육청 */
        eduOffice: { code: string; name: string; };
        /** 표준학교코드 */
        code: string;
        /** 이름 */
        name: string;
    };
    /** 시간표 일자 */
    date: Date;
    /** 교시 */
    period: string;
    /** 수업 내용 */
    subject: string;
    /** 반 정보 */
    classProperty: {
        /** 학년도 */
        year: string;
        /** 학기 */
        semester: string;
        /** 주야 과정명 */
        daynight: string;
        /** 계열명 */
        order: string;
        /** 학과명 */
        department: string;
        /** 학년 */
        grade: string;
        /** 강의실명 */
        classroom: string;
        /** 반명 */
        class_name: string;
    };
    /** 적재일시 */
    loadDate: Date;



    constructor(rawData: RawSubjectTime) {
        this.school = {
            eduOffice: {
                code: rawData.ATPT_OFCDC_SC_CODE,
                name: rawData.ATPT_OFCDC_SC_NM
            },
            code: rawData.SD_SCHUL_CODE,
            name: rawData.SCHUL_NM
        };
        this.date = NeisDateUtil.parseYYYYMMDD(rawData.ALL_TI_YMD);
        this.period = rawData.PERIO;
        this.subject = rawData.ITRT_CNTNT;
        this.classProperty = {
            year: rawData.AY,
            semester: rawData.SEM,
            daynight: rawData.DGHT_CRSE_SC_NM,
            order: rawData.ORD_SC_NM,
            department: rawData.DDDEP_NM,
            grade: rawData.GRADE,
            classroom: rawData.CLRM_NM,
            class_name: rawData.CLASS_NM
        }
        this.loadDate = NeisDateUtil.parseYYYYMMDDHHMMSS(rawData.LOAD_DTM);
    }
}