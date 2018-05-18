let player;
let video_id;
$(document).ready(function () {
    socketio.emit('newClient','hello!');
});

function processURL(socket){
    console.log(socket);
    let inputURL = $('#inputURL').val();


    $(".search").hide('slow');

    let parameters =`src='${inputURL}' frameborder='0' allowfullscreen`;
    let iframeElement = $(`<iframe ${parameters}></iframe>`);
    // <iframe src="http://www.youtube.com/embed/oHg5SJYRHA0?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>

    // $('.main-div').append(iframeElement);
    $(".search").remove();
    createYTVideoPlayer(inputURL);

    socket.emit('newLobby', video_id);

    socket.on('joinResult', function (data) {
       console.log(data.room);
    });

    return false;
}

function createYTVideoPlayer(videoURL){
    video_id = videoURL.split('v=')[1];
    let ampersandChar = video_id.indexOf('&');
    ampersandChar = ampersandChar!==-1?ampersandChar:video_id.length;
    video_id = video_id.substring(0,ampersandChar);

    $('.main-div').append($(`<div id='player'></div>`));
    $('.main-div').append($(`<script src='http://www.youtube.com/player_api'></script>`));

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: video_id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// autoplay video
function onPlayerReady(event) {
    event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        alert("Playing..");
    }
    else if (event.data === YT.PlayerState.PAUSED) {
        alert("Paused..");
    }
}
