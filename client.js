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
//        window.dump("eat\t"+attacker.size+"\t"+victim.size+
        //                    "\t"+pos_a.distance(pos_v)+"\n");
        attacker.lastEatTime = t;
        attacker.hasntEatenSinceLastDecay = false;
        attacker.prevEatSize = attacker.size;
      }

      var index = this.myCells.indexOf(victim_id);
      if (index != -1) {
        delete this.myCells[index];
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

      var o;
      if (objects[id]) {
        o = objects[id];
        o.x = x;
        o.y = y;
        // detect movement without gain in size and only do it on
        // ourselves to keep the data free of split events
//         if (o.size == size && (t - o.lastUpdate) < 500 && id == this.id) {
//           window.dump("" + size + "\t" +
//                       (Victor.fromObject(o).distance(new Victor(x, y)))
//                       + "\t" + (t - o.lastUpdate) + "\n");
//        }
      } else {
        // create
        objects[id] = {
          name: name,
          x: x,
          y: y,
          lastEatTime: 0,
          lastDecayTime: 0,
          hasntEatenSinceLastDecay: false,
          prevDecaySize: 0,
          prevEatSize: 0,
          prevDecayPoint: null
        };
      }

      o = objects[id];

      // This blob got smaller: gotta be either decay or a split--I
      // want the split data to and I'll filter out large losses of
      // half at a time in post
      if (size < o.size) {
        var decayPoint = new Victor(x, y);

        /*
        if (o.prevDecayPoint !== null) {
          window.dump(
            (t-o.lastDecayTime) + "\t" +
              (t-o.lastEatTime) + "\t" +
              o.size + "\t" +
              size + "\t" +
              o.prevDecaySize + "\t" +
              o.prevEatSize + "\t" +
              o.hasntEatenSinceLastDecay.toString().toUpperCase() + "\t" +
              (decayPoint.distance(o.prevDecayPoint)) + "\n"
          );
        }
        */

        o.lastDecayTime = t;
        o.hasntEatenSinceLastDecay = true;
        o.prevDecaySize = size;
        o.prevDecayPoint = new Victor(x, y);
      }

      o.isBot = o.isBot || (id == this.id);
      o.x = x;
      o.y = y;
      o.size = size;
      o.isVirus = isVirus;
      o.isAgitated = isAgitated;
      o.color = color;

      if (name !== "") {
        o.feed_target = FEED_TARGETS.some(function (n) {
          return name.toLowerCase() === n;
        });
      }

      o.lastUpdate = t;
    }

    // Calcualate center
    var cx = 0, cy = 0, count = 0;
    for (var i in this.myCells) {
      var j = this.myCells[i];
      if (objects[j]) {
        cx += objects[j].x;
        cy += objects[j].y;
        count++;
      } 
      /*
      else {
        delete this.myCells[i];
      }
      */
    }
    if (count != 0) {
      this.x = cx/count;
      this.y = cy/count;
      /* trying to add some background movement/parallax */
      var bgx = (this.world.width)-this.x;
      var bgy = (this.world.height)-this.y;
      document.body.style.backgroundPosition = bgx + "px " + bgy + "px";
    }
    
        
    // Remove    
    cnt = dv.getUint32();
    for (i = 0; i < cnt; i++) {
      var killid = dv.getUint32();
      if (objects[killid]) {
        //if (killid == GCid) { GCid = -1; }
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
    this.myCells.push(id);
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
