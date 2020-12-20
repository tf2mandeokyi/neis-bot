export function parseYYYYMMDD(string: string | number) : Date {
    if(typeof string === 'number') string =  string + '';
    if(typeof string === 'string')
        return new Date(`${string.slice(0, 4)}-${string.slice(4, 6)}-${string.slice(6, 8)}`);
}



export function parseYYYYMMDDHHMMSS(string: string | number) : Date{
    if(typeof string === 'number') string = string + '';
    if(typeof string === 'string')
        return new Date(`${string.slice(0, 4)}-${string.slice(4, 6)}-${string.slice(6, 8)} ` +
                        `${string.slice(8, 10)}:${string.slice(10, 12)}:${string.slice(12, 14)}`);
}



export function toYYYYMMDD(date: Date) : string {
    return `${date.getFullYear()}${(date.getMonth() + 1 + '').padStart(2, '0')}${(date.getDate() + '').padStart(2, '0')}`
}



export function getWeekEdge(date: Date) {
    let fromDate = new Date(date), toDate = new Date(date);
    fromDate.setDate(date.getDate() - date.getDay());
    toDate.setDate(date.getDate() + 6 - date.getDay());
    return {from: fromDate, to: toDate};
}



export const weekdays = ['일', '월', '화', '수', '목', '금', '토']



export function formatDate(date: Date) : string {
    return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`;
}