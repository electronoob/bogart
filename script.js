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

  var d;

  // Translate
  if (spec) {
    offsetX = ((width/2) / scale_x) - spec.x; 
    offsetY = ((height/2) / scale_y) - spec.y;
    ctx.translate(offsetX,offsetY);
  }

  var objects = world.objects;
  for (var id in objects) {
    if (objects.hasOwnProperty(id)) {
      var o = objects[id];
      o.draw(ctx);
      /*
      var x = o.x;
      var y = o.y;

      if (o.isVirus) {
        ctx.setLineDash([5,5]);
        // Virus outline
        ctx.beginPath();
        ctx.strokeStyle = o.color;
        ctx.arc(x, y, o.size, 0, 2*Math.PI);
        ctx.stroke();
        // Virus color
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = o.color;
        ctx.fill();
      } else {
        ctx.setLineDash([]);

        // Begin circle outline
        ctx.beginPath();
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 5; // Test
        ctx.arc(x, y, o.size, 0, 2*Math.PI);
        
        // Draw white cell background
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Draw cell color over the white background
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = o.color;
        ctx.fill();

        // Reset Alpha
        ctx.globalAlpha = 1.0;
        
        // Draw Outline
        ctx.stroke();
      }
      
      // Draw name/mass
      if (o.size > 20 && !o.isVirus) {
        // Height variable
        var h = 0;
        ctx.fillStyle = '#FFFFFF';

        // Draw name
        if (o.name.length > 0) {
          h = Math.max(.5 * o.size,20); // name size
          ctx.font = 'bold ' + h + 'pt Calibri';
          ctx.fillText(o.name, x-(ctx.measureText(o.name).width / 2), y + (h/4));
        }
        
        // Draw mass
        var fh = Math.max(h/2,10); // font height
        ctx.font = fh + 'pt Sans Serif';
        var mass = '' + ((o.size * o.size)/100 >> 0);
        ctx.fillText(mass, x-(ctx.measureText(mass).width / 2), y + fh + (h/3));
      }
      */
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
