let ITEMINFO = null;
let ITEMS = null;
let ITEMSOURCES = null;

const currentday = Math.floor(Date.now() / 86400000);

let SELITEM = null;

function updateButtons() {
	const iteminput = document.getElementById("iteminput");
	const itemcontainer = document.getElementById("itemcontainer");

	const userinput = iteminput.value.toLowerCase();

	itemcontainer.innerHTML = "";

	if (userinput == "") {
		return;
	}

	let already = [];

	const guesses = document.getElementById("guesses");

	for (let i = 0; i < guesses.children.length; i++) {
		let tr = guesses.children[i];
		already.push(tr.children[0].children[0].title);
	}

	for (let i = 0; i < ITEMS.length; i++) {
		if (
			ITEMS[i].name.toLowerCase().includes(userinput) &&
			!already.includes(ITEMS[i].name)
		) {
			const btn = document.createElement("button");

			already.push(ITEMS[i].name);

			btn.innerHTML = `<img src="${ITEMS[i].imgs[0]}">${ITEMS[i].name}`;
			btn.addEventListener("click", () => {
				selectItem(ITEMS[i]);
			});

			itemcontainer.appendChild(btn);
		}
	}
}

const PLAT_COIN =
	"https://terraria.wiki.gg/images/f/f8/Platinum_Coin.gif?9800de";
const GOLD_COIN = "https://terraria.wiki.gg/images/b/b0/Gold_Coin.gif?ddc99f";
const SILVER_COIN =
	"https://terraria.wiki.gg/images/c/cf/Silver_Coin.gif?5d8a4d";
const COPPER_COIN =
	"https://terraria.wiki.gg/images/8/8f/Copper_Coin.gif?d43b4c";

function parseCoinValue(value) {
	let plat = 0; // 100 gold -> 1000000 copper
	let gold = 0; // 100 silver -> 10000 copper
	let silver = 0; // 100 copper

	while (value >= 1000000) {
		plat++;
		value = value - 1000000;
	}

	while (value >= 10000) {
		gold++;
		value = value - 10000;
	}

	while (value >= 100) {
		silver++;
		value = value - 100;
	}

	let ret = "";

	if (plat > 0) {
		ret += `${plat}<img src="${PLAT_COIN}">`;
	}

	if (gold > 0) {
		ret += `${gold}<img src="${GOLD_COIN}">`;
	}

	if (silver > 0) {
		ret += `${silver}<img src="${SILVER_COIN}">`;
	}

	if (value > 0 || ret == "") {
		ret += `${value}<img src="${COPPER_COIN}">`;
	}

	return ret;
}

const RARITIES = {
	Gray: -1,
	White: 0,
	Blue: 1,
	Green: 2,
	Orange: 3,
	LightRed: 4,
	Pink: 5,
	LightPurple: 6,
	Lime: 7,
	Yellow: 8,
	Cyan: 9,
	Red: 10,
	Purple: 11,
	Rainbow: 12,
	FieryRed: 13,
	Amber: 14,
};

function laterRelease(rel1, rel2) {
	let n1 = "";
	let n2 = "";

	for (let i = 0; i < rel1.length; i++) {
		if (i > 7) {
			n1 += rel1[i];
		}
	}
	for (let i = 0; i < rel2.length; i++) {
		if (i > 7) {
			n2 += rel2[i];
		}
	}

	if (n2 == "Release") return true;
	if (n1 == "Release") return false;

	let s1 = n1.split(".");
	let s2 = n2.split(".");

	let l = Math.min(s1.length, s2.length);

	for (let i = 0; i < l; i++) {
		if (s1[i] > s2[i]) {
			return true;
		} else {
			if (s2[i] > s1[i]) {
				return false;
			}
		}
	}

	return s1.length > s2.length;
}

function updateGuess(what, where) {
	for (let i = 0; i < what.length; i++) {
		let n = what[i];

		let div = document.createElement("td");
		div.innerHTML = n.what;

		if (n.class != "") {
			div.classList.add(n.class);
		}

		div.style.opacity = 0;
		div.style.animationDelay = `${i / 2}s`;

		setTimeout(() => {
			div.style.opacity = 1;
		}, i * 500);

		where.appendChild(div);
	}
}

