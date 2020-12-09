//Among Us module for Discord.js 12.5.1
//Aerosfilis - 09/12/2020

const CmdMngr = require("./CommandManager.js");


//List of commands
exports.commands = {
	help:		{cmd: "auhelp",		help: "Open the Among Us related command help."},
	start:		{cmd: "austart",	help: "Start a game of Among Us with the people in the same voice chat as the user."},
	end:		{cmd: "auend",		help: "End the game of Among Us for the voice chat the user is in."},
	meeting:	{cmd: "aumeeting",	help: "Toogle meeting mode on/off (mute/unmute dead players and undeafen/deafen alive players)."},
	dead:		{cmd: "audead",		help: "Set the user as dead (or alive if they were dead)."},
	join:		{cmd: "aujoin",		help: "Join the game of Among Us for the voice chat the user is in, if there is one."},
	leave:		{cmd: "auleave",	help: "Leave the game of Among Us for the voicechat the user is in, if they are in one."}
};


//Preset messages
var msg = {
	not_in_vc:				"You are not in a voice chat.",
	no_game_on_this_server:	"No game of Among Us was started on this server. Start one with `" + CmdMngr.cmdPrefix + exports.commands.help.cmd + "`.",
	not_right_channel:		(DisplayName) => "Thank you " + DisplayName + "!\nBut our game of Among Us is in another voice chat!",
	not_in_game:			"You are not part of the current game of Among Us."
}


//Object to keep track of games and members
//example: guilds = {guildId: {channelID: {inMeeting: bool, members: {memberId: "<alive|dead>"}}})
var guilds = {};


//List commands related to Among Us
exports.commands.help.func = (Message) => Message.channel.send(CmdMngr.cmdhelp("Commands for AmongUs Aeon bot:", exports.commands));


//Starts a game of among us on the server and voice chat the user is in
exports.commands.start.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] != "undefined" && typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return;
	}

	//CORE
	guilds[GuildId] = {};
	guilds[GuildId][ChannelID] = {inMeetting: false, members: {}};
	for (Member of Message.member.voice.channel.members) {
		guilds[GuildId][ChannelID].members[Member[0]] = "alive";
		Member[1].voice.setDeaf(true);
	}
	Message.channel.send("Starting Among Us game for this server.");
};


//Ends game of among us for the server the user is in
exports.commands.end.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] == "undefined") {
		Message.channel.send(msg.no_game_on_this_server);
		return ;
	}
	if (typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return ;
	}

	//CORE
	for (MemberID in guilds[GuildId][ChannelID].members)
	{
		try {
			Message.guild.members.cache.get(MemberID).voice.setDeaf(false);
			Message.guild.members.cache.get(MemberID).voice.setMute(false);
		}
		catch (err) {console.error(err)};
	}
	delete guilds[GuildId];
	Message.channel.send("Ending Among Us game.");
}


//Toggle meeting on/off in the voice chat the user is in
exports.commands.meeting.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] == "undefined") {
		Message.channel.send(msg.no_game_on_this_server);
		return ;
	}
	if (typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return ;
	}

	//CORE
	//Deafen alive players and unmutes dead players when exiting a meeting
	if (guilds[GuildId][ChannelID].inMeeting) {
		for (MemberID in guilds[GuildId][ChannelID].members) {
			try {
				if (guilds[GuildId][ChannelID].members[MemberID] == 'alive')
					Message.guild.members.cache.get(MemberID).voice.setDeaf(true);
				else
					Message.guild.members.cache.get(MemberID).voice.setMute(false);
			}
			catch (err) {console.error(err)};
		}
		guilds[GuildId][ChannelID].inMeeting = false;
		Message.channel.send('Meeting ended!');
	}
	//Undeafen alive players and mutes dead players when entering a meeting
	else {
		for (MemberID in guilds[GuildId][ChannelID].members) {
			try {
				if (guilds[GuildId][ChannelID].members[MemberID] == 'alive')
					Message.guild.members.cache.get(MemberID).voice.setDeaf(false);
				else
					Message.guild.members.cache.get(MemberID).voice.setMute(true);
			}
			catch (err) {console.error(err)};
		}
		guilds[GuildId][ChannelID].inMeeting = true;
		Message.channel.send('Meeting started!');
	}
}


//Set a user as dead to toggle whither they will be muted or deafened during or outside of meetings
exports.commands.dead.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] == "undefined") {
		Message.channel.send(msg.no_game_on_this_server);
		return ;
	}
	if (typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return ;
	}
	if (typeof guilds[GuildId][ChannelID].members[Message.author.id] == "undefined") {
		Message.channel.send(msg.not_in_game);
		return ;
	}

	//CORE
	//Set user as dead if they were alive, as well as undeafening them outside a meeting or mutting them during a meeting
	if (guilds[GuildId][ChannelID].members[Message.author.id] == 'alive') {
		guilds[GuildId][ChannelID].members[Message.author.id] = "dead";
		if (!guilds[GuildId][ChannelID].inMeeting) {
			Message.member.voice.setDeaf(false);
		}
		else {
			Message.member.voice.setMute(true);
		}
		Message.channel.send(Message.member.displayName + " was horribly killed by an Impostor.");
	}
	//Set a user as alive if they were dead, as well as unmutting them during a meeting or deafening them during a meeting
	else {
		guilds[GuildId][ChannelID].members[Message.author.id] = "alive";
		if (guilds[GuildId][ChannelID].inMeeting) {
			Message.member.voice.setMute(false);
		}
		else {
			Message.member.voice.setDeaf(true);
		}
		Message.channel.send(Message.member.displayName + " somehow resurected from the dead.");
	}
}


//Adds a user to a game of among us for the voice channel they are in
exports.commands.join.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] == "undefined") {
		Message.channel.send(msg.no_game_on_this_server);
		return ;
	}
	if (typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return ;
	}
	if (typeof guilds[GuildId][ChannelID].members[Message.author.id] != "undefined") {
		Message.channel.send("You are already in the game.");
		return ;
	}

	//CORE
	guilds[GuildId][ChannelID].members[Message.author.id] = 'alive';
	if (!guilds[GuildId][ChannelID].inMeeting) Message.member.voice.setDeaf(true);
	Message.channel.send("You joined the Game of Among Us in `" + Message.member.voice.channel.name + "`.");
}


//Removes a user from the game of among us for the voice channel they are in
exports.commands.leave.func = (Message) => {
	let GuildId = Message.guild.id;
	let ChannelID = Message.member.voice.channelID;

	//EXCEPTIONS
	if (ChannelID == null) {
		Message.channel.send(msg.not_in_vc);
		return ;
	}
	if (typeof guilds[GuildId] == "undefined") {
		Message.channel.send(msg.no_game_on_this_server);
		return ;
	}
	if (typeof guilds[GuildId][ChannelID] == "undefined") {
		Message.channel.send(msg.not_right_channel(Message.member.displayName));
		return ;
	}
	if (typeof guilds[GuildId][ChannelID].members[Message.member.id] == "undefined") {
		Message.channel.send(msg.not_in_game);
		return ;
	}

	//CORE
	Message.member.voice.setDeaf(false);
	Message.member.voice.setMute(false);
	delete guilds[GuildId][ChannelID].members[Message.member.id];
	Message.channel.send("You left the game of Among Us in `" + Message.member.voice.channel.name + "`.");
	for (Member in guilds[GuildId][ChannelID].members) return ;
	exports.commands.end.func(Message);
}