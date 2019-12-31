var context;
var canvas;
var circles:Circle[] = [];

const radius:number = 2;
const speed:number = 0.44;
const NUM_CIRCLES:number = 1200; // The number of circles at the start
const REPLACE:boolean = true; // As circles die, new circles are brought into being
const NUM_CIRCLES_REPLACE = 200; // The population is 

const GRAY_SCALE:boolean = false;
const CHANGE_COLOR_ON_BOUNCE:boolean = false;
const PASTELS:boolean = true;

const TRAILS:boolean = false;

const BIGGEST_WINS:boolean = true; // When circles collide, does the biggest win (and littlest die) or does the oldest circle win?
const GROWTH_FACTOR:number = 3;
const CIRCLE_BORDER:number = 2;
const ACCELERATION:number = 0;//0.001;//0.001;
const SLOWDOWN:number = 1;//0.92;
const MAX_RADIUS:number = 100;
const KEEP_LOOT:boolean = true;

var player:Circle;
var startTime:Date;

class Circle {
	constructor(){

	}
	x:number;
	y:number;
	speed:number;
	direction:number;
	color:string;
	radius:number;
	isPlayer:boolean;
}

function randomColor() {
	var chars = '0123456789ABCDEF';
	var color = '#';
	if (!GRAY_SCALE) {
		if (PASTELS) {
			for (var i = 0; i < 6; i++) {
				color += chars[Math.floor(Math.random() * 8) + 8];
			}
			color = color += '80';
		} else {
			for (var i = 0; i < 6; i++) {
				color += chars[Math.floor(Math.random() * 16)];
			}
			color = color += '80';
		}
	} else {
		// shades of gray
		var col = chars[Math.floor(Math.random() * 16)];
		color = '#' + (col.repeat(3));
	}
	return color;
}

function draw() {
	if (!TRAILS) context.clearRect(0, 0, canvas.width, canvas.height);

	var index = 0;
	circles.forEach(function (circle:Circle) {
			circle.x = circle.x + circle.speed * Math.cos(circle.direction);
			circle.y = circle.y + circle.speed * Math.sin(circle.direction);
			bounce(circle);
			detectCollision(circle, circles, index);
			if (circle.color != '#000000') {
			    drawCircle(circle, circle.color);//circle.x, circle.y, circle.radius, 2, circle.color, circle.color);
			} else {
				drawCircle(circle, '#FFF');//circle.x, circle.y, circle.radius, 2, "#FFF", circle.color);
			}
			index++;
	});
	//remove hit circles
	let playerHit:boolean = false;
	let playerRadius:number;
	for(var i = circles.length-1; i >= 0; i--) {
		if (circles[i] != undefined && circles[i].color == '#000000') {
			if (circles[i].isPlayer) {
				playerHit = true;
				playerRadius = player.radius;
			}
			circles.splice(i,1);
		}
	}
	//replace missing circles
	if (REPLACE) {
		var TO_ADD = NUM_CIRCLES_REPLACE - circles.length;
		for (var i = 0; i < TO_ADD; i++) {
			circles.push(newCircle());
		}
		if (playerHit){
			var newPlayer = createPlayer();
			if (KEEP_LOOT){
				newPlayer.radius = playerRadius;
			}
			circles.push(newPlayer);
		}
	}
	drawElapsed();
	requestAnimationFrame(draw);
}

