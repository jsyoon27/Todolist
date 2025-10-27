//app.js
// express 모듈
const express = require('express');
const app = express();

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require('./routes/users');
const teamRouter = require('./routes/teams');
const todosRouter = require('./routes/todos');

app.use('/users', userRouter);
app.use('/teams', teamRouter);
app.use('/todos', todosRouter);
