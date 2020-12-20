import { Command } from "../../commands";
import n주후시간표 from "./n주후시간표";

export default new Command({
    regex: /^이번주시간표$/,
    argsLength: 5,
    category: '시간표',
    usages: [{usage: '이번주시간표 <학교> <학년도> <학기> <학년> <반>', description: '이번주의 시간표를 출력합니다.'}],
    execute: (message, args, neisClient) => {
        return n주후시간표.execute(message, args, neisClient, '0주후시간표');
    }
})