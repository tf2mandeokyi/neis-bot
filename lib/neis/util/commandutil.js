const commands = require('../../commands');

module.exports = {

    /**
     * @param {string} message 
     * @param {string} prefix 
     */
    parse: function(message, prefix) {

        if(message.startsWith(prefix)) {

            let withoutPrefix = message.substring(prefix.length);
            let args = withoutPrefix.split(' ');

            return {
                args: args,
                command: commands[args.shift()]
            };
        }
        else {
            return {
                args: undefined, command: undefined
            }
        }
        
    }

}