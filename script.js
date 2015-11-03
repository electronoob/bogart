var width = 100, height = 100;
var $canvas = null, ctx = null,
    $leaderboard = null;

var world = new AgarWorld();
var spec = null;

var offsetX = 0, offsetY = 0;
var scale_x = 4, scale_y = 4;

world.onleaderschange = function (new_leaders) {
  if ($leaderboard) {
    $leaderboard.html("");
    new_leaders.forEach(function (leader) {
      $leaderboard.append("<li>" + leader.name + "</li>");
    });
  }
};

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;
}

function start() {
  spec = new AgarClient($("#name").val(), world, false);

  window.onmousemove=function(e){
    window.spec.dx = (e.clientX / scale_x) - offsetX;
    window.spec.dy = (e.clientY / scale_y) - offsetY;
    //console.log(spec.dx+ " : " + spec.dy);
  };
  window.onkeypress = function(e){
    var x = e.which || e.keyCode;
    switch(x) {
      case 119: // W
        spec.sendCommand(21);
        break;
      case 32: // Space
        spec.sendCommand(17);
        break;
      case 113: // Q
        spec.sendCommand(18);
        break;
      case 114: // R = respawn
        spec.sendNick();
        break;
    }
  }
  // Zoom
  window.onmousewheel=function(e){
      var d = e.wheelDelta/2000;
      scale_x += d;
      scale_y += d; 
  };
}

function drawArrow(ctx, x, y, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+dx, y+dy);
  ctx.stroke();
}

function render(t) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Zooming in
  ctx.scale(scale_x,scale_y);

  if (spec) {
    // Calcualate center
    var cx = 0, cy = 0, count = 0;
    for (var i in spec.myCells) {
      if (world.objects[i]) {
        cx += world.objects[i].x;
        cy += world.objects[i].y;
        count++;
      } 
    }

    // Caculate center if the player is alive
    if (count != 0) {
      spec.x = cx/count;
      spec.y = cy/count;
      /* trying to add some background movement/parallax
      var bgx = (world.width) - (spec.x * window.scale_x);
      var bgy = (world.height) - (spec.y * window.scale_y);
      document.body.style.backgroundPosition = bgx + "px " + bgy + "px";
      */
    }

    // Translate canvas
    offsetX = ((width/2) / scale_x) - spec.x; 
    offsetY = ((height/2) / scale_y) - spec.y;
    ctx.translate(offsetX,offsetY);
  }

  /*
  var objects = world.objects;
  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];

      // Draw
      o.draw(ctx);

      // Animation smoothing
      if (o.animate) {
        o.x += (o.x_ - o.x) / 4.0;
        o.y += (o.y_ - o.y) / 4.0;
        o.size += (o.size_ - o.size) / 6.0;
      }
    }
  }
  */
  var sorted = world.sorted;
  for (var i = sorted.length - 1; i > -1; i--) {
    var o = sorted[i];
    // Draw
    o.draw(ctx);

    // Animation smoothing
    if (o.animate) {
      o.x += (o.x_ - o.x) / 4.0;
      o.y += (o.y_ - o.y) / 4.0;
      o.size += (o.size_ - o.size) / 6.0;
    }
  }

  // Move this to a function 
  try {
    spec.sendDirection();
  } catch (e) {
    // websocket not open
  }
  ctx.restore();

  window.requestAnimationFrame(render);
}

if (typeof window !== "undefined") {
  $(function () {
    $canvas = $("#canvas");
    ctx = $canvas[0].getContext("2d");
    $(window).resize(canvasResizeHandler);
    canvasResizeHandler();

    $leaderboard = $("#leaderboard");

    window.requestAnimationFrame(render);

    $("#open").click(function () {
      world.url = $("#url").val();
      $("#url").hide();
$(".bogart").hide(1000);  
  $("#form-main").hide(500);
      $("#open").hide();
      $("#close").show();
      start();
    });

    $("#close").click(function () {
      if (spec !== null) {
        spec.end();
        spec = false;
      }

      $("#url").show();
      $("#open").show();
      $("#close").hide();
      world.objects = {};
      names = {};
    });
  });
} else {
  start();
}
