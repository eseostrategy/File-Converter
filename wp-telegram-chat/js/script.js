jQuery(document).ready(function($) {
    var sessionId = localStorage.getItem('wtc_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('wtc_session_id', sessionId);
    }

    var lastMessageId = 0;
    var isOpen = false;

    $('#wtc-chat-toggle').on('click', function() {
        isOpen = !isOpen;
        $('#wtc-chat-widget').toggle();
        if (isOpen) {
            pollMessages();
            scrollToBottom();
        }
    });

    $('#wtc-send-btn').on('click', sendMessage);
    $('#wtc-chat-input').on('keypress', function(e) {
        if (e.which == 13) sendMessage();
    });

    function sendMessage() {
        var message = $('#wtc-chat-input').val().trim();
        if (!message) return;

        // Clear input immediately
        $('#wtc-chat-input').val('');

        $.ajax({
            url: wtc_ajax.rest_url + 'send',
            method: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-WP-Nonce', wtc_ajax.nonce);
            },
            contentType: 'application/json',
            data: JSON.stringify({
                message: message,
                session_id: sessionId
            }),
            success: function(response) {
                // Sent successfully
            },
            error: function() {
                alert('Error sending message');
            }
        });
    }

    function appendMessage(sender, text) {
        var className = sender === 'user' ? 'user' : 'admin';
        var html = '<div class="wtc-message ' + className + '">' + escapeHtml(text) + '</div>';
        $('#wtc-chat-messages').append(html);
        scrollToBottom();
    }

    function scrollToBottom() {
        var chatDiv = document.getElementById("wtc-chat-messages");
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function pollMessages() {
        if (!isOpen) return;

        $.ajax({
            url: wtc_ajax.rest_url + 'messages',
            method: 'GET',
            data: {
                session_id: sessionId,
                last_id: lastMessageId
            },
            success: function(data) {
                if (data && data.length > 0) {
                    data.forEach(function(msg) {
                        if (msg.id > lastMessageId) {
                            appendMessage(msg.sender, msg.message);
                            lastMessageId = Math.max(lastMessageId, msg.id);
                        }
                    });
                }
            },
            complete: function() {
                if (isOpen) {
                    setTimeout(pollMessages, 3000);
                }
            }
        });
    }
});
