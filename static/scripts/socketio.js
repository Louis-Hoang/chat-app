const initialMessages = {
    General: [],
    Outdoor: [],
    Film: [],
    Game: [],
    Study: [],
};

function sendMessage() {}
jQuery(document).ready(() => {
    var socket = io();
    let room = "General";
    joinRoom("General");

    socket.on("message", (data) => {
        const text_msg = jQuery("<p class='chat-msg'></p>");
        const span_username = jQuery("<div class='username-msg'></div>");
        const span_timestamp = jQuery("<div class='time-msg'></div>");
        const user_info = jQuery("<div class='user-info'></div>");
        user_info.append(span_username, span_timestamp);

        if (data.username) {
            span_username.text(data.username);
            span_timestamp.text(data.time_stamp);
            text_msg.text(data.msg);
            jQuery("#display-message-section").append(user_info);
            jQuery("#display-message-section").append(text_msg);
        } else {
            printSysMsg(data.msg);
        }
    });

    socket.on("reset-user", () => {
        location.reload();
    });

    jQuery("#send-message").click(function () {
        str = jQuery("#user-message").val();
        if (!(str.length == 0 || str.replace(/\s/g, "").length == 0)) {
            socket.send({
                msg: str,
                username: username,
                room: room,
            });
            jQuery("input").val(null);
        }
    });

    // Test
    // jQuery("#new-room").click(function () {
    //     str = jQuery("#newroom-name").val();
    //     if (!(str.length == 0 || str.replace(/\s/g, "").length == 0)) {
    //         socket.emit("newroom", { username: username, room: str });
    //         jQuery("input").val(null);
    //     }
    // });

    //Test end

    let msg_display = false; //avoid duplicate noti

    jQuery(".select-room").each((index) => {
        jQuery(".select-room")
            .eq(index)
            .on("click", function () {
                let newRoom = $(".select-room").eq(index).text();
                if (newRoom != room) {
                    leaveRoom(room);
                    joinRoom(newRoom);
                    room = newRoom;
                    msg_display = false; //update room
                } else {
                    msg = `You are already in the ${room} room.`;
                    if (!msg_display) {
                        printSysMsg(msg);
                        msg_display = true;
                    }
                }
            });
    });

    jQuery("#logout-btn").on("click", () => {
        socket.emit("logout", { username: username });
    });
    //Leave room func

    function leaveRoom(room) {
        socket.emit("leave", { username: username, room: room });
        jQuery(`#${room}`).removeClass("active-room");
    }

    //Leave join func

    function joinRoom(room) {
        socket.emit("join", { username: username, room: room });
        jQuery("#display-message-section").html("");
        jQuery("#user-message").focus();
        jQuery(`#${room}`).addClass("active-room");
    }

    //Print system message

    function printSysMsg(msg) {
        const noti = jQuery("<p></p>");
        noti.text(msg);
        jQuery("#display-message-section").append(noti);
    }
});