function selectItem(item) {
	const iteminput = document.getElementById("iteminput");
	iteminput.value = "";
	iteminput.focus();

	updateButtons();

	document.getElementById("guessesnum").hidden = false;

	const guesses = document.getElementById("guesses");

	num = guesses.children.length + 1;

	const tip = document.getElementById("tooltip");
	let extra = 0;
	let complete = true;
	if (SELITEM.tooltip != "No tooltip for this item") {
		let p = "";
		for (let i = 0; i < SELITEM.tooltip.length; i++) {
			if (i < num * 2 + extra) {
				p += SELITEM.tooltip[i];
				if (SELITEM.tooltip[i] == " ") {
					extra++;
				}
			} else {
				if (i == num * 2 + extra) {
					p += "</em>";
				}
				p += "-";
				complete = false;
			}
		}
		tip.innerHTML = `Item tooltip: <em>${p}`;
	}

	if (complete && SELITEM.tooltip != "No tooltip for this item") {
		giveUp();
	}

	let tr = document.createElement("tr");

	let toadd = [];

	toadd.push({
		class: "",
		what: `<abbr title="${item.name}"><img src="${item.imgs[0]}" alt="${item.name}"></abbr>`,
	});

	let cls = "";
	let ins = "";
	if (item.stack == SELITEM.stack) {
		cls = "correct";
		ins = "";
	} else {
		cls = "wrong";
		if (item.stack > SELITEM.stack) {
			ins = " < ";
		} else {
			ins = " > ";
		}
	}
	toadd.push({
		class: cls,
		what: `${ins}${item.stack}`,
	});

	let tp = "";
	let found = 0;

	for (let i = 0; i < item.types.length; i++) {
		if (i > 0) {
			tp += ", ";
		}
		tp += item.types[i];

		if (SELITEM.types.includes(item.types[i])) {
			found++;
		}
	}

	cls = "";
	if (found == item.types.length && found == SELITEM.types.length) {
		cls = "correct";
	} else {
		if (found == 0) {
			cls = "wrong";
		} else {
			cls = "partial";
		}
	}
	toadd.push({
		class: cls,
		what: `${tp}`,
	});

	if (RARITIES[item.rarity] == RARITIES[SELITEM.rarity]) {
		cls = "correct";
		ins = "";
	} else {
		cls = "wrong";
		if (RARITIES[item.rarity] > RARITIES[SELITEM.rarity]) {
			ins = " < ";
		} else {
			ins = " > ";
		}
	}
	toadd.push({
		class: cls,
		what: `${ins}<span class="${item.rarity} textoutline">${item.rarity}</span>`,
	});

	if (item.price == SELITEM.price) {
		cls = "correct";
		ins = "";
	} else {
		cls = "wrong";
		if (item.price > SELITEM.price) {
			ins = " < ";
		} else {
			ins = " > ";
		}
	}
	toadd.push({
		class: cls,
		what: `${ins}${parseCoinValue(item.price)}`,
	});

	if (item.research == SELITEM.research) {
		cls = "correct";
		ins = "";
	} else {
		cls = "wrong";
		if (item.research > SELITEM.research) {
			ins = " < ";
		} else {
			ins = " > ";
		}
	}
	toadd.push({
		class: cls,
		what: `${ins}${item.research}`,
	});

	if (item.source == SELITEM.source) {
		cls = "correct";
	} else {
		cls = "wrong";
	}
	toadd.push({
		class: cls,
		what: `${ITEMSOURCES[item.source]}`,
	});

	updateGuess(toadd, tr);

	guesses.appendChild(tr);

	if (SELITEM.name == item.name) {
		document.getElementById("win").hidden = false;
		document.getElementById("giveup").hidden = true;
		document.getElementById("tooltip").hidden = true;
		document.getElementById("iteminput").hidden = true;
		document.getElementById("random").hidden = false;
		document.getElementById("randomhard").hidden = false;

		if (num > 1) {
			document.getElementById("winnum").innerHTML = `You won in ${num} guesses`;
		} else {
			document.getElementById("winnum").innerHTML =
				"You won in 1 guess, impressive!";
		}

		document.getElementById("winitem").innerHTML =
			`<abbr class="itemdisplay" title="${SELITEM.tooltip}"><img src="${SELITEM.imgs[0]}">${SELITEM.name}</abbr>`;
	}
}

function parseTime(value) {
	ins = "";
	if (value < 0) {
		value = -value;
		ins = "-";
	}

	let hours = 0;
	let minutes = 0;

	while (value >= 3600) {
		hours++;
		value = value - 3600;
	}
	while (value >= 60) {
		minutes++;
		value = value - 60;
	}

	if (hours < 10) hours = `0${hours}`;
	if (minutes < 10) minutes = `0${minutes}`;
	if (value < 10) value = `0${value}`;

	return `${ins}${hours}:${minutes}:${value}`;
}

function updateTimer() {
	const timer = document.getElementById("timer");

	const now = Date.now();
	const tomorrow = (currentday + 1) * 86400000;

	const diff = -Math.floor((now - tomorrow) / 1000);

	timer.innerHTML = `Next daily item in ${parseTime(diff)}`;

	if (diff <= 0) {
		timer.innerHTML += " (refresh to update)";
	}

	setTimeout(updateTimer, 1);
}

