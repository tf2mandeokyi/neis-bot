import * as NeisDateUtil from '../../../../util/dateutil';



export interface RawSchoolMealInfo {
    /**시도교육청코드*/
    ATPT_OFCDC_SC_CODE: string
    /**시도교육청명*/
    ATPT_OFCDC_SC_NM: string
    /**표준학교코드*/
    SD_SCHUL_CODE: string
    /**학교명*/
    SCHUL_NM: string
    /**식사코드*/
    MMEAL_SC_CODE: string
    /**식사명*/
    MMEAL_SC_NM: string
    /**급식일자*/
    MLSV_YMD: string
    /**급식인원수*/
    MLSV_FGR: string
    /**요리명*/
    DDISH_NM: string
    /**원산지정보*/
    ORPLC_INFO: string
    /**칼로리정보*/
    CAL_INFO: string
    /**영양정보*/
    NTR_INFO: string
    /**급식시작일자*/
    MLSV_FROM_YMD: string
    /**급식종료일자*/
    MLSV_TO_YMD: string
}



export class SchoolMeal {



    /** 학교 */
    school: {
        /** 시도교육청 */
        eduOffice: { code: string; name: string; };
        /** 표준학교코드 */
        code: string;
        /** 이름 */
        name: string;
    };
    /** 식사 코드 */
    code: string;
    /** 식사명 */
    mealType: string;
    /** 급식일 정보 */
    date: {
        /** 급식일자 */
        day: Date;
        /** 시작일자 */
        from: Date;
        /** 종료일자 */
        to: Date;
    };
    /** 급식 인원수 */
    memberCount: string;
    /** 요리명 */
    menu: string;
    /** 원산지 정보 */
    origins: string;
    /** 칼로리 정보 */
    calorie: string;
    /** 영양 정보 */
    nutritions: string;



    constructor(rawData: RawSchoolMealInfo) {
        this.school = {
            eduOffice: {
                code: rawData.ATPT_OFCDC_SC_CODE,
                name: rawData.ATPT_OFCDC_SC_NM
            },
            code: rawData.SD_SCHUL_CODE,
            name: rawData.SCHUL_NM
        }
        this.code = rawData.MMEAL_SC_CODE;
        this.mealType = rawData.MMEAL_SC_NM;
        this.date = {
            day: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_YMD),
            from: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_FROM_YMD),
            to: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_TO_YMD)
        };
        this.memberCount = rawData.MLSV_FGR;
        this.menu = rawData.DDISH_NM.replace(/\<br\/\>/g, '\n').replace(/(\*|_|`|~|\\)/g, '\\$1');
        this.origins = rawData.ORPLC_INFO.replace(/\<br\/\>/g, '\n').replace(/(\*|_|`|~|\\)/g, '\\$1');
        this.calorie = rawData.CAL_INFO;
        this.nutritions = rawData.NTR_INFO.replace(/\<br\/\>/g, '\n').replace(/(\*|_|`|~|\\)/g, '\\$1');
    }
}