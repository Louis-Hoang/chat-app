document.addEventListener("DOMContentLoaded", () => {
    var socket = io();
    let room = "general";
    joinRoom("general");

    // Display message
    socket.on("message", (data) => {
        const p = document.createElement("p");
        const span_username = document.createElement("span");
        const span_timestamp = document.createElement("span");
        const br = document.createElement("br");

        if (data.username) {
            span_username.innerHTML = data.username;
            span_timestamp.innerHTML = data.time_stamp;
            p.innerHTML =
                span_username.outerHTML +
                br.outerHTML +
                data.msg +
                br.outerHTML +
                span_timestamp.outerHTML;
            document.querySelector("#display-message-section").append(p);
        } else {
            printSysMsg(data.msg);
        }
    });

    // Send message
    document.querySelector("#send-message").onclick = () => {
        socket.send({
            msg: document.querySelector("#user-message").value,
            username: username,
            room: room,
        });
        document.querySelector("#user-message").value = null;
    };

    // Room selection
    document.querySelectorAll(".select-room").forEach((p) => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (newRoom == room) {
                msg = `You are already in the ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom; //update room
            }
        };
    });

    //Leave room func

    function leaveRoom(room) {
        socket.emit("leave", { username: username, room: room });
    }

    //Leave join func

    function joinRoom(room) {
        socket.emit("join", { username: username, room: room });
        document.querySelector("#display-message-section").innerHTML = "";
        document.querySelector("#user-message").focus();
    }

    //Print system message

    function printSysMsg(msg) {
        const p = document.createElement("p");
        p.innerHTML = msg;
        document.querySelector("#display-message-section").append(p);
    }
});
