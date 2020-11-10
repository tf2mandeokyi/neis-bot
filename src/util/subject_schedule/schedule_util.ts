export function getTablePeriodMinMax(table: [Date, {[x: number]: string}][]) {

    let earliestPeriod = +Infinity, latestPeriod = -Infinity;

    table.map(([_, dayPeriods]) => {

        let min = +Infinity, max = -Infinity;

        Object.entries(dayPeriods).forEach(([index, subject]) => {
            if(!subject) return;
            if(parseInt(index) < min) min = parseInt(index) - 0;
            if(parseInt(index) > max) max = parseInt(index) - 0;
        })
        
        return { min, max };

    }).forEach(({min, max}) => {
        if(earliestPeriod > min) earliestPeriod = min;
        if(latestPeriod < max) latestPeriod = max;
    })

    return {min: earliestPeriod, max: latestPeriod, delta: latestPeriod - earliestPeriod + 1};
}