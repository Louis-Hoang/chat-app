jQuery(document).ready(() => {
    var socket = io();
    let room = "General";
    joinRoom("General");

    // Display message
    // socket.on("message", (data) => {
    //     const text_msg = jQuery("<p class='chat-msg'></p>");
    //     const span_username = jQuery("<span class='username-msg'></span>");
    //     const span_timestamp = jQuery("<span class='time-msg'></span>");
    //     const br = jQuery("<br></br>");
    //     if (data.username) {
    //         span_username.text(data.username);
    //         span_timestamp.text(data.time_stamp);
    //         var content =
    //             span_username.prop("outerHTML") +
    //             br.prop("outerHTML") +
    //             data.msg +
    //             br.prop("outerHTML") +
    //             span_timestamp.prop("outerHTML");
    //         text_msg.html(content);
    //         jQuery("#display-message-section").append(text_msg);
    //     } else {
    //         printSysMsg(data.msg);
    //     }
    // });

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

    jQuery("#send-message").click(function () {
        str = jQuery("#user-message").val();
        if (!(str.length == 0 || str.replace(/\s/g, "").length == 0)) {
            socket.send({
                msg: document.querySelector("#user-message").value,
                username: username,
                room: room,
            });
            jQuery("input").val(null);
        }
    });

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
