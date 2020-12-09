//Main javascript for Aeon bot - Discord.js 12.5.1
//Aerosfilis - 2020

const CmdMngr = require('./CommandManager.js');
const AmongUs = require('./AmongUs.js');

const fs = require('fs');

const Discord = require('discord.js');
const Bot = new Discord.Client();


Bot.on('message', (Message) => {
	let cmd_func;

	cmd_func = CmdMngr.find_cmd(Message.content, AmongUs.commands);
	if (cmd_func != null) {
		cmd_func(Message);
		return ;
	}

	switch (Message.content.toUpperCase()) {

		case '!BUTTS':
			Message.channel.send('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ BUTTS!');
			break;

		case '!PAWS':
			Message.channel.send('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ PAWBS!');
			break;
	}
});

fs.readFile('./bot.token', 'ascii', (err, data) => {
	if (err) return console.log(err);
	Bot.login(data.split('\n')[0]);
});