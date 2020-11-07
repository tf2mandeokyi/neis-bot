module.exports = {
    
    
    /**
    * @param {[Date, string[]][]} table
    */
    getTablePeriodMinMax: function(table) {

        let earliestPeriod = +Infinity, latestPeriod = -Infinity;

        table.map(([_, dayPeriods]) => {

            let min = +Infinity, max = -Infinity;

            Object.entries(dayPeriods).map(([index, subject]) => {
                if(!subject) return;
                if(index < min) min = index - 0;
                if(index > max) max = index - 0;
            })
            
            return {min: min, max: max};

        }).forEach(({min, max}) => {
            if(earliestPeriod > min) earliestPeriod = min;
            if(latestPeriod < max) latestPeriod = max;
        })

        return {min: earliestPeriod, max: latestPeriod, delta: latestPeriod - earliestPeriod + 1};
    }


}