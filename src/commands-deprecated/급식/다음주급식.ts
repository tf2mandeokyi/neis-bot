import { Command } from "..";
import n주후급식 from "./n주후급식";

export default new Command({
    regex: /^다음주급식$/,
    argsLength: 1,
    category: '급식',
    usages: [{usage: '다음주급식 <학교>', description: '다음주의 학교 급식을 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return n주후급식.execute(message, args, neisClient, '1주후급식');
    }
})