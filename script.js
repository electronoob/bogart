$(function () {
  start($("#canvas"));
});

var width = 100, height = 100;
var $canvas = null, ctx = null;
var socket = null;
var objects = {};

var URL = "ws://45.33.103.108:443";

var SIZE = 11180.339887498949;

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;
}

function start($el) {
  $canvas = $el;
  ctx = $el[0].getContext("2d");

  $(window).resize(canvasResizeHandler);
  canvasResizeHandler();

  var clients = [];
  for (var i = 0; i < 10; ++i) {
    var name = "HIHIHI" + i + Math.floor(Math.random() * 1000);
    clients.push(new AgarClient(name));
    console.log("Launching " + name);
  }

  window.requestAnimationFrame(render);

  $("#close").click(function () { socket.close(); });
}

function render() {
  ctx.clearRect(0, 0, width, height);

  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];

      var x = width * o.x / SIZE;
      var y = height * o.y / SIZE;

      ctx.lineWidth = o.isVirus? 1 : 5;
      ctx.strokeStyle = o.color;
      ctx.fillStyle = o.color;

      ctx.beginPath();
      ctx.arc(x, y, o.size / 5, 0, 2*Math.PI);
      ctx.stroke();

      ctx.fillText(o.name, x, y);
    }
  }

  window.requestAnimationFrame(render);
}

function AgarClient(nickname) {
  var self = this;

  this.nickname = nickname;
  this.id = -1;

  this.socket = new WebSocket(URL);
  this.socket.binaryType = "arraybuffer";
  this.socket.onopen = function (e) {
    var buf = new ArrayBuffer(5);
    var dv = new DataView(buf);
    dv.setUint8(0, 254);
    dv.setUint32(1, 3, true);
    self.socket.send(buf);

    dv.setUint8(0, 255);
    dv.setUint32(1, 1, true);
    self.socket.send(buf)

    self.sendNick();
    setInterval(self.sendDirection.bind(self, 100, 100), 300);
  }

  socket.onmessage = function (e) {
    var dv = new DataView(e.data);
    var pos = 1;
    switch (dv.getUint8(0)) {
    case 16:
      var cnt = dv.getUint16(pos, true); pos += 2;
      for (var i = 0; i < cnt; ++i) {
        var attacker = dv.getUint32(pos, true);
        var victim = dv.getUint32(pos + 4, true);
        pos += 8;

        if (victim == self.id) {
          console.log("WE DIED :(");
          objects = {};
          setTimeout(sendNick, 500);
          return;
        }

        if (attacker == self.id) {
          console.log("WE KILLED??");
        }

        delete objects[victim];
      }

      while (1) {
        var id = dv.getUint32(pos, true);
        pos += 4;
        if (id == 0) break;

        ++i;
        var x = dv.getUint16(pos, true);
        pos += 2;

        var y = dv.getUint16(pos, true);
        pos += 2;

        var size = dv.getUint16(pos, true);
        pos += 2;

        var r = dv.getUint8(pos++),
            g = dv.getUint8(pos++),
            b = dv.getUint8(pos++);

        var color = (r << 16 | g << 8 | b).toString(16);
        while (color.length < 6) { color = "0" + color; }
        color = "#" + color;

        var flags = dv.getUint8(pos++)
        var isVirus = !!(flags & 1)
        var isAgitated = !!(flags & 16)

        if (flags & 2) { pos += 4; }
        if (flags & 4) { pos += 8; }
        if (flags & 8) { pos += 16; }

        var name = "";
        while (1) {
          var c = dv.getUint16(pos, true);
          pos += 2;

          if (c == 0) { break; }
          name += String.fromCharCode(c);
        }

        if (id in objects) {
          var o = objects[id];
          o.x = x;
          o.y = y;
          o.color = color;
          if (name !== "") {
            o.name = name;
          }
        } else {
          objects[id] = {
            color: color,
            name: name,
            x: x,
            y: y,
            size: size,
            isVirus: isVirus,
            isAgitated: isAgitated
          };
        }
      }

      dv.getUint16(pos, true);
      pos += 2;

      cnt = dv.getUint32(pos, true);
      pos += 4;
      for (i = 0; i < cnt; i++) {
        dv.getUint32(pos, true);
        pos += 4;
      }
      break;

    case 17:
      // 3 vals?
      var x = dv.getFloat32(1, true),
          y = dv.getFloat32(5, true),
          z = dv.getFloat32(9, true);
      console.log(17, x, y, z);
      break;

    case 20:
      // reset stuff? jubred = []; foodu = [];
      console.log("reset?");
      break;

    case 32:
      self.id = dv.getUint32(pos, true);
      console.log("32 - our id?", self.id);
      break;

    case 49:
      var cnt = dv.getUint32(pos, true);
      pos += 4;

      for (var i = 0; i < cnt; ++i) {
        var id = dv.getUint32(pos, true);
        pos += 4;

        var name = "";
        while (1) {
          var c = dv.getUint16(pos, true);
          pos += 2;

          if (c == 0) { break; }
          name += String.fromCharCode(c);
        }
      }
      break;

    case 50:
      var cnt = dv.getUint32(pos, true);
      pos += 4;
      for (var i = 0; i < cnt; ++i) {
        var n = dv.getFloat32(pisu, true);
        pos += 4;
      }
      console.log("vals", cnt);
      break;

    case 64:
      var x = dv.getFloat64(1, true);
      var y = dv.getFloat64(9, true);
      var z = dv.getFloat64(17, true);
      var n = dv.getFloat64(25, true);

      console.log(64, x, y, z, n);
      break;

    case 72:
      // they always send this message at the start...
      console.log("HelloHelloHello");
      break;

    default:
      console.log("Unknown msg", e);
    }
    };

  socket.onclose = function (e) { };

  socket.onerror = function(e) {
    console.log("socket error", e);
  };
};

AgarClient.sendNick = function () {
  var buf = new ArrayBuffer(1 + 2 * this.nickname.length),
      dv = new DataView(buf);

  dv.setUint8(0, 0);
  for (var i = 0; i < this.nickname.length; ++i) {
    dv.setUint16(1 + 2 * i, this.nickname.charCodeAt(i), true);
  }

  this.socket.send(buf);
}

AgarClient.sendDirection = function (x, y) {
  var buf = new ArrayBuffer(21),
      dv = new DataView(buf);

  dv.setUint8(0, 16);
  dv.setFloat64(1, x, true);
  dv.setFloat64(9, y, true);
  dv.setUint32(17, 0, true);

  this.socket.send(buf);
};
