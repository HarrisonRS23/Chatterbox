
function sendMessage() {
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();

    if (messageText === ''){
        return;
    }
    const messagesDiv = document.getElementById('messages');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.innerHTML = `
                <div class="message-bubble">${messageText}</div>
                <div class="message-time">${time}</div>
            `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    input.value = '';
}

document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
