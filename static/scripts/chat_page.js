$(document).ready(() => {
    $("#user-message").keyup((event) => {
        var code = event.key;
        if (code === "Enter") {
            $("#send-message").click();
            event.preventDefault();
        }
    });
});
