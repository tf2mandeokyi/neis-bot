module.exports = {

    /**
     * @param {string | number} string 
     */
    parseYYYYMMDD: function(string) {
        if(typeof string === 'number') string += '';
        if(typeof string === 'string')
            return new Date(`${string.slice(0, 4)}-${string.slice(4, 6)}-${string.slice(6, 8)}`);
    },


    
    /**
     * @param {string | number} string 
     */
    parseYYYYMMDDHHMMSS: function(string) {
        if(typeof string === 'number') string += '';
        if(typeof string === 'string')
            return new Date(`${string.slice(0, 4)}-${string.slice(4, 6)}-${string.slice(6, 8)} ` +
                            `${string.slice(8, 10)}:${string.slice(10, 12)}:${string.slice(12, 14)}`);
    },



    /**
     * @param {Date} date
     */
    toYYYYMMDD: function(date) {
        return `${date.getFullYear()}${(date.getMonth() + 1 + '').padStart(2, 0)}${(date.getDate() + '').padStart(2, 0)}`
    },



    /** @param {Date} date */
    getWeekEdge: function(date) {
        let fromDate = new Date(date), toDate = new Date(date);
        fromDate.setDate(date.getDate() - date.getDay());
        toDate.setDate(date.getDate() + 6 - date.getDay());
        return {from: fromDate, to: toDate};
    },



    weekdays: ['일', '월', '화', '수', '목', '금', '토']
    
}