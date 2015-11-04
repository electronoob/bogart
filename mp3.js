var tracks = new Array();
tracks.push({filename: 'BotB 17936 Isolation Tank.mp3',                         avatar: 'malmen.png',       artist: 'malmen',           name: 'Isolation Tank'});
tracks.push({filename: 'BotB 17934 bubblybubblebubblingbubbles.mp3',            avatar: 'pedipanol.png',    artist: 'pedipanol',        name: 'bubblybubblebubblingbubbles'});
tracks.push({filename: 'BotB 17935 bloblobloblboblbolboblboblbobolbloblob.mp3', avatar: 'electronoob.png',  artist: 'electronoob',      name: 'bloblobloblboblbolboblboblbobolbloblob'});
tracks.push({filename: 'BotB 17937 Woofytunes.mp3',                             avatar: 'ryan2000.png',     artist: 'Ryan2000',         name: 'Woofytunes'});
tracks.push({filename: 'BotB 17938 slowgrow.mp3',                               avatar: 'aji.png',          artist: 'aji',              name: 'slowgrow'});
tracks.push({filename: 'BotB 18549 a blob\'s life.mp3',                         avatar: 'stewboy.png',      artist: 'stewboy',          name: 'a blob\'s life'});
tracks.push({filename: 'BotB 18550 war of the orbs.mp3',                        avatar: 'zaalan3.png',      artist: 'Zaalan3',          name: 'war of the orbs'});
tracks.push({filename: 'BotB 18551 blob tower.mp3',                             avatar: 'cessorsafari.png', artist: 'Cessor Safari',    name: 'blob tower'});
tracks.push({filename: 'BotB 19119 blazeon called he wants his ship back.mp3',  avatar: 'kungfufurby.png',  artist: 'KungFuFurby',      name: 'blazeon called he wants his ship back'});
tracks.push({filename: 'BotB 19120 SOME GAME!!!!!!!!!!!!!!!!!!!!!!!!!!!.mp3',   avatar: 'mega9man.png',     artist: 'mega9man',         name: 'SOME GAME!!!!!!!!!'});
tracks.push({filename: 'BotB 19122 FTS -Faster Than Scrap-.mp3',                avatar: 'a-zu-ra.png',      artist: 'A-zu-ra',          name: 'FTS -Faster than scrap'});
tracks.push({filename: 'BotB 19123 Entry for BOTB\'s OHB contest_ song name is Blidia Sman.mp3', avatar: 'fiv95.png', artist: 'fiv95',  name: 'Blidia Sman'});
tracks.push({filename: 'BotB 19124 litty litty.mp3',                            avatar: 'soda7.png',        artist: 'SoDa7',            name: 'litty litty'});
tracks.push({filename: 'BotB 19125 feel_nothing.mp3',                           avatar: 'uctumi.png',       artist: 'uctumi',           name: 'feel_nothing'});
tracks.push({filename: 'BotB 19126 The Unknown - DEMO.mp3',                     avatar: 'ryan2000.png',     artist: 'Ryan2000',         name: 'The Unknown - DEMO'});
tracks.push({filename: 'BotB 19127 warinspace.mp3',                             avatar: 'electronoob.png',  artist: 'electronoob',      name: 'warinspace'});
/* shout out to savestate of battleofthebits for creating a nice theme and animating the player */

    var currentTrack;

	var bgmusic = new Audio();
	bgmusic.onended = function() {
        mp3player_load_random();
    };
    
    function mp3player_load_random() {
        currentTrack = Math.floor(Math.random() * tracks.length);
        var track = tracks[currentTrack];
        bgmusic.src = "http://skins.agariomods.com/botb/" + track['filename'];
        bgmusic.load();
        bgmusic.loop = false;
        bgmusic.volume = 1.0;
        mp3player_update_ui(track);
        bgmusic.play();
    }
    
    function mp3player_update_ui (track) {
        var container = document.getElementById('mp3player');
        var avatar = document.getElementById('mp3playeravatar');
        var artist = document.getElementById('mp3playerartist');
        var name = document.getElementById('mp3playername');
        mp3player_push_out_text(track);
        setTimeout(function() { 
            mp3player_pull_in_text(track);
        }, 1200);
    }
    
    function mp3player_pull_in_text(track) {
        var avatar = document.getElementById('mp3playeravatar');
        var artist = document.getElementById('mp3playerartist');
        var name = document.getElementById('mp3playername');
        var player = document.getElementById('mp3player');
        avatar.style.backgroundImage = "url('img/" + track.avatar + "')";
        setTimeout(function() { 
            avatar.style.backgroundSize = "90%"; 
            avatar.style.opacity = "1.0"; 
        }, 10);
        setTimeout(function() { 
            name.innerHTML = track.name;
            name.style.left = "0px"; 
            name.style.opacity = "1.0";
        }, 100);
        setTimeout(function() { 
            artist.innerHTML = track.artist;
            artist.style.left = "0px"; 
            artist.style.opacity = "1.0";
        }, 200);
        setTimeout(function() { 
            player.style.opacity = "0.0";
            player.style.bottom = "-80px";
        }, 3500);
        player.style.opacity = "1.0";
        player.style.bottom = "0px";
    }
    
    function mp3player_push_out_text(track) {
        var avatar = document.getElementById('mp3playeravatar');
        var artist = document.getElementById('mp3playerartist');
        var name = document.getElementById('mp3playername');
        setTimeout(function() { 
            avatar.style.backgroundSize = "50%"; 
            avatar.style.opacity = "0.0"; 
        }, 10);
        setTimeout(function() { 
            name.style.left = "500px"; 
            name.style.opacity = "0.0";
        }, 100);
        setTimeout(function() { 
            artist.style.left = "500px"; 
            artist.style.opacity = "0.0";
        }, 200);
    }
    
    window.onload = function() {
        mp3player_load_random();
        setInterval(function(){ 
            var pos = document.getElementById('mp3playerposition');
            var aud_pec = (bgmusic.currentTime/bgmusic.duration)*100;
            pos.style.background = "linear-gradient(to right, #05abe0 " + aud_pec + "%,#87e0fd " + aud_pec + "%,#87e0fd " + aud_pec + "%)";
        }, 100);
    }
