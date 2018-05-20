let player;
let video_id;
let socket;
let param;
let remotePlayedVideo = false;
let remotePausedVideo = false;

window.onload = function() {
    socket = io();

    socketEventsHandler();
    loadPageMode();
};

function socketEventsHandler() {
    socket.on('joinResult', (response)=>shareLink(response));
    socket.on('videoPlaying', function (data) {
        remotePlayedVideo = true;
        player.playVideo();

    });
    socket.on('videoPaused', function (data) {
        remotePausedVideo = true;
        player.pauseVideo();
    });
}

function newRoomEventHandler() {
    socket.emit('joinRoom', video_id);
}

function loadPageMode() {
    let url = document.location.href;
    param = url.indexOf('?room=') !== -1? url.split('?room=')[1] : -1;
    switch (param){
        case -1:
            // no room joining. loading form
            loadForm();
            break;
        default:
            // loaded from room link
            dontYouMissHome();
            onYoutubePlayerAPIReady();
    }
}

function onYoutubePlayerAPIReady(){
    $('#youtubeAPI').ready(function(){
        if (this.readyState === 'complete') {
            createYTVideoPlayer(param);
            socket.emit('joinRoom', param);
        }
    });
}

function dontYouMissHome(){
    $('#home').removeClass('hidden');
}

function loadForm(){
    $('.hidden:not("#home")').toggleClass('hidden');
}

function copyValueToClipboard(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}

function shareLink (response){
    let port = window.location.port === ""?80:window.location.port;
    let domainURL = `https://${window.location.host}:${port}/`;

    $(".main-div").append(`
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-md-12 room-link">
                                            <input value="" readonly />
                                            <a href="#">Copy me!</a>
                                        </div>
                                     </div>
                                </div>
        `);
    $(".room-link input").val(`${domainURL}?${response.param}`);
    $('.room-link a').on('click', ()=>copyValueToClipboard($('.room-link input')));
}

function processURL(){
    let inputURL = $('#inputURL').val();

    removeElementFromDOM($(".search"));
    createYTVideoPlayer(inputURL);
    newRoomEventHandler();

    $('#home').toggleClass('hidden');
    return false;
}

function removeElementFromDOM(element){
    $(element).hide('slow');
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

function onPlayerReady(event) {
    $('#dialog').modal("hide");
}

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