document.addEventListener("DOMContentLoaded", function() {
    const chatbotCircle = document.getElementById('chatbot-circle');
    const chatbox = document.getElementById('chatbox');
    const chatboxClose = document.getElementById('chatbox-close');
    const chatboxInput = document.getElementById('chatbox-input');
    const chatboxMessages = document.getElementById('chatbox-messages');
    const unreadIndicator = document.createElement('div');
    unreadIndicator.classList.add('unread-indicator');
    chatbotCircle.appendChild(unreadIndicator);

    let previousUserTimestampElement = null;
    let previousBotTimestampElement = null;

    chatbox.style.display = 'none';
    chatbotCircle.style.display = 'flex';
    unreadIndicator.style.display = 'none';

    chatbotCircle.addEventListener('click', function() {
        chatbox.style.display = 'flex'; 
        chatbotCircle.style.display = 'none';
        unreadIndicator.style.display = 'none';
    });

    chatboxClose.addEventListener('click', function() {
        chatbox.style.display = 'none'; 
        chatbotCircle.style.display = 'flex'; 
        chatbotCircle.classList.add('pop-up-animation');

        chatbotCircle.addEventListener('animationend', function() {
            chatbotCircle.classList.remove('pop-up-animation');
        }, { once: true });
    });

    chatboxInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && chatboxInput.value.trim() !== '') {
            event.preventDefault();
            const userMessage = document.createElement('div');
            userMessage.classList.add('chatbox-message', 'user-message');
            userMessage.innerHTML = `<span>${chatboxInput.value.trim()}</span>`;
            chatboxMessages.appendChild(userMessage);
            chatboxInput.value = '';
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            addTimestamp(chatboxMessages, 'user');

            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.classList.add('chatbox-message', 'bot-message');
                botMessage.innerHTML = `<img src="images/logo.png" alt="Bot"><span>Thank you for your message!</span>`;
                chatboxMessages.appendChild(botMessage);
                chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

                addTimestamp(chatboxMessages, 'bot');

                if (chatbox.style.display === 'none') {
                    showUnreadIndicator();
                }
            }, 1000);
        }
    });

    function addTimestamp(chatboxMessages, messageType) {
        if (messageType === 'user' && previousUserTimestampElement) {
            previousUserTimestampElement.remove();
        }
        if (messageType === 'bot' && previousBotTimestampElement) {
            previousBotTimestampElement.remove();
        }

        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        if (messageType === 'user') {
            timestampElement.classList.add('user-timestamp');
        } else if (messageType === 'bot') {
            timestampElement.classList.add('bot-timestamp');
        }
        timestampElement.innerText = new Date().toLocaleString('en-US', {
            weekday: 'long', hour: '2-digit', minute: '2-digit',
        });

        chatboxMessages.appendChild(timestampElement);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

        timestampElement.classList.add('pop-up-animation');

        timestampElement.addEventListener('animationend', function() {
            timestampElement.classList.remove('pop-up-animation');
        }, { once: true });

        if (messageType === 'user') {
            previousUserTimestampElement = timestampElement;
        } else if (messageType === 'bot') {
            previousBotTimestampElement = timestampElement;
        }
    }

    function showUnreadIndicator() {
        unreadIndicator.style.display = 'block';
    }
});
