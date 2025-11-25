import express from 'express';
import env from 'dotenv';
import app from './app.js';
import './db.js';

env.config({ path:"./config.env"});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=> {
    console.log(`Server running on port ${PORT}`);
});



