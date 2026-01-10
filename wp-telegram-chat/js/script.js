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
                        // Only append if we haven't already (though last_id handles this)
                        if (msg.id > lastMessageId) {
                            // If it's a user message, we might have already shown it optimistically.
                            // But usually we want to confirm it.
                            // However, since we show optimistic UI for user, let's only append ADMIN messages
                            // OR avoid duplicates logic.
                            // Simple logic: Load ALL history on first open?
                            // Currently we just poll new ones.

                            // Let's assume on first load `lastMessageId` is 0, so we load everything.
                            // If we already showed user message optimistically, we might duplicate it if we load it from DB.
                            // To fix: In optimistic UI, maybe don't append? Or clear and reload?
                            // Better: Check if element exists? No, text might be same.

                            // For simplicity, let's just append ONLY if sender is admin,
                            // because user messages are appended immediately.
                            // WAIT: If user refreshes page, history is lost in UI but exists in DB.
                            // So we DO need to load user messages too.

                            // Conflict: Optimistic UI vs Polling.
                            // Solution: On page load/open, load full history.
                            // For the message just sent, the poll will return it.
                            // We can check if the last message in DOM matches this one?

                            // Let's just append everything that comes from DB.
                            // AND remove the optimistic append? No, that feels slow.
                            // Okay, let's keep it simple: Append everything. If duplicate user message appears, so be it for this basic version.
                            // OR: Only append if `msg.sender === 'admin'`.
                            // But then history is broken on refresh.

                            // Let's refine:
                            // 1. Initial load: Fetch all messages.
                            // 2. Poll: Fetch messages > last_id.
                            // 3. Send: Append optimistically. When poll returns it, we will duplicate.
                            // Fix: When poll returns a 'user' message, check if we have a "pending" message with same text at the end?
                            // Too complex for now.

                            // Current Plan: Just append. User will see their message appear again if polling is fast.
                            // Actually, I'll modify `sendMessage` to NOT append optimistically, just wait for poll?
                            // Or append optimistically and then ignore 'user' messages from poll?
                            // But on refresh, we need 'user' messages.

                            // Best compromise: Appending optimistically is good UX.
                            // Ignoring 'user' messages in poll is risky if optimistic failed.

                            // Let's just use polling for everything. It might have 1 sec delay but ensures consistency.
                            // Removing optimistic UI for now to ensure consistency.

                            // appendMessage(msg.sender, msg.message);
                        }

                        // Actually, I'll allow optimistic, but in the poll loop:
                        // If I see a message from 'user' that I just sent...
                        // Let's just render everything from server.
                        // I will remove the optimistic append in `sendMessage` to avoid complexity.

                        appendMessage(msg.sender, msg.message);
                        lastMessageId = Math.max(lastMessageId, msg.id);
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