function detectCollision(circle, circles, index) {
	if (circle.color == "#000000") return;
	if (index+1 >= circles.length) return;
  
	for(var i = index+1; i < circles.length; i++) {
		
		var consider = circles[i];
		if (consider.color == "#000000") continue;
		var dx = Math.abs(circle.x - consider.x);
		if (dx > (circle.radius + consider.radius)) continue;
		var dy = Math.abs(circle.y - consider.y);
		if (dy > circle.radius + consider.radius) continue;
		if (Math.sqrt((dx * dx)+(dy*dy)) < circle.radius + consider.radius) 
		{
			if (BIGGEST_WINS) {
				if (circle.radius > consider.radius) {
					circle.radius += (consider.radius/GROWTH_FACTOR);
					consider.color = "#000000";
					circle.speed *= SLOWDOWN;
					if (circle.radius >= MAX_RADIUS) { 
						if (circle.isPlayer) {
							force_reset();
							return;
						} else {
							circle.color = "#000000";
						}
					}
				} else {
					consider.radius += (circle.radius/GROWTH_FACTOR);
					circle.color = "#000000";
					consider.speed *= SLOWDOWN;
					if (consider.radius >= MAX_RADIUS) {
						if (consider.isPlayer) {
							force_reset();
							return;
						} else {
							consider.color = "#000000";
						}
					}
				}
			} else {
				//oldest wins.
				circle.radius += (consider.radius/GROWTH_FACTOR);
				consider.color = "#000000";
				circle.speed *= SLOWDOWN;
			}
			//speed += ACCELERATION;
		}
	}
}
function bounce(circle) {
		if (circle.x - circle.radius < 0 ||
				circle.x + circle.radius > canvas.width) {
				// vertical wall
				circle.direction = (circle.direction * -1) - (Math.PI);
				if (CHANGE_COLOR_ON_BOUNCE) {
					circle.color = randomColor();
				}
		}
		if (circle.y - circle.radius < 0 ||
				circle.y + circle.radius > canvas.height) {
				// horizontal wall
				circle.direction = circle.direction * -1;
				if (CHANGE_COLOR_ON_BOUNCE) {
					circle.color = randomColor();
				}
		}
		// mod
		circle.direction = circle.direction % (2 * Math.PI);
}

function drawCircle(circle:Circle, border) {
	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
	context.strokeStyle = border;
	context.fillStyle = circle.color;
	context.lineWidth = CIRCLE_BORDER;
	context.closePath();
	context.fill();
	context.stroke();
}


function newCircle():Circle {
	var x = radius + (Math.random() * (canvas.width - (2 * radius)));
	var y = radius + (Math.random() * (canvas.height - (2 * radius)));
	var color = randomColor();
	var direction = Math.random() * 2.0 * Math.PI;
	return { x: x, y: y, color: color, direction: direction, radius:radius, speed:speed, isPlayer:false };
}

function createPlayer() {
	player = newCircle();
	player.color = "#FF0000FF";
	player.isPlayer = true;
	player.radius *= 2;
	return player;
}

function force_reset() {
	start();
}


function drawElapsed() {
	const endTime = new Date();
	var seconds = (endTime.getTime() - startTime.getTime()) / 1000;
	$id('elapsed').innerHTML = seconds.toFixed(1) + "s";
}
let record:number = 90;
function start(){
	if (startTime != null){
		console.log("Check old time");
		const endTime = new Date();
		var seconds = (endTime.getTime() - startTime.getTime()) / 1000;
		if (record == -1 || seconds < record) {
			record = seconds;
		}
		$id('best').innerHTML = "best:" + record.toFixed(0) + "s";
	}
	startTime = new Date();
	circles = [];
	for (var i = 0; i < NUM_CIRCLES; i++) {
		circles.push(newCircle());
	}
	circles.push(createPlayer());
}

document.addEventListener("DOMContentLoaded", function () {
	canvas = document.getElementById("html-canvas");
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	context = canvas.getContext("2d");
	start();
	draw();
}, false);

function up() {
	if (player != null) {
		player.speed = Math.min(player.speed+0.1, speed*2);
	}
}

function down() {
	if (player != null) {
		player.speed = Math.max(player.speed-0.1, 0);
	}
}

function left() {
	if (player != null) {
		player.direction -= 0.2;
	}
}

function right() {
	if (player != null) {
		player.direction += 0.2;
	}
}

document.onkeydown = function(e):void {
	console.log(e.keyCode);
	switch(e.keyCode) {
		case 37:
			left();
			break;
		case 38:
			up();
			break;
		case 39:
			right();
			break;
		case 40:
			down();
			break;
	}
};

document.onkeypress = function(e):void {
	switch (e.key) {
	  case "1":
		  if (player != null) {
			  player.speed = Math.min(player.speed+0.1, speed*2);
		  }
		break;
	  case "2":
			if (player != null) {
				player.speed = Math.max(player.speed-0.1, 0);//speed * -2);
			}
		break;
	}

	console.log(e.key);
}

function $id(id: string): HTMLElement {
	return document.getElementById(id);
}
  