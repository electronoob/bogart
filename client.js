var names = {};

function AgarClient(nickname, world, spectate) {
  var self = this;

  this.nickname = nickname;
  this.world = world;
  this.spectate = spectate;

  this.reset = function() {
    this.id = -1;
    this.x = -1; // center x
    this.y = -1; // center y
    this.size = -1;
    this.dx = 0;
    this.dy = 0;
    this.myCells = [];
  };
  this.reset();

  this.socket = new WebSocket(world.url);
  this.socket.binaryType = "arraybuffer";

  // Make browser WebSockets and node.js ws library use the same event
  // listener attaching scheme
  this.socket.on = this.socket.addEventListener;

  this.socket.on('open', this.sendInit.bind(this));
  this.socket.on('message', this.handleMessage.bind(this));
  this.socket.on('close', function (e) {
    self.reset();
  });
  this.socket.on('error', function(e) {
    self.reset();
    console.log("socket error", e);
  });
};

AgarClient.prototype.sendInit = function () {
  var buf = new ArrayBuffer(5);
  var dv = new DVWriter(new DataView(buf), true);
  dv.putUint8(254);
  dv.putUint32(4);
  this.socket.send(buf);

  dv.move(0);
  dv.putUint8(255);
  dv.putUint32(1);
  this.socket.send(buf);

  if (this.spectate) {
    this.sendCommand(1);
  } else {
    this.sendNick();
    this.sendDirection();
  }
};

AgarClient.prototype.sendNick = function () {
  var buf = new ArrayBuffer(1 + 2 * this.nickname.length),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(0);
  dv.putNullString16(this.nickname);

  this.socket.send(buf);
};

AgarClient.prototype.sendDirection = function () {
  var buf = new ArrayBuffer(13),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(16);
  dv.putInt32(this.dx, true);
  dv.putInt32(this.dy, true);
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

AgarClient.prototype.handleMessage = function (e) {
  var dv = new DVReader(new DataView(e.data), true),
      t = window.performance.now(),
      objects = world.objects;

  var opcode = dv.getUint8();
  if (opcode == 240) { // No clue, but this matches the client
    var unknownSkip = dv.getUint32();
    opcode = dv.getUint8();
    console.log("unknown 240 value", unknownSkip, opcode, e.data.byteLength);
  }

  switch (opcode) {
  case 16:
    var cnt = dv.getUint16();
    for (var i = 0; i < cnt; ++i) {
      var attacker_id = dv.getUint32(), victim_id = dv.getUint32();

      if (objects[attacker_id]) {
        var attacker = objects[attacker_id];
        attacker.lastEatTime = t;
        attacker.hasntEatenSinceLastDecay = false;
        attacker.prevEatSize = attacker.size;
      }

      if (this.myCells[victim_id]) {
        delete this.myCells[victim_id];
      }

      delete objects[victim_id];
    }

    while (1) {
      var id = dv.getUint32();
      if (id == 0) break;

      var x = dv.getInt32(),
          y = dv.getInt32(),
          size = dv.getUint16(),
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

      var o;
      if (objects[id]) {
        o = objects[id];
        o.x_ = x; 
        o.y_ = y;
        o.size_ = size;
        o.animate = true;
      } else {
        // create
        objects[id] = {
          name: name,
          x_: x, // Real X
          y_: y, // Real Y
          size_: size, // Real size
          x: x,
          y: y,
          size: size,
          animate: false,
        };

        // Set drawing functions
        o = objects[id];
        if (o.size < 25) {
          o.draw = drawFood;
        } else if (isVirus) {
          o.draw = drawVirus;
        } else {
          o.draw = drawPlayer;
        }
      }

      o = objects[id];
      o.isVirus = isVirus;
      o.isAgitated = isAgitated;
      o.color = color;

      o.lastUpdate = t;
    }

    // Sort
    this.world.sorted = []; 
    for (var key in objects) {
      this.world.sorted.push(objects[key])
    };
    this.world.sorted = this.world.sorted.sort(function(a, b) {
      return b.size_ - a.size_;
    });

    // Remove    
    cnt = dv.getUint32();
    for (i = 0; i < cnt; i++) {
      var killid = dv.getUint32();
      if (objects[killid]) {
        delete objects[killid];
      }
    }
    break;

  case 17:
    // Indicates camera movement + zoom level
    var x = dv.getFloat32(),
    y = dv.getFloat32(),
    z = dv.getFloat32();
    break;

  case 20:
    // Unknown - resets stuff?
    console.log("reset?");
    break;

  case 21:
    console.log("mysterious 21", dv.getInt16(), dv.getInt16());
    break;

  case 32:
    // New object under our control... but I don't handle controlling
    // multiple blobs yet
    var id = dv.getUint32();
    this.myCells[id] = true;
    break;

  case 49:
    // Leaderboard ids and names
    var cnt = dv.getUint32(),
        leaders = [];
    for (var i = 0; i < cnt; ++i) {
      var id = dv.getUint32(), name = dv.getNullString16();
      leaders.push({
        id: id,
        name: name
      });
    }
    this.world.setLeaders(leaders);
    break;

  case 50:
    // unknown (like 49 but for teams i'm told)
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
    this.world.width = w;
    this.world.height = h;
    console.log("World dimensions [64]", x, y, w, h);

        var bgx = (this.world.width)-x;
        var bgy = (this.world.height)-y;
        document.body.style.backgroundPosition = bgx + "px " + bgy + "px";

    break;

  case 72:
    // Server sent HelloHelloHello initialization message
    break;

  default:
    console.log("Unknown msg", e);
  }
};

// Drawing functions
var drawFood = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fillStyle = this.color;
  ctx.fill();
}

var drawPlayer = function(ctx) {
  // Begin circle outline
  ctx.beginPath();
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 5; // Test
  ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
  
  // Draw white cell background
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Draw cell color over the white background
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = this.color;
  ctx.fill();

  // Reset Alpha
  ctx.globalAlpha = 1.0;
  
  // Draw Outline
  ctx.stroke();
  
  // Draw name
  var h = 0;
  ctx.fillStyle = '#FFFFFF';
  if (this.name.length > 0) {
    h = Math.max(.5 * this.size,20); // name size
    ctx.font = 'bold ' + h + 'pt Calibri';
    ctx.fillText(this.name, this.x-(ctx.measureText(this.name).width / 2), this.y + (h/4));
  }
  
  // Draw mass
  var fh = Math.max(h/2,10); // font height
  ctx.font = fh + 'pt Sans Serif';
  var mass = '' + ((this.size * this.size)/100 >> 0);
  ctx.fillText(mass, this.x-(ctx.measureText(mass).width / 2), this.y + fh + (h/3));
}

var drawVirus = function(ctx) {
  // Line dash
  ctx.setLineDash([5,5]);
  // Virus outline
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
  ctx.stroke();
  // Virus color
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = this.color;
  ctx.fill();
  // Done
  ctx.setLineDash([]);
}
