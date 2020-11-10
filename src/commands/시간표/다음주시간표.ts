import { Command } from "..";
import n주후시간표 from "./n주후시간표";

export default new Command({
    regex: /^다음주시간표$/,
    argsLength: 4,
    category: '시간표',
    usages: [{usage: '다음주시간표 <학교> <학년도> <학년> <반>', description: '다음주의 시간표를 출력합니다.'}],
    execute: (message, args, neisClient) => {
        return n주후시간표.execute(message, args, neisClient, '1주후시간표');
    }
})