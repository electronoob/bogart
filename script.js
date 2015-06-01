var width = 100, height = 100;
var $canvas = null, ctx = null;
var objects = {};

var GCid = -1;

var URL = "";
var SIZE = 11180.339887498949;
var NUM_BOTS = 5;
var clients = [];

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;
}

function start() {
  var spec = new AgarClient("spectatorbot", true);

  clients = [];
  for (var i = 0; i < NUM_BOTS; ++i) {
    setTimeout(function () {
      var name = "BOT.." + + Math.floor(Math.random() * 1000);
      clients.push(new AgarClient(name));
      console.log("Launching " + name);
    }, i * 1500);
  }

  setInterval(function () {
    var vecs = [];
    for (var i = 0; i < clients.length; ++i) {
      vecs[i] = [0, 0];
      clients[i].vecs = [];
    }

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

              if (id == GCid) {
                dir = -1;
                cost = 9999999999;
              }

              if (o.size < 14) {
                dir = -1;
                if (d < 250) {
                  cost *= 250 - d;
                } else {
                  cost = 0;
                }
              }

              c.vecs.push([dx*cost*dir, dy*cost*dir]);

              vecs[i][0] += dir * cost * dx / (d*d);
              vecs[i][1] += dir * cost * dy / (d*d);
            }
          }
        }
      }
    }

    for (var i = 0; i < clients.length; ++i) {
      var c = clients[i];
      if (c.id != -1) {
        var norm = Math.sqrt(vecs[i][0] * vecs[i][0] + vecs[i][1] * vecs[i][1]);
        var x = (vecs[i][0]/norm) * 10000;
        var y = (vecs[i][0]/norm) * 10000;

        if (c.x < (c.size / 2)) {
          x = 0;
          y = Math.sign(y) * 10000;
        }

        if (c.x > SIZE - (c.size / 2)) {
          x = 0;
          y = Math.sign(y) * 10000;
        }

        if (c.y < (c.size / 2)) {
          y = 0;
          x = Math.sign(x) * 10000;
        }

        if (c.y > SIZE - (c.size / 2)) {
          y = 0;
          x = Math.sign(x) * 10000;
        }

        if (y == 0 && x == 0) {
          y = 0;
          x = 0;
        }

        clients[i].dx = x;
        clients[i].dy = y;
        clients[i].sendDirection();
      }
    }
  }, 100);
}

