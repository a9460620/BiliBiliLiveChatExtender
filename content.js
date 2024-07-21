window.addEventListener('message', function(event) {
    try {
        console.log("Content script 收到消息:", event.data);
        if (event.source == window && event.data.type == 'sendDanmu') {
            chrome.runtime.sendMessage(event.data);
        }
    } catch (error) {
    }
});
