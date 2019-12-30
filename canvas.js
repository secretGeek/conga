var context;
var canvas;
var circles = [];
var radius = 20;
var speed = 4;
var NUM_CIRCLES = 5;
var coloron = true;


function randomColor() {
    var chars = '0123456789ABCDEF';
    var color = '#';
    if (coloron) {
      for (var i = 0; i < 6; i++) {
        color += chars[Math.floor(Math.random() * 8) + 8];
      }
      color = color += '80';
    } else {
      var col = chars[Math.floor(Math.random() * 16)];
      color = '#' + (col.repeat(3));// + col + col + col + col + col;
    }
    return color;
}
function draw() {
    //context.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(function (circle) {
        circle.x = circle.x + speed * Math.cos(circle.direction);
        circle.y = circle.y + speed * Math.sin(circle.direction);
        bounce(circle);
        drawCircle(circle.x, circle.y, radius, 2, circle.color, circle.color);
    });
    requestAnimationFrame(draw);
}
function bounce(circle) {
    if (circle.x - radius < 0 ||
        circle.x + radius > canvas.width) {
        // vertical wall
        circle.direction = (circle.direction * -1) - (Math.PI);
    }
    if (circle.y - radius < 0 ||
        circle.y + radius > canvas.height) {
        // horizontal wall
        circle.direction = circle.direction * -1;
    }
    // mod
    circle.direction = circle.direction % (2 * Math.PI);
}
function drawCircle(x, y, radius, border, border_color, fill_color) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.strokeStyle = border_color;
    context.fillStyle = fill_color;
    context.lineWidth = border;
    context.closePath();
    context.fill();
    context.stroke();
}
document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("html-canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    context = canvas.getContext("2d");
    for (var i = 0; i < NUM_CIRCLES; i++) {
        var x = radius + (Math.random() * (canvas.width - (2 * radius)));
        var y = radius + (Math.random() * (canvas.height - (2 * radius)));
        var color = randomColor();
        var direction = Math.random() * 2.0 * Math.PI;
        circles.push({ x: x, y: y, color: color, direction: direction });
        draw();
    }
}, false);
