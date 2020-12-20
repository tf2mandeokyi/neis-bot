import * as NeisDateUtil from '../../../../util/dateutil';



export interface RawSchoolInfo {
    /**시도교육청코드*/
    ATPT_OFCDC_SC_CODE: string
    /**시도교육청명*/
    ATPT_OFCDC_SC_NM: string
    /**표준학교코드*/
    SD_SCHUL_CODE: string
    /**학교명*/
    SCHUL_NM: string
    /**영문학교명*/
    ENG_SCHUL_NM: string
    /**학교종류명*/
    SCHUL_KND_SC_NM: string
    /**소재지명*/
    LCTN_SC_NM: string
    /**관할조직명*/
    JU_ORG_NM: string
    /**설립명*/
    FOND_SC_NM: string
    /**도로명우편번호*/
    ORG_RDNZC: string
    /**도로명주소*/
    ORG_RDNMA: string
    /**도로명상세주소*/
    ORG_RDNDA: string
    /**전화번호*/
    ORG_TELNO: string
    /**홈페이지주소*/
    HMPG_ADRES: string
    /**남녀공학구분명*/
    COEDU_SC_NM: '남'|'여'|'남여공학'
    /**팩스번호*/
    ORG_FAXNO: string
    /**고등학교구분명*/
    HS_SC_NM: string
    /**산업체특별학급존재여부*/
    INDST_SPECL_CCCCL_EXST_YN: 'Y'|'N'
    /**고등학교일반실업구분명*/
    HS_GNRL_BUSNS_SC_NM: '일반계'|'전문계'|'해당없음'
    /**특수목적고등학교계열명*/
    SPCLY_PURPS_HS_ORD_NM: string
    /**입시전후기구분명*/
    ENE_BFE_SEHF_SC_NM: '전기'|'후기'|'전후기'
    /**주야구분명*/
    DGHT_SC_NM: '주간'|'야간'|'주야간'
    /**설립일자*/
    FOND_YMD: string
    /**개교기념일*/
    FOAS_MEMRD: string
    /**적재일시*/
    LOAD_DTM: string
}



export class School {

    /** 시도교육청 */
    eduOffice: { code: string, name: string };
    /** 표준학교코드 */
    code: string;
    /** 이름 */
    name: string;
    /** 영문명 */
    engName: string;
    /** 종류 */
    type: string;
    /** 소재지 이름 */
    location: string;
    /** 관할조직명 */
    jurisdiction: string;
    /** 설립명 */
    foundation: { name: string; date: Date; };
    /** 도로명 */
    roadName: { zipCode: string; address: string; detailedAddr: string; };
    /** 전화번호 */
    telephone: string;
    /** 홈페이지 주소 */
    homepage: string;
    /** 남녀공학구분명 */
    coeducation: string;
    /** 팩스번호 */
    fax: string;
    /** 고등학교구분명 */
    highschool: string;
    /** 산업체 특별 학급 존재 여부  */
    hasIndustrySpecialClass: boolean;
    /** 고등학교 일반 실업 구분명 */
    highSchoolGeneralBusinessName: string;
    /** 특수목적 고등학교 계열명 */
    specialPurposeHighSchoolOrderName: string;
    /** 입시 전후기 구분명 */
    beforeAfterEntranceExaminationName: string;
    /** 주야 구분명 */
    daynight: string;
    /** 개교 기념일 */
    openingDay: Date;
    /** 적재일시 */
    loadDate: Date;
    
    constructor(rawData: RawSchoolInfo) {
        this.eduOffice = {
            code: rawData.ATPT_OFCDC_SC_CODE,
            name: rawData.ATPT_OFCDC_SC_NM
        }
        this.code = rawData.SD_SCHUL_CODE;
        this.name = rawData.SCHUL_NM;
        this.engName = rawData.ENG_SCHUL_NM;
        this.type = rawData.SCHUL_KND_SC_NM;
        this.location = rawData.LCTN_SC_NM;
        this.jurisdiction = rawData.JU_ORG_NM;
        this.foundation = {
            name: rawData.FOND_SC_NM,
            date: NeisDateUtil.parseYYYYMMDD(rawData.FOND_YMD)
        }
        this.roadName = {
            zipCode: rawData.ORG_RDNZC,
            address: rawData.ORG_RDNMA,
            detailedAddr: rawData.ORG_RDNDA
        };
        this.telephone = rawData.ORG_TELNO;
        this.homepage = rawData.HMPG_ADRES;
        this.coeducation = rawData.COEDU_SC_NM;
        this.fax = rawData.ORG_FAXNO;
        this.highschool = rawData.HS_SC_NM;
        this.hasIndustrySpecialClass = rawData.INDST_SPECL_CCCCL_EXST_YN === 'Y' ? true : false;
        this.highSchoolGeneralBusinessName = rawData.HS_GNRL_BUSNS_SC_NM;
        this.specialPurposeHighSchoolOrderName = rawData.SPCLY_PURPS_HS_ORD_NM;
        this.beforeAfterEntranceExaminationName = rawData.ENE_BFE_SEHF_SC_NM;
        this.daynight = rawData.DGHT_SC_NM;
        this.openingDay = NeisDateUtil.parseYYYYMMDD(rawData.FOAS_MEMRD);
        this.loadDate = NeisDateUtil.parseYYYYMMDDHHMMSS(rawData.LOAD_DTM);
    }
}