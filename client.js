var names = {};

function AgarClient(world, spectate) {
  this.nickname = "";
  this.world = world;
  this.spectate = spectate;
  this.socket = null;
  this.isConnected = false;

  this.reset();
};

AgarClient.prototype.reset = function () {
  //
  this.isConnected = false;

  //
  this.id = -1;
  this.x = -1; // center x
  this.y = -1; // center y
  this.size = -1;
  this.mX_ = 0; // Raw mouse X
  this.mY_ = 0; // Raw mouse Y
  this.mX = 0; // Actual mouse X on canvas
  this.mY = 0; // Actual mouse Y on canvas
  this.myCells = [];

  // Clear
  this.world.reset();
}

AgarClient.prototype.connect = function (url) {
  this.socket = new WebSocket(url);
  this.socket.binaryType = "arraybuffer";
  var self = this;

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
}

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
  }

  // 
  this.isConnected = true;
};

AgarClient.prototype.sendNick = function () {
  var buf = new ArrayBuffer(1 + 2 * this.nickname.length),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(0);
  dv.putNullString16(this.nickname);

  this.socket.send(buf);
};

AgarClient.prototype.sendDirection = function (x,y) {
  var buf = new ArrayBuffer(13),
      dv = new DVWriter(new DataView(buf), true);

  dv.putUint8(16);
  dv.putInt32(this.mX, true);
  dv.putInt32(this.mY, true);
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
  this.reset();
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

      if (this.myCells[attacker_id]) {
		  if (this.myCells[victim_id]) playSound("merge"); else
		  if (objects[victim_id]){
			var victim = objects[victim_id];
			if(victim.size == 10 && victim.name===""){
				playSound("pellet");
			} else if (victim.isVirus) {
				playSound("virushit");
			} else playSound("eat");
		  }
	  }
	  
      if (this.myCells[victim_id]) {
		playSound("eat");
        delete this.myCells[victim_id];

        // Dead
        if (Object.keys(this.myCells).length == 0) {
          $(".bogart").show(1000);
          $("#form-main").fadeIn(1000);
		  playSound("gameover");
        }
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
          id: id,
          name: name,
          skinName: checkSkin(name),
          x_: x, // Real X
          y_: y, // Real Y
          size_: size, // Real size
          x: x,
          y: y,
          size: size,
          animate: false,
          color: color,
          isVirus: isVirus,
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
	if(this.myCells.length == 0)playSound("spawn");
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
	// mevin1 - Leaderboard team mass fractions
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

    // Minimap
    this.world.mapScaleX = window.mp.width/(w - x);
    this.world.mapScaleY = window.mp.height/(h - y);
    break;

  case 72:
    // Server sent HelloHelloHello initialization message
    break;

  default:
    console.log("Unknown msg", e);
  }
};

function checkSkin(name) {
  // 
  if (name.length == 0) {
    return null;
  }

  // Lower case
  name = name.toLowerCase();

  // Clan tags
  var start = name.indexOf('[');
  if (start != -1) {
    var end = name.indexOf(']',start);
    if (end != -1) {
      name = name.substring(start + 1,end);
    }
  }

  // Check if skins exist
  if (window.skins[name]) {
    // Get skin name
    if (window.skins[name] == 1) {
      // Request skin if image doesnt exist
      window.skins[name] = new Image();
      window.skins[name].src = "http://skins.agariomods.com/i/" + name + ".png";
    }

    return name;
  }

  return null;
}

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

  if (this.skinName && !window.settings.hideSkins) {
    ctx.save();
    ctx.clip();
    ctx.drawImage(window.skins[this.skinName],this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    ctx.restore();
  }
  
  // Draw Outline
  ctx.stroke();

  // Minimap
  if (!window.settings.hideMap) {
    var minimap = window.minimap;
    minimap.beginPath();
    minimap.strokeStyle = this.color;
    minimap.arc(this.x * window.world.mapScaleX, this.y * window.world.mapScaleY, this.size * window.world.mapScaleX, 0, 2*Math.PI);
    minimap.fillStyle = window.spec.myCells[this.id] ? '#FFFFFF' : this.color;
    minimap.fill();
  }
  
  // Draw name
  var h = 0;
  ctx.fillStyle = '#FFFFFF';
  if (this.name.length > 0 && !window.settings.hideNames) {
    h = Math.max(.5 * this.size,20); // name size
    ctx.font = 'bold ' + h + 'pt Calibri';
    ctx.fillText(this.name, this.x-(ctx.measureText(this.name).width / 2), this.y + (h/4));
  }
  
  // Draw mass
  if (window.spec.myCells[this.id] && !window.settings.hideMass) {
    var fh = Math.max(h/2,10); // font height
    ctx.font = fh + 'pt Sans Serif';
    var mass = ((this.size * this.size)/100 >> 0);
    ctx.fillText('' + mass, this.x-(ctx.measureText(mass).width / 2), this.y + fh + (h/3));
  }
  return mass; // For calculating total mass
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

// Sound Effects Stuff
// Stolen from Agariomods 2.0
// SFX stored in localstorage because idk

var sounds = ["bounce","eat","gameover","merge","pellet","spawn","split","virusfeed","virushit","virusshoot"];

//Decode audio
function b64toBlob(b64Data){//, contentType, sliceSize) {
	var contentType = "audio/ogg";
    //contentType = contentType || '';
    var sliceSize = /*sliceSize ||*/ 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return URL.createObjectURL(blob);
}
function loadSFX(){
	var audioUrls = {};
	for(var i=0;i<sounds.length;i++){
		var sound = new Audio(b64toBlob(window.localStorage.getItem(sounds[i])));
		sound.volume = 1;
        sound.loop = false;
		sound.onended = function(){
			this.src = "";
			jQuery(this).remove();
		}
		audioUrls[sounds[i]] = sound;
	}
	sounds = audioUrls;
}
function playSound(name){
	if(!sounds.hasOwnProperty(name))return;
	var sound = sounds[name].cloneNode();
	sound.play();
}
if(!localStorage.sfxCached){
	var audioRequest = new XMLHttpRequest();
	audioRequest.onreadystatechange = function() {
		if (audioRequest.readyState == 4 && audioRequest.status == 200) {
			var encoding = audioRequest.responseText.split(",");
			audioRequest.responseText = "";
			for(var i=0;i<sounds.length;i++){
				window.localStorage.setItem(sounds[i],encoding[i]);
				delete encoding[i];
			}
			loadSFX();
			window.localStorage.sfxCached = true;
		}
	};
	audioRequest.open("GET", "sfx.csv", true);
	//audioRequest.open("GET", "http://kelvin.onl/agario/sfx.txt", true);
	audioRequest.send();
} else {
	loadSFX();
}