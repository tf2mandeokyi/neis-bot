const NeisDateUtil = require('../../util/dateutil');

/**
 * @typedef {Object} RawSubjectTime
 * 
 * @property {string} ATPT_OFCDC_SC_CODE 시도교육청코드
 * @property {string} ATPT_OFCDC_SC_NM 시도교육청명
 * @property {string} SD_SCHUL_CODE 표준학교코드
 * @property {string} SCHUL_NM 학교명
 * @property {string} AY 학년도
 * @property {string} SEM 학기
 * @property {string} ALL_TI_YMD 시간표일자
 * @property {string} DGHT_CRSE_SC_NM 주야과정명
 * @property {string} ORD_SC_NM 계열명
 * @property {string} DDDEP_NM 학과명
 * @property {string} GRADE 학년
 * @property {string} CLRM_NM 강의실명
 * @property {string} CLASS_NM 반명
 * @property {string} PERIO 교시
 * @property {string} ITRT_CNTNT 수업내용
 * @property {string} LOAD_DTM 적재일시
 */

module.exports.SubjectTime = class {
    /**
     * @param {RawSubjectTime} rawData 
     */
    constructor(rawData) {
        /** 
         * 학교 
         */
        this.school = {
            /** 시도교육청 */
            eduOffice: {
                code: rawData.ATPT_OFCDC_SC_CODE,
                name: rawData.ATPT_OFCDC_SC_NM
            },
            /** 표준학교코드 */
            code: rawData.SD_SCHUL_CODE,
            /** 이름 */
            name: rawData.SCHUL_NM
        };

        /**
         * 시간표 일자
         */
        this.date = NeisDateUtil.parseYYYYMMDD(rawData.ALL_TI_YMD);

        /** 
         * 교시 
         */
        this.period = rawData.PERIO;

        /** 
         * 수업 내용 
         */
        this.subject = rawData.ITRT_CNTNT;

        /** 
         * 반 
         */
        this.classProperty = {
            /** 학년도 */
            year: rawData.AY,
            /** 학기 */
            semester: rawData.SEM,
            /** 주야 과정명 */
            daynight: rawData.DGHT_CRSE_SC_NM,
            /** 계열명 */
            order: rawData.ORD_SC_NM,
            /** 학과명 */
            department: rawData.DDDEP_NM,
            /** 학년 */
            grade: rawData.GRADE,
            /** 강의실명 */
            classroom: rawData.CLRM_NM,
            /** 반명 */
            class_name: rawData.CLASS_NM
        }

        /**
         * 적재일시
         */
        this.loadDate = NeisDateUtil.parseYYYYMMDDHHMMSS(rawData.LOAD_DTM);
    }
}