let player;
let video_id;
let socket;
let remotePlayedVideo = false;
let remotePausedVideo = false;

window.onload = function() {
    socket = io();
    let url = document.location.href;
    let params = url.indexOf('?room=') !== -1? url.split('?room=')[1] : -1;

    switch (params){
        case -1:
            // no room joining. loading form
            loadForm();
            break;
        default:
            $('#youtubeAPI').ready(function(){
                if (this.readyState === 'complete') {
                    createYTVideoPlayer(params);
                    socket.emit('joinRoom', params);
                }
            });
    }

    socket.on('videoPlaying', function (data) {
        remotePlayedVideo = true;
        player.playVideo();

    });
    socket.on('videoPaused', function (data) {
        remotePausedVideo = true;
        player.pauseVideo();
    });
};
function dontYouMissHome(){
    $('.home').removeClass('invisible');
}

function loadForm(){
    $('.invisible:not(".home")').toggleClass('invisible');
}

function copyValueToClipboard(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}

function newRoomEventHandler() {
    socket.emit('joinRoom', video_id);

    socket.on('joinResult', function (response) {
        $(".main-div").append(`
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-md-7 offset-md-2 room-link">
                                            <input value="${response.url}" readonly />
                                            <a href="#">Copy me!</a>
                                        </div>
                                     </div>
                                </div>
        `);
        $('.room-link a').on('click', ()=>copyValueToClipboard($('.room-link input')));
    });
}

function processURL(){
    console.log(socket);
    let inputURL = $('#inputURL').val();


    $(".search").hide('slow');

    let parameters =`src='${inputURL}' frameborder='0' allowfullscreen`;
    let iframeElement = $(`<iframe ${parameters}></iframe>`);
    // <iframe src="http://www.youtube.com/embed/oHg5SJYRHA0?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>

    // $('.main-div').append(iframeElement);
    $(".search").remove();
    createYTVideoPlayer(inputURL);
    newRoomEventHandler();
    return false;
}

function createYTVideoPlayer(videoURL){
    $('#dialog').modal('show');
    let roomJoin = videoURL.indexOf('v=') === -1;
    if (!roomJoin){
        video_id = videoURL.split('v=')[1];
        let ampersandChar = video_id.indexOf('&');
        ampersandChar = ampersandChar!==-1?ampersandChar:video_id.length;
        video_id = video_id.substring(0,ampersandChar);
    }
    else {
        video_id = videoURL;
    }

    // $('.main-div').append($(`<div id='player'></div>`));
    // $('.main-div').append($(`<script src='http://www.youtube.com/player_api'></script>`));

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: video_id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    dontYouMissHome();
}

// autoplay video
function onPlayerReady(event) {
    $('#dialog').modal("hide")

    // event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (!remotePlayedVideo) {
            socket.emit('videoPlaying', true);
        }
        else
            remotePlayedVideo = false;
    }
    else if (event.data === YT.PlayerState.PAUSED) {
        if (!remotePausedVideo) {
            socket.emit('videoPaused', true);
        }
        else
            remotePausedVideo = false;
    }
}