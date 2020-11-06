const NeisDateUtil = require('../util/dateutil');

/**
 * @typedef {Object} RawSchoolFoodInfo
 * 
 * @property {string} ATPT_OFCDC_SC_CODE 시도교육청코드
 * @property {string} ATPT_OFCDC_SC_NM 시도교육청명
 * @property {string} SD_SCHUL_CODE 표준학교코드
 * @property {string} SCHUL_NM 학교명
 * @property {string} MMEAL_SC_CODE 식사코드
 * @property {string} MMEAL_SC_NM 식사명
 * @property {string} MLSV_YMD 급식일자
 * @property {string} MLSV_FGR 급식인원수
 * @property {string} DDISH_NM 요리명
 * @property {string} ORPLC_INFO 원산지정보
 * @property {string} CAL_INFO 칼로리정보
 * @property {string} NTR_INFO 영양정보
 * @property {string} MLSV_FROM_YMD 급식시작일자
 * @property {string} MLSV_TO_YMD 급식종료일자
*/

module.exports.SchoolMeal = class {
    /** 
     * @param {RawSchoolFoodInfo} rawData
    */
    constructor(rawData) {
        /** 학교 */
        this.school = {
            /** 
             * 시도교육청 
             * */
            eduOffice: {
                code: rawData.ATPT_OFCDC_SC_CODE,
                name: rawData.ATPT_OFCDC_SC_NM
            },
            /** 
             * 표준학교코드 
             * */
            code: rawData.SD_SCHUL_CODE,
            /** 
             * 이름 
             * */
            name: rawData.SCHUL_NM
        }

        /**
         * 식사 코드
         */
        this.code = rawData.MMEAL_SC_CODE;

        /** 
         * 식사명
         */
        this.mealType = rawData.MMEAL_SC_NM;

        /**
         * 급식일 정보
         */
        this.date = {
            /**
             * 급식일자
             */
            day: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_YMD),
            /**
             * 시작일자
             */
            from: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_FROM_YMD),
            /**
             * 종료일자
             */
            to: NeisDateUtil.parseYYYYMMDD(rawData.MLSV_TO_YMD)
        };

        /**
         * 급식 인원수
         */
        this.memberCount = rawData.MLSV_FGR;

        /** 
         * 요리명 
         */
        this.menu = rawData.DDISH_NM.replace(/\<br\/\>/g, '\n');

        /**
         * 원산지 정보
         */
        this.origins = rawData.ORPLC_INFO.replace(/\<br\/\>/g, '\n');

        /**
         * 칼로리 정보
         */
        this.calorie = rawData.CAL_INFO;

        /**
         * 영양 정보
         */
        this.nutritions = rawData.NTR_INFO.replace(/\<br\/\>/g, '\n');
    }
}