function render() {
  ctx.clearRect(0, 0, width, height);

  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];

      var x = width * o.x / SIZE;
      var y = height * o.y / SIZE;

      if (o.isVirus) {
        ctx.setLineDash([5,5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.lineWidth = o.isBot? 3 : 1;
      ctx.strokeStyle = o.color;

      ctx.beginPath();
      ctx.arc(x, y, o.size / 7, 0, 2*Math.PI);
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

  window.requestAnimationFrame(render);
}

function AgarClient(nickname, spectate) {
  var self = this;

  this.reset = function() {
    this.nickname = nickname;
    this.id = -1;
    this.x = -1;
    this.y = -1;
    this.size = -1;
    this.dx = 0;
    this.dy = 0;
  }
  this.reset();

  this.socket = new WebSocket(URL);
  this.socket.binaryType = "arraybuffer";
  this.socket.onopen = function (e) {
    var buf = new ArrayBuffer(5);
    var dv = new DVWriter(new DataView(buf), true);
    dv.putUint8(254);
    dv.putUint32(4);
    self.socket.send(buf);

    dv.move(0);
    dv.putUint8(255);
    dv.putUint32(1);
    self.socket.send(buf)

    if (spectate) {
      self.sendCommand(1);
    } else {
      self.sendNick();
      self.sendDirection();
    }
  }

  this.socket.onmessage = function (e) {
    var dv = new DVReader(new DataView(e.data), true);
    switch (dv.getUint8(0)) {
    case 16:
      var cnt = dv.getUint16();
      for (var i = 0; i < cnt; ++i) {
        var attacker = dv.getUint32(), victim = dv.getUint32();

        if (victim == self.id) {
          self.reset();
          setTimeout(self.sendNick.bind(self), 500);
        }

        if (victim == GCid) {
          GCid = -1;
        }

        delete objects[victim];
      }

      while (1) {
        var id = dv.getUint32();
        if (id == 0) break;

        var x = dv.getInt16(),
            y = dv.getInt16(),
            size = dv.getInt16(),
            r = dv.getUint8(),
            g = dv.getUint8(),
            b = dv.getUint8(),
            flags = dv.getUint8();

        var color = (r << 16 | g << 8 | b).toString(16);
        while (color.length < 6) { color = "0" + color; }
        color = "#" + color;

        var isVirus = !!(flags & 1);
        var isAgitated = !!(flags & 16);

        if (flags & 2) { dv.skip(4); }
        if (flags & 4) { dv.skip(8); }
        if (flags & 8) { dv.skip(16); }

        var name = dv.getNullString16();

        if (name == "BotMaster") {
          GCid = id;
        }

        if (id == self.id) {
          self.x = x;
          self.y = y;
          self.size = size;
        }

        if (id in objects) {
          var o = objects[id];
          o.x = x;
          o.y = y;
          o.size = size;
          o.isAgitated = isAgitated;
          o.color = color;
          o.isBot = o.isBot || (id == self.id);
        } else {
          objects[id] = {
            color: color,
            name: name,
            x: x,
            y: y,
            size: size,
            isVirus: isVirus,
            isAgitated: isAgitated,
            isBot: id == self.id
          };
        }
      }

      cnt = dv.getUint32();
      for (i = 0; i < cnt; i++) {
        var killid = dv.getUint32();

        if (killid in objects) {
          if (killid == GCid) { GCid = -1; }
          delete objects[killid];
        }
      }
      break;

    case 17:
      // Unknown, 3 values
      // Indicates camera movement + zoom level
      var x = dv.getFloat32(),
          y = dv.getFloat32(),
          z = dv.getFloat32();
      // console.log(17, x, y, z);
      break;

    case 20:
      // Unknown - resets stuff?
      console.log("reset?");
      break;

    case 32:
      // We spawned
      self.id = dv.getUint32();
      break;

    case 49:
      // Leaderboard ids and names
      var cnt = dv.getUint32();
      for (var i = 0; i < cnt; ++i) {
        var id = dv.getUint32(),
            name = dv.getNullString16();
      }
      break;

    case 50:
      // unknown
      var cnt = dv.getUint32();
      for (var i = 0; i < cnt; ++i) {
        var n = dv.getFloat32();
      }
      console.log("vals", cnt);
      break;

    case 64:
      // Set stage size
      var x = dv.getFloat64(),
          y = dv.getFloat64(),
          w = dv.getFloat64(),
          h = dv.getFloat64();
      console.log(64, x, y, w, h);
      break;

    case 72:
      // Server sent HelloHelloHello initialization message
      break;

    default:
      console.log("Unknown msg", e);
    }
  };

  this.socket.onclose = function (e) {
    self.reset();
  };

  this.socket.onerror = function(e) {
    self.reset();
    console.log("socket error", e);
  };
};

AgarClient.prototype.sendNick = function () {
  var buf = new ArrayBuffer(1 + 2 * this.nickname.length),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(0);
  dv.putNullString16(this.nickname);

  this.socket.send(buf);
};

AgarClient.prototype.sendDirection = function () {
  var buf = new ArrayBuffer(21),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(16);
  dv.putFloat64(this.dx, true);
  dv.putFloat64(this.dy, true);
  dv.putUint32(0, true);

  this.socket.send(buf);
};

AgarClient.prototype.sendCommand = function (x) {
  var buf = new ArrayBuffer(1),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(x);

  this.socket.send(buf);
};

AgarClient.prototype.end = function () {
  this.socket.close();
};

if (typeof window !== "undefined") {
  $(function () {
    $canvas = $("#canvas");
    ctx = $canvas[0].getContext("2d");
    $(window).resize(canvasResizeHandler);
    canvasResizeHandler();

    window.requestAnimationFrame(render);

    $("#open").click(function () {
      URL = $("#url").val();
      $("#url").hide();
      $("#open").hide();
      $("#close").show();
      start();
    });

    $("#close").click(function () {
      clients.forEach(function (c) {
        c.end();
      });
    });
  });
} else {
  start();
}
