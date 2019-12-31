var context;
var canvas;
var circles = [];
var radius = 2;
var speed = 0.44;
var NUM_CIRCLES = 1200; // The number of circles at the start
var REPLACE = true; // As circles die, new circles are brought into being
var NUM_CIRCLES_REPLACE = 200; // The population is 
var GRAY_SCALE = false;
var CHANGE_COLOR_ON_BOUNCE = false;
var PASTELS = true;
var TRAILS = false;
var BIGGEST_WINS = true; // When circles collide, does the biggest win (and littlest die) or does the oldest circle win?
var GROWTH_FACTOR = 3;
var CIRCLE_BORDER = 2;
var ACCELERATION = 0; //0.001;//0.001;
var SLOWDOWN = 1; //0.92;
var MAX_RADIUS = 100;
var KEEP_LOOT = true;
var player;
var Circle = /** @class */ (function () {
    function Circle() {
    }
    return Circle;
}());
function randomColor() {
    var chars = '0123456789ABCDEF';
    var color = '#';
    if (!GRAY_SCALE) {
        if (PASTELS) {
            for (var i = 0; i < 6; i++) {
                color += chars[Math.floor(Math.random() * 8) + 8];
            }
            color = color += '80';
        }
        else {
            for (var i = 0; i < 6; i++) {
                color += chars[Math.floor(Math.random() * 16)];
            }
            color = color += '80';
        }
    }
    else {
        // shades of gray
        var col = chars[Math.floor(Math.random() * 16)];
        color = '#' + (col.repeat(3));
    }
    return color;
}
function draw() {
    if (!TRAILS)
        context.clearRect(0, 0, canvas.width, canvas.height);
    var index = 0;
    circles.forEach(function (circle) {
        circle.x = circle.x + circle.speed * Math.cos(circle.direction);
        circle.y = circle.y + circle.speed * Math.sin(circle.direction);
        bounce(circle);
        detectCollision(circle, circles, index);
        if (circle.color != '#000000') {
            drawCircle(circle, circle.color); //circle.x, circle.y, circle.radius, 2, circle.color, circle.color);
        }
        else {
            drawCircle(circle, '#FFF'); //circle.x, circle.y, circle.radius, 2, "#FFF", circle.color);
        }
        index++;
    });
    //remove hit circles
    var playerHit = false;
    var playerRadius;
    for (var i = circles.length - 1; i >= 0; i--) {
        if (circles[i] != undefined && circles[i].color == '#000000') {
            if (circles[i].isPlayer) {
                playerHit = true;
                playerRadius = player.radius;
            }
            circles.splice(i, 1);
        }
    }
    //replace missing circles
    if (REPLACE) {
        var TO_ADD = NUM_CIRCLES_REPLACE - circles.length;
        for (var i = 0; i < TO_ADD; i++) {
            circles.push(newCircle());
        }
        if (playerHit) {
            var newPlayer = createPlayer();
            if (KEEP_LOOT) {
                newPlayer.radius = playerRadius;
            }
            circles.push(newPlayer);
        }
    }
    requestAnimationFrame(draw);
}
function detectCollision(circle, circles, index) {
    if (circle.color == "#000000")
        return;
    if (index + 1 >= circles.length)
        return;
    for (var i = index + 1; i < circles.length; i++) {
        var consider = circles[i];
        if (consider.color == "#000000")
            continue;
        var dx = Math.abs(circle.x - consider.x);
        if (dx > (circle.radius + consider.radius))
            continue;
        var dy = Math.abs(circle.y - consider.y);
        if (dy > circle.radius + consider.radius)
            continue;
        if (Math.sqrt((dx * dx) + (dy * dy)) < circle.radius + consider.radius) {
            if (BIGGEST_WINS) {
                if (circle.radius > consider.radius) {
                    circle.radius += (consider.radius / GROWTH_FACTOR);
                    consider.color = "#000000";
                    circle.speed *= SLOWDOWN;
                    if (circle.radius >= MAX_RADIUS) {
                        force_reset();
                        return;
                    }
                }
                else {
                    consider.radius += (circle.radius / GROWTH_FACTOR);
                    circle.color = "#000000";
                    consider.speed *= SLOWDOWN;
                    if (consider.radius >= MAX_RADIUS) {
                        force_reset();
                        return;
                    }
                }
            }
            else {
                //oldest wins.
                circle.radius += (consider.radius / GROWTH_FACTOR);
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
function drawCircle_old(x, y, radius, border, border_color, fill_color) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.strokeStyle = border_color;
    context.fillStyle = fill_color;
    context.lineWidth = border;
    context.closePath();
    context.fill();
    context.stroke();
}
function drawCircle(circle, border) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    context.strokeStyle = border;
    context.fillStyle = circle.color;
    context.lineWidth = CIRCLE_BORDER;
    context.closePath();
    context.fill();
    context.stroke();
}
function newCircle() {
    var x = radius + (Math.random() * (canvas.width - (2 * radius)));
    var y = radius + (Math.random() * (canvas.height - (2 * radius)));
    var color = randomColor();
    var direction = Math.random() * 2.0 * Math.PI;
    return { x: x, y: y, color: color, direction: direction, radius: radius, speed: speed, isPlayer: false };
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
function start() {
    circles = [];
    for (var i = 0; i < NUM_CIRCLES; i++) {
        //var x = radius + (Math.random() * (canvas.width - (2 * radius)));
        //var y = radius + (Math.random() * (canvas.height - (2 * radius)));
        //var color = randomColor();
        //var direction = Math.random() * 2.0 * Math.PI;
        //circles.push({ x: x, y: y, color: color, direction: direction, radius:radius, speed:speed });
        circles.push(newCircle());
    }
    circles.push(createPlayer());
    //draw();
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
        player.speed = Math.min(player.speed + 0.1, speed * 2);
    }
}
function down() {
    if (player != null) {
        player.speed = Math.max(player.speed - 0.1, 0);
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
document.onkeydown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
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
document.onkeypress = function (e) {
    switch (e.key) {
        case "1":
            if (player != null) {
                player.speed = Math.min(player.speed + 0.1, speed * 2);
            }
            break;
        case "2":
            if (player != null) {
                player.speed = Math.max(player.speed - 0.1, 0); //speed * -2);
            }
            break;
    }
    console.log(e.key);
};
