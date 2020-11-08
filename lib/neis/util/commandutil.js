const Commands = require('../../commands');

module.exports = {

    /**
     * @param {string} message 
     * @param {string} prefix 
     */
    parse: function(message, prefix) {

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

}