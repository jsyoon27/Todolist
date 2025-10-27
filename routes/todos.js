//todos.js
const express = require('express'); //express 모듈
const router = express.Router();

const  {
    registerTodo,
    editTodo,
    removeTodo
} = require('../controller/TodoController'); //controller 모듈

router.use(express.json());

router.post('/',registerTodo);//등록
router.patch('/:todoId',editTodo);//완료,수정
router.delete('/:todoId',removeTodo);//삭제


module.exports = router;