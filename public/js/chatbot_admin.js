let qaData = [];
let qaCount = 0;
let editId = null;

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', loadQA);

function loadQA() {
    fetch('/allQA')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                qaData = data.data;
                renderQATable();
            } else {
                alert('Failed to load Q&A');
            }
        })
        .catch(error => console.error('Error:', error));
}

function renderQATable() {
    const qaTableBody = document.querySelector('#qa-table tbody');
    qaTableBody.innerHTML = '';

    qaData.forEach((qa, index) => {
        const newRow = qaTableBody.insertRow();
        newRow.setAttribute('data-id', qa.qaID);

        const cellNumber = newRow.insertCell(0);
        cellNumber.textContent = index + 1;

        const cellQuestion = newRow.insertCell(1);
        cellQuestion.textContent = qa.Question;

        const cellAnswer = newRow.insertCell(2);
        cellAnswer.textContent = qa.Answer;

        const cellActions = newRow.insertCell(3);
        
        const deleteButton = document.createElement('img');
        deleteButton.src = 'images/delete.png';
        deleteButton.alt = 'Delete';
        deleteButton.title = 'Delete';
        deleteButton.classList.add('action-icon');
        deleteButton.onclick = () => deleteQA(qa.qaID, newRow);
        cellActions.appendChild(deleteButton);
        
        const editButton = document.createElement('img');
        editButton.src = 'images/edit.png';
        editButton.alt = 'Edit';
        editButton.title = 'Edit';
        editButton.classList.add('action-icon');
        editButton.onclick = () => editQA(qa.qaID, newRow);
        cellActions.appendChild(editButton);
    });

    qaCount = qaData.length;
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();

    if (messageText !== '') {
        displayMessage(messageText, 'user-message');
        userInput.value = '';

        const botResponse = getBotResponse(messageText);
        setTimeout(() => {
            displayMessage(botResponse, 'bot-message');
        }, 500);
    }
}

function displayMessage(message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addQA() {
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (question !== '' && answer !== '') {
        const url = editId ? `/editQA/${editId}` : '/addQA';
        const method = editId ? 'PUT' : 'POST';
        const successMessage = editId ? 'edited' : 'added';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (editId) {
                    const qaIndex = qaData.findIndex(qa => qa.qaID === editId);
                    if (qaIndex !== -1) {
                        qaData[qaIndex].Question = question;
                        qaData[qaIndex].Answer = answer;
                        renderQATable();
                        editId = null;
                    }
                } else {
                    qaData.push({ Question: question, Answer: answer, qaID: data.id });
                    renderQATable();
                }
                questionInput.value = '';
                answerInput.value = '';
                document.querySelector('button[onclick="addQA()"]').textContent = 'Add Q&A';
            } else {
                alert(`Failed to ${successMessage} Q&A`);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function editQA(id, row) {
    const cells = row.cells;
    document.getElementById('question').value = cells[1].textContent;
    document.getElementById('answer').value = cells[2].textContent;

    editId = id;
    document.querySelector('button[onclick="addQA()"]').textContent = 'Save Changes';
}

function deleteQA(id, row) {
    fetch(`/deleteQA/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            row.remove();
            qaData = qaData.filter(qa => qa.qaID !== id);
            renderQATable();
        } else {
            alert('Failed to delete Q&A');
        }
    })
    .catch(error => console.error('Error:', error));
}

function getBotResponse(userMessage) {
    for (let i = 0; i < qaData.length; i++) {
        if (userMessage.toLowerCase() === qaData[i].Question.toLowerCase()) {
            return qaData[i].Answer;
        }
    }
    return "Sorry, I don't understand that question.";
}

function cancelAdd() {
    window.location.href = "home_admin.html";
}
