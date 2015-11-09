var width = 100, height = 100;
var $canvas = null, ctx = null, mp = null, minimap = null,
    $leaderboard = null;

var world = new AgarWorld();
var spec = null;

var offsetX = 0, offsetY = 0;

var skins = {
  "doge":1,
  "poland":1,
  "ayy lmao":1,
  "earth":1,
};

var settings = {
  hideNames: false,
  hideMass: false,
  hideSkins: false,
  hideLeader: false,
  hideMap: false,
};

// Scale
var scale = 0.5, // Rendered Scale 
    scale_ = 0.5, // Animation
    scaleZoom = 1; // Zoom multiplier

world.onleaderschange = function (new_leaders) {
  if ($leaderboard) {
    $leaderboard.html("<p class='leaderboard-header'>Leaderboard</p>");

    new_leaders.forEach(function (leader) {
      if (window.spec.myCells[leader.id]) {
        $leaderboard.append("<li class='leader'>" + leader.name + "</li>");
      } else {
        $leaderboard.append("<li>" + leader.name + "</li>");
      }
      
    });
  }
};

function canvasResizeHandler() {
  width = $(window).width();
  height = $(window).height();
  $canvas[0].width = width;
  $canvas[0].height = height;

  mp.style.top = (height - 210) + "px";
  mp.style.left = (width - 210) + "px";
}

function start() {
  spec = new AgarClient(world, false);

  window.onmousemove=function(e){
    window.spec.mX_ = e.clientX;
    window.spec.mY_ = e.clientY;
  };
  window.onkeydown = function(e){
    var x = e.which || e.keyCode;
    switch(x) {
      case 87: // W
        spec.sendCommand(21);
        break;
      case 32: // Space
        spec.sendCommand(17);
        break;
      case 81: // Q
        spec.sendCommand(18);
        break;
      case 27: // Esc
        $(".bogart").toggle(1000);  
        $("#form-main").fadeToggle(1000);
        break;
    }
  }
  // Zoom
  window.onmousewheel=function(e){
      // Detect zoom
      if (e.wheelDelta > 0) {
        scaleZoom *= 1.1;
      } else {
        scaleZoom *= 0.92;
      }

      // Limits
      scaleZoom = scaleZoom > 2 ? 2 : (scaleZoom < 0.5 ? 0.5 : scaleZoom);
  };
  // Settings
  $('#settings-title').on('mousedown', null, function() {
      $('#form-settings').addClass('draggable').on('mousemove', function(e) {
          $('.draggable').offset({
              top: e.pageY - $('#settings-title').outerHeight() / 2,
              left: e.pageX - $('#settings-title').outerWidth() / 2
          }).on('mouseup', function() {
              $('#form-settings').removeClass('draggable');
          });
      });
      e.preventDefault();
  }).on('mouseup', function() {
      $('.draggable').removeClass('draggable');
  });
  // Checkbox
  $('#hideNames').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideMass').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideSkins').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
  });
  $('#hideLeader').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
    if (settings.hideLeader) {
      $leaderboard.css('display', 'none');
    } else {
      $leaderboard.css('display', 'block');
    }
  });
  $('#hideMap').change(function() {
    settings[$(this).val()] = $(this).prop('checked');
    if (settings.hideMap) {
      $('#minimap').css('display', 'none');
    } else {
      $('#minimap').css('display', 'block');
    }
  });
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

  // Animate Scale
  if (scale_ != scale) {
    scale += (scale_ - scale) / 20.0;
  }

  // Set scale
  ctx.scale(scale,scale);

  if (spec) {
    // Calcualate center
    var cx = 0, cy = 0, size = 0, count = 0;
    for (var i in spec.myCells) {
      if (world.objects[i]) {
        var o = world.objects[i];
        cx += o.x;
        cy += o.y;
        size += o.size;
        count++;
      } 
    }

    // Caculate center if the player is alive
    if (count != 0) {
      // Get center
      spec.x = cx/count;
      spec.y = cy/count;

      // Set base scale
      scale_ = Math.pow(Math.min(64.0 / size, 1), 0.4) * Math.max(window.innerHeight / 1080, window.innerWidth / 1920) * scaleZoom;

      /* trying to add some background movement/parallax
      var bgx = (world.width) - (spec.x * window.scale_x);
      var bgy = (world.height) - (spec.y * window.scale_y);
      document.body.style.backgroundPosition = bgx + "px " + bgy + "px";
      */
    }

    // Translate canvas
    offsetX = ((width/2) / scale) - spec.x; 
    offsetY = ((height/2) / scale) - spec.y;
    ctx.translate(offsetX,offsetY);
  }

  // Minimap
  if (!settings.hideMap) {
    minimap.clearRect(0, 0, mp.width, mp.height);
    minimap.fillStyle = "rgb(0,0,0)";
    minimap.globalAlpha = .6;
    minimap.fillRect(0, 0, mp.width, mp.height);
  }

  // Objects
  var sorted = world.sorted;
  for (var i = sorted.length - 1; i > -1; i--) {
    var o = sorted[i];
    // Draw
    o.draw(ctx);

    // Animation smoothing
    if (o.animate) {
      o.x += (o.x_ - o.x) / 4.0;
      o.y += (o.y_ - o.y) / 4.0;
      o.size += (o.size_ - o.size) / 6.0;
    }
  }

  // Send mouse position if socket is connected
  if (spec.isConnected) {
    // Get mouse positions on canvas
    spec.mX = (spec.mX_ / scale) - offsetX;
    spec.mY = (spec.mY_ / scale) - offsetY;

    // Send positions
    spec.sendDirection();
  }
  
  // Restore
  ctx.restore();

  window.requestAnimationFrame(render);
}

if (typeof window !== "undefined") {
  $(function () {
    $canvas = $("#canvas");
    ctx = $canvas[0].getContext("2d");
    mp = document.getElementById("minimap");
    minimap = mp.getContext("2d");
    $(window).resize(canvasResizeHandler);
    canvasResizeHandler();

    $leaderboard = $("#leaderboard");

    window.requestAnimationFrame(render);

    // Start
    start();

    $("#open").click(function () {
      // Set variables
      var url = $("#url").val();
      spec.nickname = $("#name").val();

      if (world.url == url) {
        // Same server, dont reconnect
        spec.sendNick();
      } else {
        // Different server, lets connect to it
        if (spec.socket) {
          // Close any existing connections first
          spec.end();
        }

        // Connect
        spec.connect(url);

        // Finish
        world.url = url;
      }

      // Close menu
      $(".bogart").hide(1000);  
      $("#form-main").fadeOut(1000);
    });

    // On close
    $("#close").click(function () {
      if (spec !== null) {
        spec.end();
      }

      $("#url").show();
      $("#open").show();
      $("#close").hide();
      world.objects = {};
      names = {};
    });

    // 
    $(".open-settings").click(function () {
      $("#form-settings").toggle(1000);
    });
  });
} else {
  start();
}
