import env from 'dotenv';
env.config({ path:"./config.env"});

import express from 'express';
import app from './app.js';
import './db.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=> {
    console.log(`Server running on port ${PORT}`);
});



