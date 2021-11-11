import * as Commands from '../commands-deprecated';

export function parse(message: string, prefix: string) {

    if(message.startsWith(prefix)) {

        let withoutPrefix = message.substring(prefix.length);
        let args = withoutPrefix.split(' ');
        let command = args.shift();

        return {
            args: args,
            command: Commands.getCommand(command),
            commandString: command
        };
    }
    else {
        return {
            args: undefined, command: undefined, commandString: undefined
        }
    }
    
}