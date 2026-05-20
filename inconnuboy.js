// inconnuuboy.js
// Uses global commands array so it persists across restarts

if (!global.commands) global.commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    
    // If no pattern, use cmdname
    if (!data.pattern && data.cmdname) data.pattern = data.cmdname;
    
    if (!data.alias) data.alias = [];
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!data.desc) data.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!data.category) data.category = 'misc';
    
    global.commands.push(data);
    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    get commands() { 
        return global.commands; 
    }
};