var width = 100, height = 100;
var $canvas = null, ctx = null,
    $leaderboard = null;

var GCid = -1;

var world = new AgarWorld();
var NUM_BOTS = 1;
var clients = [], spec = null;

var offsetX = 0, offsetY = 0;
var scale_x = 4, scale_y = 4;

var FEED_TARGETS = ["gc", "BotMaster", "white light", "white  light",
                    "tubbymcfatfuck", "texas  doge", "white  light",
                    "doge  helper", "lord kience", "drunken",
                    "controless", "notreallyabot",
                    "sqochit", "blueeyes",
                    "skref is life", "shrek is love"];

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
    }
  }
  // Zoom
  window.onmousewheel=function(e){
      var d = e.wheelDelta/2000;
      scale_x += d;
      scale_y += d; 
      console.log(d);
  };
  /*
  clients = [];
  for (var i = 0; i < NUM_BOTS; ++i) {
    setTimeout(function () {
      var name = "BOT.." + + Math.floor(Math.random() * 1000);
      clients.push(new AgarClient(name, world));
      console.log("Launching " + name);
    }, i * 1500);
  }

  if (inter != null) {clearInterval(inter);}

  inter = setInterval(function () {
    var vecs = [];
    for (var i = 0; i < clients.length; ++i) {
      vecs[i] = [0, 0];
      clients[i].vecs = [];
    }

    var objects = world.objects;
    for (var id in objects) {
      if (objects.hasOwnProperty(id)) {
        var o = objects[id], x = o.x, y = o.y, size = o.size;
        if (o.isBot) { continue; }

        for (var i = 0; i < clients.length; ++i) {
          var c = clients[i];
          if (c.id > -1 && id != c.id) {
            var dx = c.x - x, dy = c.y - y;

            if (Math.abs(dx) < 10000 && Math.abs(dy) < 10000) {
              // viruses (when we're small) and other bots don't matter
              if ((o.isVirus && c.size < 75) || o.isBot) { continue; }

              var d = Math.sqrt(dx*dx + dy*dy);
              var dir = (c.size < o.size || o.isVirus)? 1 : -1;
              var cost = Math.abs(c.size - o.size);

              if (o.size > c.size * 0.85 && c.size > o.size * 0.85) {
                // another blob that we can't eat and it can't eat us
                cost = 0;
              } else if (o.size * 0.85 > c.size) {
                // another blob large enough to hurt us (including
                // viruses)
                //
                dir = 1;

                // can they split kill us? virtually reduce the distance
                var effective_d = d;
                if ((o.size / 2) * 0.85 > c.size) {
                  effective_d = Math.max(0, d-660);
                }

                cost = (effective_d - o.size)/o.size;
                if (cost <= 0) { cost = 0.0000001; }
                cost = Math.pow(1/cost, 2);
              }

              // Bots should join together, or sacrifice themselves
              // for their human masters!
              if (o.feed_target || o.isBot) {
                dir = -1;
                cost = 999999999;
              }

              // Food pellets
              if (o.size < 14) {
                dir = -1;
                if (d < 250) {
                  cost *= 250 - d;
                }
              }

              var v = [dir * cost * dx / (d*d),
                       dir * cost * dy / (d*d)];
              vecs[i][0] += v[0];
              vecs[i][1] += v[1];
              c.vecs.push(v);
            }
          }
        }
      }
    }

    for (var i = 0; i < clients.length; ++i) {
      var c = clients[i];
      if (c.id != -1) {
        var norm = Math.sqrt(vecs[i][0] * vecs[i][0] + vecs[i][1] * vecs[i][1]);
        if (norm == 0) {
          norm = 1;
        }
        var x = (vecs[i][0]/norm) * 10000;
        var y = (vecs[i][1]/norm) * 10000;

        if (x < 0 && c.x < c.size) {
          y = 0;
          y = Math.sign(y) * 10000;
        }

        if (x > 0 && c.x > world.width - c.size) {
          x = 0;
          y = Math.sign(y) * 10000;
        }

        if (y < 0 && c.y < c.size) {
          y = 0;
          x = Math.sign(x) * 10000;
        }

        if (y > 0 && c.y > world.height - c.size) {
          y = 0;
          x = Math.sign(x) * 10000;
        }

        clients[i].dx = x;
        clients[i].dy = y;
        clients[i].sendDirection();
      }
    }
  }, 50);
 */
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
      ctx.arc(x, y, o.size * (width / world.width), 0, 2*Math.PI);
      ctx.stroke();

      if (o.isAgitated) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fill();
      }

      if (id == GCid) {
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fill();
      }

      if (o.isBot) {
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
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
