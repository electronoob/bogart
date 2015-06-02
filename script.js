var width = 100, height = 100;
var $canvas = null, ctx = null;

var GCid = -1;

var world = new AgarWorld();
var NUM_BOTS = 1;
var clients = [], spec;

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;
}

var inter=null;
function start() {
  window.dump("#event\tattacker_size\tvictim_size\tdistance\n");
//  spec = new AgarClient("spectatorbot", world, true);

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
          if (c.id > -1) {
            var dx = c.x - x, dy = c.y - y;

            if (Math.abs(dx) < 10000 && Math.abs(dy) < 10000) {
              // viruses (when we're small) and other bots don't matter
              if ((o.isVirus && c.size < 75) || o.isBot) { continue; }

              var d = Math.sqrt(dx*dx + dy*dy);
              var dir = (c.size < o.size || o.isVirus)? 1 : -1;
              var cost = Math.abs(c.size - o.size);

              if (o.isVirus && c.size > 80) {
                dir = 1;
                cost = Math.max(0, 200 - d);
              }

              if (!o.isVirus && o.size > c.size) {
                dir = 1;
                cost = (d - o.size);
                if (cost <= 0) { cost = 0.00000001; }
                cost = 1/cost;
              }

              if (id == GCid) {
                dir = -1;
                cost = 9999999999;
              }

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

//        console.log("Client", i, "towards", x, y);

        clients[i].dx = x;
        clients[i].dy = y;
        clients[i].sendDirection();
      }
    }
  }, 50);
}

function drawArrow(ctx, x, y, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+dx, y+dy);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  var scale_x = width / world.width;
  var scale_y = height / world.height;

  var objects = world.objects;
  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];

      var x = o.x * scale_x;
      var y = o.y * scale_y;

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
      }
    }
  }

  for (var i=0; i < clients.length; ++i) {
    var c = clients[i],
        x = c.x * scale_x,
        y = c.y * scale_y;
    if (c.hasOwnProperty("vecs")) {
      c.vecs.forEach(function (vec) {
//        console.log(vec[0], vec[1]);
        drawArrow(ctx, x, y, vec[0], vec[1]);
      });
    }
  }

  window.requestAnimationFrame(render);
}

if (typeof window !== "undefined") {
  $(function () {
    $canvas = $("#canvas");
    ctx = $canvas[0].getContext("2d");
    $(window).resize(canvasResizeHandler);
    canvasResizeHandler();

    window.requestAnimationFrame(render);

    $("#open").click(function () {
      world.url = $("#url").val();
      $("#url").hide();
      $("#open").hide();
      $("#close").show();
      start();
    });

    $("#close").click(function () {
      clients.forEach(function (c) {
        c.end();
      });
//      spec.end();

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
