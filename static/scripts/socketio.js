jQuery(document).ready(() => {
    var socket = io();
    let room = "general";
    joinRoom("general");

    // Display message
    socket.on("message", (data) => {
        // const p = document.createElement("p");
        // const span_username = document.createElement("span");
        // const span_timestamp = document.createElement("span");
        // const br = document.createElement("br");
        // if (data.username) {
        //     span_username.innerHTML = data.username;
        //     span_timestamp.innerHTML = data.time_stamp;
        //     p.innerHTML =
        //         span_username.outerHTML +
        //         br.outerHTML +
        //         data.msg +
        //         br.outerHTML +
        //         span_timestamp.outerHTML;
        //     document.querySelector("#display-message-section").append(p);
        // } else {
        //     printSysMsg(data.msg);
        // }
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

    // Send message
    // document.querySelector("#send-message").onclick = () => {
    //     str = document.querySelector("#user-message").value;
    //     if (!(str.length == 0 || str.replace(/\s/g, "").length == 0)) {
    //         socket.send({
    //             msg: document.querySelector("#user-message").value,
    //             username: username,
    //             room: room,
    //         });
    //         document.querySelector("#user-message").value = null;
    //     }
    // };

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

    // Room selection
    // document.querySelectorAll(".select-room").forEach((p) => {
    //     p.onclick = () => {
    //         let newRoom = p.innerHTML;
    //         if (newRoom == room) {
    //             msg = `You are already in the ${room} room.`;
    //             printSysMsg(msg);
    //         } else {
    //             leaveRoom(room);
    //             joinRoom(newRoom);
    //             room = newRoom; //update room
    //         }
    //     };
    // });

    jQuery(".select-room").each((index) => {
        $(".select-room")
            .eq(index)
            .on("click", function () {
                let newRoom = $(".select-room").eq(index).text();
                if (newRoom == room) {
                    msg = `You are already in the ${room} room.`;
                    printSysMsg(msg);
                } else {
                    leaveRoom(room);
                    joinRoom(newRoom);
                    room = newRoom; //update room
                }
            });
    });

    //Leave room func

    function leaveRoom(room) {
        socket.emit("leave", { username: username, room: room });
    }

    //Leave join func

    function joinRoom(room) {
        socket.emit("join", { username: username, room: room });
        jQuery("#display-message-section").html("");
        jQuery("#user-message").focus();
    }

    //Print system message

    function printSysMsg(msg) {
        const noti = jQuery("<p></p>");
        noti.text(msg);
        jQuery("#display-message-section").append(noti);
    }
});
