const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);
app.use(cookieParser());

const userRouter = require('./routes/users');
const teamRouter = require('./routes/teams');
const todosRouter = require('./routes/todos');

app.use('/users', userRouter);
app.use('/teams', teamRouter);
app.use('/todos', todosRouter);
