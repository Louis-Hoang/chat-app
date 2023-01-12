function sendMessage() {}
jQuery(document).ready(() => {
    var socket = io();
    let room = "General";
    joinRoom("General");

    socket.on("reset-user", () => {
        window.location.reload();
        console.log("im reload");
    });

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
                msg: str,
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
                let newRoom = jQuery(".select-room").eq(index).text();
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

    if (jQuery(".select-person").length) {
        jQuery(".select-person").each((index) => {
            jQuery(".select-person")
                .eq(index)
                .on("click", () => {
                    let once = false;
                    socket.emit("request-private");
                    socket.on("chat-list", (data) => {
                        if (!once) {
                            let bool = false;
                            let private_chat = data;
                            receiver = jQuery(".select-person")
                                .eq(index)
                                .attr("id");
                            for (const elem of private_chat) {
                                if (
                                    elem.includes(username) &&
                                    elem.includes(receiver)
                                ) {
                                    leaveRoom(room);
                                    socket.emit("private-chat", {
                                        user1: username, //sender
                                        user2: receiver, //receiver
                                    });
                                    bool = true;
                                    room = elem;
                                    break;
                                }
                            }
                            if (!bool) {
                                newRoom = username + "-" + receiver;
                                leaveRoom(room);
                                socket.emit("private-chat", {
                                    user1: username, //sender
                                    user2: receiver, //receiver
                                });
                                room = newRoom;
                            }
                            jQuery(".select-person")
                                .eq(index)
                                .addClass("active-chat");
                            jQuery("#display-message-section").html("");
                            jQuery("#user-message").focus();
                        }
                        once = true;
                    });
                });
        });
    }

    jQuery("#logout-btn").on("click", () => {
        socket.emit("logout", { username: username });
    });

    //Leave room func

    function leaveRoom(room) {
        socket.emit("leave", { username: username, room: room });
        jQuery(".active-chat").removeClass("active-chat");
    }

    //Leave join func

    function joinRoom(room) {
        socket.emit("join", { username: username, room: room });
        jQuery("#display-message-section").html("");
        jQuery("#user-message").focus();
        jQuery(`#${room}`).addClass("active-chat");
    }

    //Print system message

    function printSysMsg(msg) {
        const noti = jQuery("<p></p>");
        noti.text(msg);
        jQuery("#display-message-section").append(noti);
    }
});
