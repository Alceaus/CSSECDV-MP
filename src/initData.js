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
        Role VARCHAR(20),
        Status BOOLEAN
    )
`;

const createQuestionAnswer = `
    CREATE TABLE IF NOT EXISTS qa (
        qaID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        Question VARCHAR(255) UNIQUE,
        Answer VARCHAR(255)
    )
`;

const createStory = `
    CREATE TABLE IF NOT EXISTS story (
        StoryID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        StoryTitle VARCHAR(50),
        Description VARCHAR(255),
        Author VARCHAR(50),
        AuthorRole VARCHAR(20),
        StoryHighlights VARCHAR(255),
        ImagePath VARCHAR(255),
        Category VARCHAR(50)
    )
`;

const createAlbum = `
    CREATE TABLE IF NOT EXISTS album (
        AlbumID INT AUTO_INCREMENT PRIMARY KEY,
        AlbumTitle VARCHAR(50),
        Description VARCHAR(255),
        Year YEAR,
        Category VARCHAR(50)
    )
`;

const createAlbumImages = `
    CREATE TABLE IF NOT EXISTS album_images (
        ImageID INT AUTO_INCREMENT PRIMARY KEY,
        AlbumID INT,
        ImagePath VARCHAR(255),
        FOREIGN KEY (AlbumID) REFERENCES album(AlbumID) ON DELETE CASCADE
    )
`;

const createContactInfo = `
    CREATE TABLE IF NOT EXISTS contact (
        ContactID INT AUTO_INCREMENT PRIMARY KEY,
        Address VARCHAR(255),
        Phone VARCHAR(20),
        Network VARCHAR(20),
        Email VARCHAR(100),
        ImagePath VARCHAR(255)
    )
`;

const createBusinessHours = `
    CREATE TABLE IF NOT EXISTS business_hours (
        BusinessID INT AUTO_INCREMENT PRIMARY KEY,
        ContactID INT,
        Day VARCHAR(10),
        StartTime TIME,
        EndTime TIME,
        FOREIGN KEY (ContactID) REFERENCES contact(ContactID) ON DELETE CASCADE
    )
`;

const createVisitorCount = `
    CREATE TABLE IF NOT EXISTS visitor_count (
        VisitorID INT AUTO_INCREMENT PRIMARY KEY,
        Count INT DEFAULT 0
    )
`;

const initVisitorCount = `
    INSERT IGNORE INTO visitor_count (VisitorID, Count) VALUES (1, 0)
`;

const createVolunteer = `
    CREATE TABLE IF NOT EXISTS volunteer (
        VolunteerID INT AUTO_INCREMENT PRIMARY KEY,
        FullName VARCHAR(100),
        Email VARCHAR(100) UNIQUE,
        Phone VARCHAR(20),
        Skills VARCHAR(100),
        Availability DATETIME,
        PreviousExperience VARCHAR(255),
        WhyVolunteer VARCHAR(255),
        Status VARCHAR(10)
    )
`;

const createPartner = `
    CREATE TABLE IF NOT EXISTS partner (
        PartnerID INT AUTO_INCREMENT PRIMARY KEY,
        OrgName VARCHAR(100),
        ContactPerson VARCHAR(100),
        Email VARCHAR(100) UNIQUE,
        Phone VARCHAR(20),
        Webiste VARCHAR(100),
        Project VARCHAR(255),
        OrgDescription VARCHAR(255),
        Status VARCHAR(10)
    )
`;

const createGetInTouch = `
    CREATE TABLE IF NOT EXISTS get_in_touch (
        GetInTouchID INT AUTO_INCREMENT PRIMARY KEY,
        FullName VARCHAR(100),
        Email VARCHAR(100) UNIQUE,
        Phone VARCHAR(20),
        Subject VARCHAR(50),
        Message VARCHAR(255)
    )
