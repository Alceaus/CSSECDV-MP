const bcrypt = require('bcrypt');
const db = require('./db');

const createUser = `
    CREATE TABLE IF NOT EXISTS user (
        UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(50),
        MiddleName VARCHAR(5),
        LastName VARCHAR(50),
        Suffix VARCHAR(10),
        Email VARCHAR(100) UNIQUE,
        Phone VARCHAR(20),
        Address VARCHAR(255),
        Password VARCHAR(255),
        Role VARCHAR(20)
    )
`;

const createQuestionAnswer = `
    CREATE TABLE IF NOT EXISTS qa (
        qaID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        Question VARCHAR(255) UNIQUE,
        Answer VARCHAR(255)
    )
`;

const adminData = [
    {
        email: "admin1@example.com",
        password: "admin1",
        role: "Admin"
    },
    {
        email: "admin2@example.com",
        password: "admin2",
        role: "Admin"
    },
    {
        email: "admin3@example.com",
        password: "admin3",
        role: "Admin"
    }
];

const qaData = [
    {
        question: "How are you?",
        answer: "I'm fine"
    },
    {
        question: "What is the motto of Project GALA?",
        answer: "Give. Share. Be an Advocate"
    },
    {
        question: "Wait, it's all Ohio?",
        answer: "Always has been!"
    }
];

const initData = async () => {
    try {
        db.query(createUser, (err, result) => {
            if (err) {
                console.error('Error creating user table: ', err);
            } else {
                console.log('User table successfully created');
            }
        });

        db.query(createQuestionAnswer, (err, result) => {
            if (err) {
                console.error('Error creating QA table: ', err);
            } else {
                console.log('QA table successfully created');
            }
        });

        for (const admin of adminData) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            const insertAdminQuery = 'INSERT IGNORE INTO user (Email, Password, Role) VALUES (?, ?, ?)';

            db.query(insertAdminQuery, [admin.email, hashedPassword, admin.role], (err, result) => {
                if (err) {
                    console.error('Error inserting admin: ', err);
                } else {
                    console.log(`Admin inserted successfully`);
                }
            });
        }

        for (const qa of qaData) {
            const insertQaQuery = 'INSERT IGNORE INTO qa (Question, Answer) VALUES (?, ?)';
            
            db.query(insertQaQuery, [qa.question, qa.answer], (err, result) => {
                if (err) {
                    console.error('Error inserting Q&A: ', err);
                } else {
                    console.log(`Q&A inserted successfully`);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing data: ', error);
    }
};

module.exports = initData;
