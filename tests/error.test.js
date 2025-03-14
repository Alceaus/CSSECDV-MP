const express = require('express');
const request = require('supertest');
require('dotenv').config();


const app = express();
app.use(express.json());

app.get('/test-error', (req, res, next) => {
    const error = new Error('Test error message');
    next(error); 
});


app.use((err, req, res, next) => {
    console.error(err); 

    if (process.env.DEBUG === 'true') {
        return res.status(500).json({
            message: err.message,
            error: err.toString(),
            stack: err.stack
        });
    } 
    
    return res.status(500).json({
        message: 'Internal Server Error',
        error: 'An error occurred while processing your request'
    });
});

describe('Error Handling Tests', () => {
    test('Detailed error when DEBUG=true', async () => {
    
        process.env.DEBUG = 'true';
        
        const response = await request(app)
            .get('/test-error')
            .expect(500);

        expect(response.body.message).toBe('Test error message');
        expect(response.body.stack).toBeDefined();
    });

    test('Generic error when DEBUG=false', async () => {
        process.env.DEBUG = 'false';
        
        const response = await request(app)
            .get('/test-error')
            .expect(500);

        expect(response.body.message).toBe('Internal Server Error');
        expect(response.body.stack).toBeUndefined();
    });
});
