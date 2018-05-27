let player;
let video_id;
let socket;
let param;
let remotePlayedVideo = false;
let remotePausedVideo = false;

window.onload = function() {
    socket = io();

    homeHandler();
    socketEventsHandler();
    loadPageMode();
};

function homeHandler() {
    $("#home a").on('click',()=>{
        socket.emit('leaveRoom',video_id);
        hideElement($("#home, #player, .room-link"), ()=>{
            $("#player").remove();
            loadForm();

            player = undefined;
        });

        try {
            event.preventDefault();
        }
        catch (e) {}
    });
}

function socketEventsHandler() {
    socket.on('joinResult', (response)=>shareLink(response));
    socket.on('videoPlaying', function (data) {
        remotePlayedVideo = true;
        player.seekTo(data, true);
        player.playVideo();
    });
    socket.on('videoPaused', function (data) {
        remotePausedVideo = true;
        player.pauseVideo();
        player.seekTo(data, true);
    });
    socket.on('message', (data)=>{
        alert(`[${data.from}]: ${data.message}`);
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
            dontYouMissHome(
                // on Complete
                onYoutubePlayerAPIReady
            );
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

function dontYouMissHome(onComplete=null){
    showHiddenElement($('#home'), onComplete);
}

function loadForm(){
    showHiddenElement($("#inputURL"));
    showHiddenElement($(".search:not('.search button')"), ()=>{
        showHiddenElement($(".search button"));
        $("#inputURL").focus();
    });
}

function copyValueToClipboard(element, event) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();

    try {
        event.preventDefault();
    }
    catch (e) {}
}

function shareLink (response){
    let port = window.location.port === ":"?`:${window.location.port}`:'';
    let domainURL = `${window.location.host}${port}/`;

    $(".room-link input").val(`${domainURL}?${response.param}`);
    $('.room-link a').on('click', (event)=>copyValueToClipboard($('.room-link input'), event));
}

function processURL(){
    let inputURL = $('#inputURL').val();

    hideElement($(".search"), ()=>{
        hideElement($(".search button"));
        createYTVideoPlayer(inputURL);
        newRoomEventHandler();

        showHiddenElement($('#home'));
    });

    return false;
}

function hideElement(element, onComplete = null){
    $(element).hide('slow', onComplete);
}

function showHiddenElement(element, onComplete = null) {
    $(element).show("slow",onComplete);
}

function createYTVideoPlayer(videoURL){
    $('#dialog').modal('show');
    $(".home").append($("<div id='player' class='hidden'></div>"));

    if (~videoURL.indexOf('youtu.be')){
        // youtu.be/ASDgasd76gk
        video_id = videoURL.substring(videoURL.lastIndexOf('/')+1);


    }
    else if (~videoURL.indexOf('v=')){
        // youtube.com/v=ASDgasd76gk
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
    newRoomEventHandler();
    $('#dialog').on('hidden.bs.modal', function (e) {
        showHiddenElement($("#player"));
        showHiddenElement($(".room-link"));
    });

    $('#dialog').modal("hide");
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (!remotePlayedVideo) {
            socket.emit('videoPlaying', player.getCurrentTime());
        }
        else
            remotePlayedVideo = false;
    }
    else if (event.data === YT.PlayerState.PAUSED) {
        if (!remotePausedVideo) {
            socket.emit('videoPaused', player.getCurrentTime());
        }
        else
            remotePausedVideo = false;
    }
}

function showMembersInCurrentRoom() {
    let members = getSocketsIdInCurrentRoom();
    members.then((socketIDs)=>{
        socketIDs.forEach((elemID)=> {
            $('#members').append($(`<li>${elemID}</li>`));
        });
    });
}

function sendMessage(message) {
    socket.emit('message',message);
}

function getSocketsIdInCurrentRoom() {
    let data = { id: video_id};
    return new Promise((resolve)=>{
        $.ajax({
            url: 'http://localhost/api/v1/getSocketsInRoom',
            data: data,
            success: (result)=>{
                return resolve(result);
            }
        });
    });
}