var width = 100, height = 100;
var $canvas = null, ctx = null,
    $leaderboard = null;

var GCid = -1;

var world = new AgarWorld();
var NUM_BOTS = 1;
var clients = [], spec = null;

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

var inter=null;
function start() {
  //window.dump("decay_time\teat_time\told_size\tnew_size\tprev_decay_size\tprev_eat_size\tgood_decay\tdist_moved\n");
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
      console.log(d);
  };

}

function drawArrow(ctx, x, y, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+dx, y+dy);
  ctx.stroke();
}

function render() {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  //var scale_x = width / world.width;
  //var scale_y = height / world.height;
  ctx.scale(scale_x,scale_y);

  var d;
  var t = window.performance.now();

  // Translate
  //console.log(spec.x + " : " + spec.y);
  //console.log(offsetX+ " : " + offsetY);
  if (spec) {
    offsetX = ((width/2) / scale_x) - spec.x; 
    offsetY = ((height/2) / scale_y) - spec.y;
    console.log(offsetX+ " : " + offsetY);
    //ctx.translate(offsetX,offsetY);
    ctx.translate(offsetX,offsetY);
  }

  var objects = world.objects;
  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];

      var x = o.x;
      var y = o.y;

      if (o.isVirus) {
        ctx.setLineDash([5,5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.lineWidth = o.isBot? 3 : 1;
      ctx.strokeStyle = o.color;

      ctx.beginPath();
      ctx.arc(x, y, o.size, 0, 2*Math.PI);
      ctx.stroke();

      if (o.isAgitated) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fill();
      } else if (o.isBot) {
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
      }

      ctx.fillStyle = o.color;
      if (id == GCid) {
        ctx.font = 'bold 20pt Calibri';
      } else {
        ctx.font = "12pt Sans Serif";
      }
      var size = ctx.measureText(o.name);
      ctx.fillText(o.name, x-(size.width / 2), y);

      if (o.size > 20 || o.name !== "") {
        ctx.font = "6pt Sans Serif";
        size = ctx.measureText("" + o.size);
        ctx.fillText(""+o.size, x-(size.width / 2), y+6);

        d = (t - o.lastEatTime).toFixed(2);
        size = ctx.measureText(d);
        ctx.fillText(d, x-(size.width / 2), y+12);
      }

      if (o.feed_target) {
        ctx.font = "20pt Sans Serif";
        size = ctx.measureText("FEED");
        ctx.fillText("FEED", x-(size.width / 2), y+12);
      }
    }
  }

  for (var i=0; i < clients.length; ++i) {
    var c = clients[i],
        x = c.x,
        y = c.y;
    if (c.hasOwnProperty("vecs")) {
      c.vecs.forEach(function (vec) {
        drawArrow(ctx, x, y, vec[0], vec[1]);
      });
    }
  }
  
  window.requestAnimationFrame(render);

  // Move this to a function 
  try {
    spec.sendDirection();
  } catch (e) {
    // websocket not open
  }
  ctx.restore();
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
$(".bogart").hide(50);	
	$("#form-main").hide(200);
      $("#open").hide();
      $("#close").show();
      start();
    });

    $("#close").click(function () {
      clients.forEach(function (c) {
        c.end();
      });

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