`;

const userData = [
    { 
        fName: "Juan",
        lName: "Dela Cruz",  
        email: "juan@example.com", 
        phone: "1234567890", 
        address: "Real St, Manila", 
        password: "juan",
        role: "Volunteer", 
        online: true 
    },
    { 
        fName: "Pepito", 
        lName: "Manaloto", 
        email: "pepito@example.com", 
        phone: "0987654321", 
        address: "Sampaguita St, Manila", 
        password: "pepito",
        role: "Donor", 
        online: false 
    }
];

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
        email: "santosalejandrogabriel929@gmail.com",
        password: "admin3",
        role: "Admin"
    }
];

const volunteerData = [
    {
        name: "Juan Dela Cruz",
        email: "juan@example.com",
        phone: "0912345",
        skills: "Web Development, Marketing",
        availability: "2024-10-24 11:00",
        previousExperience: "Volunteered at local community center",
        whyVolunteer: "I want to contribute to society and make a positive impact.",
        status: "Pending"
    },
    {
        name: "Alice Guo",
        email: "alice@example.com",
        phone: "0912345",
        skills: "Teaching, Event Planning",
        availability: "2024-04-13 9:00",
        previousExperience: "Tutored high school students",
        whyVolunteer: "I love teaching and want to help underprivileged children.",
        status: "Pending"
    }
];

const partnerData = [
    {
        orgName: "ABC Organization",
        contactPerson: "Christian Dior",
        email: "dior@example.com",
        phone: "09173648",
        project: "Education, Health",
        orgDescription: "ABC Organization is dedicated to providing educational opportunities for children in need.",
        status: "Pending"
    },
    {
        orgName: "XYZ Foundation",
        contactPerson: "Luke Kah",
        email: "luke@example.com",
        phone: "096969",
        project: "Environmental Sustainability",
        orgDescription: "XYZ Foundation focuses on environmental conservation and sustainability projects.",
        status: "Pending"
    }
];

const getInTouchData = [
    {
        name: "James Blue",
        email: "james@example.com",
        phone: "123456789",
        subject: "Inquiry",
        message: "I would like to know more about your programs."
    },
    {
        name: "Hannah Montana",
        email: "hannah@example.com",
        phone: "987654321",
        subject: "Support",
        message: "How can I support your organization?"
    }
];

const qaData = [
     {
        question: "Tell me about Project GALA.",
        answer: "Project GALA (Give a Love Anywhere) is a volunteer organization dedicated to community service and disaster response. Our projects focus on providing aid, education, and hope to various communities in need across the Philippines."
    },
    {
        question: "What is the motto of Project GALA?",
        answer: "Give. Share. Be an Advocate"
    },
    {
        question: "How can I volunteer for Project GALA?",
        answer: "We welcome volunteers for various roles such as creating publication materials, seeking partners and donors, assisting with logistical support, and distributing aid. To sign up, visit our volunteer page or contact us directly."
    },
    {
        question: "How can I donate to Project GALA?",
        answer: "You can support our projects through monetary and in-kind donations. Visit our donations page for more details on how to contribute and the specific needs of our ongoing initiatives."
    },
    {
        question: "Can you tell me about some past projects of Project GALA?",
        answer: "Project GALA has successfully executed various impactful projects. We also run annual gift-giving events like TALAng GALA and special holiday initiatives like Paskong PGibig."
    },
    {
        question: "How can I contact Project GALA?",
        answer: "You can reach us via email at project.gala.2017@gmail.com, through our Facebook page, or by calling +639397527749. We look forward to hearing from you!"
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

        db.query(createStory, (err, result) => {
            if (err) {
                console.error('Error creating story table: ', err);
            } else {
                console.log('Story table successfully created');
            }
        });

        db.query(createAlbum, (err, result) => {
            if (err) {
                console.error('Error creating album table: ', err);
            } else {
                console.log('Album table successfully created');
            }
        });

        db.query(createAlbumImages, (err, result) => {
            if (err) {
                console.error('Error creating album images table: ', err);
            } else {
                console.log('Album images table successfully created');
            }
        });

        db.query(createContactInfo, (err, result) => {
            if (err) {
                console.error('Error creating contact table: ', err);
            } else {
                console.log('Contact table successfully created');
            }
        });

        db.query(createBusinessHours, (err, result) => {
            if (err) {
                console.error('Error creating business hours table: ', err);
            } else {
                console.log('Business hours table successfully created');
            }
        });

        db.query(createVisitorCount, (err, result) => {
            if (err) {
                console.error('Error creating visitor count table: ', err);
            } else {
                console.log('Visitor count table successfully created');
            }
        });

        db.query(initVisitorCount, (err, result) => {
            if (err) {
                console.error('Error initializing visitor count table: ', err);
            } else {
                console.log('Visitor count table successfully initialized');
            }
        });

        db.query(createVolunteer, (err, result) => {
            if (err) {
                console.error('Error creating volunteer table: ', err);
            } else {
                console.log('Volunteer table successfully created');
            }
        });

        db.query(createPartner, (err, result) => {
            if (err) {
                console.error('Error creating partner table: ', err);
            } else {
                console.log('Partner table successfully created');
            }
        });

        db.query(createGetInTouch, (err, result) => {
            if (err) {
                console.error('Error creating get in touch table: ', err);
            } else {
                console.log('Get in touch table successfully created');
            }
        });

        for (const user of userData) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const insertUserQuery = 'INSERT IGNORE INTO user (FirstName, LastName, Email, Phone, Address, Password, Role, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

            db.query(insertUserQuery, [user.fName, user.lName, user.email, user.phone, user.address, hashedPassword, user.role, user.online], (err, result) => {
                if (err) {
                    console.error('Error inserting user: ', err);
                } else {
                    console.log(`User inserted successfully`);
                }
            });
        }

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

        for (const volunteer of volunteerData) {
            const insertVolunteerQuery = 'INSERT IGNORE INTO volunteer (FullName, Email, Phone, Skills, Availability, PreviousExperience, WhyVolunteer, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

            db.query(insertVolunteerQuery, [volunteer.name, volunteer.email, volunteer.phone, volunteer.skills, volunteer. availability, volunteer. previousExperience, volunteer.whyVolunteer, volunteer.status], (err, result) => {
                if (err) {
                    console.error('Error inserting volunteer: ', err);
                } else {
                    console.log(`Volunteer inserted successfully`);
                }
            });
        }

        for (const partner of partnerData) {
            const insertPartnerQuery = 'INSERT IGNORE INTO partner (OrgName, ContactPerson, Email, Phone, Project, OrgDescription, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';

            db.query(insertPartnerQuery, [partner.orgName, partner.contactPerson, partner.email, partner.phone, partner.project, partner.orgDescription, partner.status], (err, result) => {
                if (err) {
                    console.error('Error inserting partner: ', err);
                } else {
                    console.log(`Partner inserted successfully`);
                }
            });
        }

        for (const getInTouch of getInTouchData) {
            const insertgetInTouchQuery = 'INSERT IGNORE INTO get_in_touch (FullName, Email, Phone, Subject, Message) VALUES (?, ?, ?, ?, ?)';

            db.query(insertgetInTouchQuery, [getInTouch.name, getInTouch.email, getInTouch.phone, getInTouch.subject, getInTouch.message], (err, result) => {
                if (err) {
                    console.error('Error inserting get in touch: ', err);
                } else {
                    console.log(`Get in touch inserted successfully`);
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
