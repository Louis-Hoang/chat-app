jQuery(document).ready(() => {
    var socket = io();
    let room = "General";
    joinRoom("General");

    // Display message
    socket.on("message", (data) => {
        const text_msg = jQuery("<p class='chat-msg'></p>");
        const span_username = jQuery("<span class='username-msg'></span>");
        const span_timestamp = jQuery("<span class='time-msg'></span>");
        const br = jQuery("<br></br>");
        if (data.username) {
            span_username.text(data.username);
            span_timestamp.text(data.time_stamp);
            var content =
                span_username.prop("outerHTML") +
                br.prop("outerHTML") +
                data.msg +
                br.prop("outerHTML") +
                span_timestamp.prop("outerHTML");
            text_msg.html(content);
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

    // function select_room(event) {
    //     let newRoom = $(".select-room").eq(event.data.index).text();
    //     if (newRoom == room) {
    //         msg = `You are already in the ${room} room.`;
    //         printSysMsg(msg);
    //         jQuery(".select-room").eq(event.data.index).unbind("click");
    //     } else {
    //         jQuery("#General").bind("click", select_room);
    //         leaveRoom(room);
    //         joinRoom(newRoom);
    //         room = newRoom; //update room
    //     }
    // }

    // jQuery(".select-room").each((room_num) => {
    //     jQuery(".select-room")
    //         .eq(room_num)
    //         .on("click", { index: room_num }, select_room);
    // });

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
