const NeisDateUtil = require('../util/dateutil');

/**
 * @typedef {Object} RawSchoolInfo
 * 
 * @property {string} ATPT_OFCDC_SC_CODE 시도교육청코드
 * @property {string} ATPT_OFCDC_SC_NM 시도교육청명
 * @property {string} SD_SCHUL_CODE 표준학교코드
 * @property {string} SCHUL_NM 학교명
 * @property {string} ENG_SCHUL_NM 영문학교명
 * @property {string} SCHUL_KND_SC_NM 학교종류명
 * @property {string} LCTN_SC_NM 소재지명
 * @property {string} JU_ORG_NM 관할조직명
 * @property {string} FOND_SC_NM 설립명
 * @property {string} ORG_RDNZC 도로명우편번호
 * @property {string} ORG_RDNMA 도로명주소
 * @property {string} ORG_RDNDA 도로명상세주소
 * @property {string} ORG_TELNO 전화번호
 * @property {string} HMPG_ADRES 홈페이지주소
 * @property {'남'|'여'|'남여공학'} COEDU_SC_NM 남녀공학구분명
 * @property {string} ORG_FAXNO 팩스번호
 * @property {string} HS_SC_NM 고등학교구분명
 * @property {'Y'|'N'} INDST_SPECL_CCCCL_EXST_YN 산업체특별학급존재여부
 * @property {'일반계'|'전문계'|'해당없음'} HS_GNRL_BUSNS_SC_NM 고등학교일반실업구분명
 * @property {string} SPCLY_PURPS_HS_ORD_NM 특수목적고등학교계열명
 * @property {'전기'|'후기'|'전후기'} ENE_BFE_SEHF_SC_NM 입시전후기구분명
 * @property {'주간'|'야간'|'주야간'} DGHT_SC_NM 주야구분명
 * @property {string} FOND_YMD 설립일자
 * @property {string} FOAS_MEMRD 개교기념일
 * @property {string} LOAD_DTM 적재일시
*/


module.exports.School = class {
    /**
     * @param {RawSchoolInfo} rawData
     */
    constructor(rawData) {
        /** 
         * 시도교육청 
         * */
        this.eduOffice = {
            code: rawData.ATPT_OFCDC_SC_CODE,
            name: rawData.ATPT_OFCDC_SC_NM
        }

        /** 
         * 표준학교코드 
         * */
        this.code = rawData.SD_SCHUL_CODE;

        /** 
         * 이름 
         * */
        this.name = rawData.SCHUL_NM;

        /** 
         * 영문명 
         * */
        this.engName = rawData.ENG_SCHUL_NM;

        /** 
         * 종류 
         * */
        this.type = rawData.SCHUL_KND_SC_NM;

        /** 
         * 소재지 이름 
         * */
        this.location = rawData.LCTN_SC_NM;

        /** 
         * 관할조직명 
         * */
        this.jurisdiction = rawData.JU_ORG_NM;

        /** 
         * 설립명 
         * */
        this.foundation = {
            name: rawData.FOND_SC_NM,
            date: NeisDateUtil.parseYYYYMMDD(rawData.FOND_YMD)
        }

        /** 
         * 도로명 
         * */
        this.roadName = {
            zipCode: rawData.ORG_RDNZC,
            address: rawData.ORG_RDNMA,
            detailedAddr: rawData.ORG_RDNDA
        };

        /** 
         * 전화번호 
         * */
        this.telephone = rawData.ORG_TELNO;

        /** 
         * 홈페이지 주소 
         * */
        this.homepage = rawData.HMPG_ADRES;

        /** 
         * 남녀공학구분명 
         * */
        this.coeducation = rawData.COEDU_SC_NM;

        /** 
         * 팩스번호 
         * */
        this.fax = rawData.ORG_FAXNO;

        /** 
         * 고등학교구분명 
         * */
        this.highschool = rawData.HS_SC_NM;

        /** 
         * 산업체 특별 학급 존재 여부 
         * */
        this.hasIndustrySpecialClass = rawData.INDST_SPECL_CCCCL_EXST_YN === 'Y' ? true : false;

        /** 
         * 고등학교 일반 실업 구분명 
         * */
        this.highSchoolGeneralBusinessName = rawData.HS_GNRL_BUSNS_SC_NM;

        /** 
         * 특수목적 고등학교 계열명 
         * */
        this.specialPurposeHighSchoolOrderName = rawData.SPCLY_PURPS_HS_ORD_NM;

        /** 
         * 입시 전후기 구분명 
         * */
        this.beforeAfterEntranceExaminationName = rawData.ENE_BFE_SEHF_SC_NM;

        /** 
         * 주야 구분명 
         * */
        this.daynight = rawData.DGHT_SC_NM;

        /**
         * 개교 기념일
         */
        this.openingDay = NeisDateUtil.parseYYYYMMDD(rawData.FOAS_MEMRD);

        /**
         * 적재일시
         */
        this.loadDate = NeisDateUtil.parseYYYYMMDDHHMMSS(rawData.LOAD_DTM);
    }
}