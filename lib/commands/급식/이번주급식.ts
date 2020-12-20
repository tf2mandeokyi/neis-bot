import { Command } from "../../commands";
import n주후급식 from "./n주후급식";

export default new Command({
    regex: /^이번주급식$/,
    argsLength: 1,
    category: '급식',
    usages: [{usage: '이번주급식 <학교>', description: '이번주의 학교 급식을 출력합니다.'}],
    execute: async (message, args, neisClient) => {
        return n주후급식.execute(message, args, neisClient, '0주후급식');
    }
})