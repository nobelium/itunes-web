function handleFiles(files){
var i = 0;
(function(){
ID3v2.parseFile(files[i],render_song)
if(++i < files.length) setTimeout(arguments.callee, 5000);
	 })();
}



function render_song(tags){
	 console.log(tags);
	 $('album_art').src = tags.pictures.length?tags.pictures[0].dataURL:'sad.jpg';
	 $('title').innerHTML = tags.Title;
	 $('album').innerHTML = tags.Album
	 $('artist').innerHTML = tags['Artist']
}





var arr = [],
$ = function(id) {return document.getElementById(id); },
$T = function(tag) {return document.getElementsByTagName(tag); },
$C = function(c) {return document.getElementsByClassName(c); },
playlist = $("plist"),
search_debouncer,
playing;
var curr_playing = undefined;


var timer = function(n) {
    var x = [], str = "";
    x[0] = Math.floor(n /3600);
    x[1] = Math.floor((n/60)%60);
    x[2] = Math.floor(n%60);
    
    for(var i=0;i<3;++i) {
	if(x[i].toString().length == 1)
	    str += "0";
	str += x[i].toString() + ":";
    }
    str = str.substring(0,str.length-1);
    return str;
};

var Player = function() {
    var pl = $T("audio")[0],
    that = this;
    this.state = "na";
    this.setSrc = function(src) {
	pl.src = src;
    };
    this.play = function() {
	pl.play();
	$("pause_button").style.display = "inline-block";
	$("play_button").style.display = "none";
	setInterval(updateTimer,100);
    };
    this.pause = function() {
	pl.pause();
	$("play_button").style.display = "inline-block";
	$("pause_button").style.display = "none";
    };
    this.perform = function(ac) {
	switch(ac) {
	case "play":
	    this.state = "play";
	    play();
	    break;
	case "pause":
	    this.state = "pause";
	    this.pause();
	    break;
	case "rewind":
	    if(this.state == "rewind")
		this.perform("play");
	    else {
		this.state = "rewind";
		$T("audio")[0].currentTime -= 10;
		console.log("So, you wwant me to rewind?");
	    }
	    break;
	case "forward":
	    if(this.state == "forward")
		this.perform("play");
	    else {
		this.state = "forward";
		console.log("So, you wwant me to forward?");
	    }
	    break;
	};
    };
    return that;
},
player = new Player();

var updateTimer = function() {
    var p_sec = Math.ceil($T("audio")[0].currentTime);
    $("seeker").innerHTML = $("title").innerHTML + "<br />";
    $("seeker").innerHTML += timer(p_sec) + " out of " + timer($T("audio")[0].duration);

};

var Button = function(str) {
    var name = str,
    div = document.createElement("div"),
    img = document.createElement("img");
    div.setAttribute("id", name + "_button");
    img.setAttribute("height","");
    img.setAttribute("src","./images/" + name + ".png");
    div.appendChild(img);
    
    $("buttons").appendChild(div);
    setButtonEvents(name);
};

var setButtonEvents = function(elem) {
    var el = $(elem + "_button")
    el.onmouseover = function() {
	this.children[0].src = "./images/" + elem + "_hover.png";
    };
    el.onmouseout = function() {
	this.children[0].src = "./images/" + elem + ".png";
    };
    el.onmousedown = function() {
	this.children[0].src = "./images/" + elem + "_click.png";
    };
    el.onmouseup = function() {
	this.children[0].src = "./images/" + elem + "_hover.png";
	player.perform(elem);
    };

};

new Button("rewind");
new Button("play");
new Button("pause");
new Button("forward");
$("pause_button").style.display = "none";



var startRead = function() {
    var files = $("upfile").files;
    arr = {}, count = 0;
    playlist.innerHTML = "";
    for(var i=0;i<files.length; ++i) {
	if(files[i].type == "audio/mp3") {
	    arr[count++] = files[i];
	}
    }
    $("upfile").value = "";
    refreshDisplay(arr);
};

var refreshDisplay = function(arr) {
    var str = "", flag = true;
    str += "<div class='list'>";
    console.log("refreshing now....");
    for(var i in arr) {
	str+= "<div id='i" + i + "' class='song " + (flag?"iBl" : "iWhite") + "'>" + arr[i].name + "</div>";
	console.log(i);
	flag = !flag;
    }
    str += "</div>";
    playlist.innerHTML = str;
    resetEventHandlers();
    window_resize();
};

var play = function(id) {
    return function() {
	var index = id.substring(1,id.length);
	player.setSrc(window.webkitURL.createObjectURL(arr[index]));

	ID3v2.parseURL(window.webkitURL.createObjectURL(arr[index]), render_song)

	player.play();
    };
};

var resetEventHandlers = function() {
    var songs = $C("song");
    for(i=0;i<songs.length; ++i) {
	songs[i].onclick = play(songs[i].id);
    }
};

var search_debounce = function() {
    clearTimeout(search_debouncer);
    search_debouncer = setTimeout(search, 300);
};

var search = function() {
    var new_arr = [];
    for(i in arr) {
	if(arr[i].name.toLowerCase().indexOf( $("search_box").value.toLowerCase() ) != -1)
	    new_arr[i] = arr[i];
    }
    if($("search_box").value == "") new_arr = arr;

    refreshDisplay(new_arr);
};

var window_resize = function() {
    $("plist").style.height = (window.innerHeight - 70) + "px";
};

window.onresize = window_resize;
$("upfile").onclick = function() {console.log("hi"); };
$("upfile").onchange = startRead;
$("search_box").onkeyup = search_debounce;

window_resize();
