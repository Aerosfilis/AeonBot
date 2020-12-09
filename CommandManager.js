//Command Manager module for Discord.js 12.5.1
//Aerosfilis - 09/12/2020

//Command prefix to be added
exports.cmdPrefix = "!";

//Creates a striong using the Commands object provided to list all commands with their respective help text
exports.cmdhelp = (Intro, Commands) => {
	let maxLen = 0;
	let helplist = "";

	for (let key in Commands) if (Commands[key].cmd.length > maxLen) maxLen = Commands[key].cmd.length;
	for (let key in Commands) {
		helplist += "\n" + exports.cmdPrefix + Commands[key].cmd;
		for (let i=Commands[key].cmd.length; i<=maxLen; i++) helplist += " ";
		helplist += "--- " + Commands[key].help;
	}

	return Intro + "```" + helplist + "```";
};


//Tries to find the command provided in the list of Commands and retrn either the matching function or null
exports.find_cmd = (cmd, Commands) => {
	let args = cmd.split(' ');
	let regex = new RegExp("^" + args[0] + "$", "i");

	for (key in Commands) {
		if (regex.test(exports.cmdPrefix + Commands[key].cmd)) {
			return Commands[key].func;
		}
	}
	return null;
};