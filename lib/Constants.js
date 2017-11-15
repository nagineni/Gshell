const Constants = {
    Commands: [

        // CMD           ARGS            DESCRIPTION                                     STATE
        { name: "help",  args: "",       desc: "Display this help information",          skip: false },
        { name: "load",  args: "",       desc: "Evaluate JavaScript in real time",       skip: true },
        { name: "eval",  args: "",       desc: "Evaluate JavaScript in real time",       skip: true },
        { name: "run",   args: "FILE",   desc: "Run the JavaScript program in the file", skip: false },
        { name: "stop",  args: "",       desc: "Stop current JavaScript execution",      skip: false },
        { name: "ls",    args: "",       desc: "List all files",                         skip: false },
        { name: "cat",   args: "FILE",   desc: "Print the contents of a file",           skip: false },
        { name: "du",    args: "FILE",   desc: "Estimate file space usage",              skip: false },
        { name: "rm",    args: "FILE",   desc: "Remove file or directory",               skip: false },
        { name: "mv",    args: "F1 F2",  desc: "Move file F1 to destination F2",         skip: false },
        { name: "clear", args: "",       desc: "Clear the terminal screen",              skip: false },
        { name: "reboot", args: "",      desc: "Reboot the device",                      skip: false },
        { name: "cd",     args: "",      desc: "Change directory",                       skip: true },
        { name: "init",   args: "",      desc: "Command to check port is opened or not", skip: true },
        { name: "echo",   args: "on/off", desc: "Echo mode on/off",                      skip: true},
        { name: "npm",    args: "COMMAND",  desc: "Run npm command", skip: true },
    ],
    Settings: {
        prompt: "$gshell>",
        env: process.env
    }
};

module.exports = Constants;