function selectFirst(event, input) {
	var code = event.keyCode ? event.keyCode : event.which;
	if (code == 13) {
		const ins = document.getElementById("itemcontainer");
		ins.children[0].click();
	}
}

function getItemForDay(day) {
	return ITEMS[(day * 652654) % ITEMS.length];
}

let activesources = {};

async function main() {
	let given = await fetch("/items");
	ITEMINFO = await given.json();

	ITEMS = ITEMINFO.done;
	ITEMSOURCES = ITEMINFO.sources;

	SELITEM = getItemForDay(currentday);

	let sources = Object.keys(ITEMSOURCES);
	const toggles = document.getElementById("sources");
	for (let i = 0; i < sources.length; i++) {
		toggles.innerHTML += `<input type="checkbox" checked onclick="activesources['${sources[i]}'] = !activesources['${sources[i]}'];" id="${sources[i]}">`;
		toggles.innerHTML += `<label for="${sources[i]}">${ITEMSOURCES[sources[i]]}</label><br>`;
		activesources[sources[i]] = true;
	}

	const tip = document.getElementById("tooltip");
	if (SELITEM.tooltip == "No tooltip for this item") {
		tip.innerHTML = "No tooltip for this item";
		document.getElementById("what").innerHTML += " (hard)";
	} else {
		tip.innerHTML = "Item tooltip: ";
		for (let i = 0; i < SELITEM.tooltip.length; i++) {
			tip.innerHTML += "-";
		}
	}

	YESTERDAY = getItemForDay(currentday - 1);
	document.getElementById("yesterdayitem").innerHTML =
		`<abbr class="itemdisplay" title="${YESTERDAY.tooltip}"><img src="${YESTERDAY.imgs[0]}">${YESTERDAY.name}</abbr>`;

	const itemcontainer = document.getElementById("itemcontainer");
	const iteminput = document.getElementById("iteminput");

	iteminput.focus();

	iteminput.addEventListener("input", () => {
		updateButtons();
	});

	iteminput.addEventListener("keypress", selectFirst);

	updateTimer();
}

function randomItem() {
	let tips = [];
	for (let i = 0; i < ITEMS.length; i++) {
		if (
			ITEMS[i].tooltip != "No tooltip for this item" &&
			activesources[ITEMS[i].source]
		) {
			tips.push(ITEMS[i]);
		}
	}

	if (tips.length == 0) {
		return;
	}

	const iteminput = document.getElementById("iteminput");

	iteminput.focus();

	SELITEM = tips[Math.floor(Math.random() * tips.length)];
	const tip = document.getElementById("tooltip");
	tip.innerHTML = "Item tooltip: ";
	for (let i = 0; i < SELITEM.tooltip.length; i++) {
		tip.innerHTML += "-";
	}

	document.getElementById("guessesnum").hidden = true;
	document.getElementById("guesses").innerHTML = "";

	document.getElementById("win").hidden = true;
	document.getElementById("iteminput").hidden = false;

	document.getElementById("what").innerHTML = "Guessing a random item";

	document.getElementById("giveup").hidden = false;
	document.getElementById("random").hidden = true;
	document.getElementById("randomhard").hidden = true;
	document.getElementById("tooltip").hidden = false;
}

function randomItemHard() {
	const iteminput = document.getElementById("iteminput");

	iteminput.focus();

	let tips = [];
	for (let i = 0; i < ITEMS.length; i++) {
		if (
			ITEMS[i].tooltip == "No tooltip for this item" &&
			activesources[ITEMS[i].source]
		) {
			tips.push(ITEMS[i]);
		}
	}

	if (tips.length == 0) {
		return;
	}

	SELITEM = tips[Math.floor(Math.random() * tips.length)];
	const tip = document.getElementById("tooltip");
	tip.innerHTML = "No tooltip for this item";

	document.getElementById("guessesnum").hidden = true;
	document.getElementById("guesses").innerHTML = "";

	document.getElementById("win").hidden = true;
	document.getElementById("iteminput").hidden = false;

	document.getElementById("what").innerHTML = "Guessing a random item";

	document.getElementById("giveup").hidden = false;
	document.getElementById("random").hidden = true;
	document.getElementById("randomhard").hidden = true;
	document.getElementById("tooltip").hidden = false;
}

function giveUp() {
	document.getElementById("win").hidden = false;

	document.getElementById("winnum").innerHTML = "The item was";

	document.getElementById("winitem").innerHTML =
		`<abbr class="itemdisplay" title="${SELITEM.tooltip}"><img src="${SELITEM.imgs[0]}">${SELITEM.name}</abbr>`;

	document.getElementById("iteminput").hidden = true;
	document.getElementById("giveup").hidden = true;
	document.getElementById("tooltip").hidden = true;
	document.getElementById("random").hidden = false;
	document.getElementById("randomhard").hidden = false;
}
