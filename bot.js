var names = {};
var printed_leaders = false;
setInterval(function () { printed_leaders = false; }, 10000);

function AgarClient(nickname, world, spectate) {
  var self = this;

  this.nickname = nickname;
  this.world = world;
  this.spectate = spectate;

  this.reset = function() {
    this.id = -1;
    this.x = -1;
    this.y = -1;
    this.size = -1;
    this.dx = 0;
    this.dy = 0;
  }
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
  this.socket.send(buf)

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

AgarClient.prototype.handleMessage = function (e) {
  objects = world.objects;
  var dv = new DVReader(new DataView(e.data), true);
  switch (dv.getUint8(0)) {
  case 16:
    var cnt = dv.getUint16();
    for (var i = 0; i < cnt; ++i) {
      var attacker_id = dv.getUint32(), victim_id = dv.getUint32();

      if (attacker_id in objects && victim_id in objects) {
        var attacker = objects[attacker_id],
            victim = objects[victim_id];
        var pos_a = Victor.fromObject(attacker),
            pos_v = Victor.fromObject(victim);
        window.dump("eat\t"+attacker.size+"\t"+victim.size+
                    "\t"+pos_a.distance(pos_v)+"\n");
      }

      if (victim_id == this.id) {
        this.reset();
        setTimeout(this.sendNick.bind(this), 500);
      }

      if (victim_id == GCid) {
        GCid = -1;
      }

      if (victim_id in names) {
        delete names[victim_id];
      }

      delete objects[victim_id];
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

      if (name == "NotReallyABot") {
        GCid = id;
      }

      if (name !== "") {
        names[id] = name;
      }

      if (id in objects) {
        var o = objects[id];
        o.x = x;
        o.y = y;
        o.size = size;
        o.isAgitated = isAgitated;
        o.color = color;
        o.isBot = o.isBot || (id == this.id);
        if (id in names) {
          o.name = names[id];
        }
      } else {
        //          console.log("New", x, y, size, name);
        objects[id] = {
          color: color,
          name: name,
          x: x,
          y: y,
          size: size,
          isVirus: isVirus,
          isAgitated: isAgitated,
          isBot: id == this.id
        };
      }

      if (id == this.id) {
        this.x = x;
        this.y = y;
        this.size = size;
        objects[id].name = this.nickname;
      }
    }

    cnt = dv.getUint32();
    for (i = 0; i < cnt; i++) {
      var killid = dv.getUint32();

      //        console.log("Remove", killid);
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
    //      console.log(17, x, y, z);
    break;

  case 20:
    // Unknown - resets stuff?
    console.log("reset?");
    break;

  case 21:
    console.log("mysterious 21", dv.getInt16(), dv.getInt16());
    break

  case 32:
    // We spawned
    this.id = dv.getUint32();
    break;

  case 49:
    // Leaderboard ids and names
    var cnt = dv.getUint32();
    for (var i = 0; i < cnt; ++i) {
      var id = dv.getUint32(),
          name = dv.getNullString16();
      if (!printed_leaders) {
        console.log(i, id, name);
      }
    }
    printed_leaders = true;
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
    break;

  case 72:
    // Server sent HelloHelloHello initialization message
    break;

  default:
    console.log("Unknown msg", e);
  }
};
