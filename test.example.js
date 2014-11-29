var Quest = {
	_internal: {
		attributes: {},			// e.g. "something.look"="Some description", "object.weight"=100
		scripts: {},			// e.g. "something.look" = function() {...}
		objects: [],
		commands: [],
		exits: [],
		regexes: {},
	},
	HandleCommand: function(input) {
		Quest._internal.commands.forEach(function(cmd) {
			Quest._internal.regexes[cmd].patterns.forEach(function(pattern) {
				var match = pattern.exec(input);
				if (match) {
					var args = match.slice(0);
					args.shift();
					Quest._internal.scripts[cmd + ".action"].apply(this, args);
				}
			});
		});
	},
}

// Quest script commmands =====================================================

function get(arg1, arg2) {
	var attribute = arg1;
	if (arg2) {
		attribute = arg1 + "." + arg2;
	}
	return Quest._internal.attributes[attribute];
}

function set(arg1, arg2, arg3) {
	var attribute = arg1;
	var value = arg2;
	if (arg3) {
		attribute = arg1 + "." + arg2;
		value = arg3;
	}
	Quest._internal.attributes[attribute] = value;
}

function getscript(arg1, arg2) {
	var attribute = arg1;
	if (arg2) {
		attribute = arg1 + "." + arg2;
	}
	return Quest._internal.scripts[attribute];
}

function msg(text) {
	console.log(text);
}

// Quest standard commands, which will come from some Core.yaml ===============

Quest._internal.commands.push("lookat");
Quest._internal.regexes["lookat"] = {
	patterns: [/^look at (.*?)$/, /^x (.*?)$/],
	groups: ["object"]
};
Quest._internal.scripts["lookat.action"] = function(object) {
	var text = get(object, "look");
	if (text) {
		msg(text);
	}
	var script = getscript(object, "look");
	if (script) {
		script();
	}
};

// Converted result of test.yaml ==============================================

set("game.title", "Test Game");

Quest._internal.commands.push("k1");
Quest._internal.regexes["k1"] = {
	patterns: [/^say (.*?)$/],
	groups: ["text"]
};
Quest._internal.scripts["k1.action"] = function(text) {
	msg ("You say '" + text + "', but nobody replies.");
};

Quest._internal.objects.push("lounge");
set("lounge.description", "This is quite a plain lounge with an old beige carpet and peeling wallpaper.");

Quest._internal.exits.push("k2");
set("k2.parent", "lounge");
set("k2.direction", "south");
set("k2.to", "kitchen");

Quest._internal.exits.push("k3");
set("k3.parent", "kitchen");
set("k3.direction", "north");
set("k3.to", "lounge");

Quest._internal.objects.push("TV");
set("TV.parent", "lounge");
set("TV.switchable", true);
set("TV.alt", ["television", "telly"]);
set("TV.look", "The TV is an old model, possibly 20 years old. {if TV.switchedon:It is currently showing an old western.}{else:It is currently switched off.}");
set("TV.watch", "You watch for a few minutes. As your will to live slowly ebbs away, you remember that you’ve always hated watching westerns.");

Quest._internal.objects.push("Bob");
set("Bob.parent", "lounge");
set("Bob.type", "male");
set("Bob.look", "{if Bob.alive:Bob is sitting up, appearing to feel somewhat under the weather.}{else:Bob is lying on the floor, a lot more still than usual.}");
Quest._internal.scripts["Bob.use[defibrillator]"] = function() {
	if (get("Bob.alive")) {
		msg ("Bob is alive so you don't need to use the defibrilltor again.")
	}
	else {
		msg ("Miraculously, the defibrillator lived up to its promise, and Bob is now alive again. He says his head feels kind of fuzzy.");
		set ("Bob.alive", true);
	}
};

Quest._internal.objects.push("table");
set("table.parent", "lounge");
set("table.surface", true);

Quest._internal.objects.push("newspaper");
set("newspaper.parent", "table");
set("newspaper.take", true);
set("newspaper.takemsg", "You fold the newspaper and place it neatly under your arm.");

Quest._internal.objects.push("defibrillator");
set("defibrillator.parent", "lounge");
set("defibrillator.look", "A heart defibrillator can magically revive a dead person, if all those hospital dramas are to be believed.")
set("defibrillator.take", true);

Quest._internal.objects.push("kitchen");
set("kitchen.description", "Just an ordinary kitchen.");

Quest._internal.objects.push("eggs");
set("eggs.parent", "kitchen");
set("eggs.weight", 250);
set("eggs.prefix", "some");
Quest._internal.scripts["eggs.look"] = function() {
	msg ("A box of eggs, weighing " + get("eggs.weight") + " grams.");
};

Quest._internal.commands.push("k4");
set("k4.parent", "kitchen");
Quest._internal.regexes["k4"] = {
	patterns: [/^weigh (.*?)$/],
	groups: ["object"]
};
Quest._internal.scripts["k4.action"] = function(object) {
	msg ("It weighs " + get(object, "weight") + " grams.");
};

Quest._internal.objects.push("fridge");
set("fridge.parent", "kitchen");
set("fridge.container", true);
set("fridge.closed", true);

Quest._internal.objects.push("milk");
set("milk.parent", "fridge");
set("milk.prefix", "some");

Quest._internal.objects.push("cheese");
set("cheese.parent", "fridge");
set("cheese.prefix", "some");

Quest._internal.objects.push("beer");
set("beer.parent", "fridge");
set("beer.prefix", "some");

Quest._internal.objects.push("player");
set("player.parent", "lounge");
set("pov", "player");

// A simple way of running this as a node console app for now ======================

var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.setPrompt("> ");
rl.prompt();

rl.on("line", function(input) {
	if (input == "q") {
		rl.close();
	}
	else {
		Quest.HandleCommand(input);
		rl.prompt();
	}
});