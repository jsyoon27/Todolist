//todos.js
const express = require('express'); //express 모듈
const router = express.Router();
const ensureAuthorization = require('../auth');

const  {
    getTodo,
    registerTodo,
    editTodo,
    removeTodo
} = require('../controller/todo-controller'); //controller 모듈

router.use(express.json());
router.use(ensureAuthorization);

router.get('/',getTodo);
router.post('/',registerTodo);//등록
router.put('/:todo-id',editTodo);//완료,수정
router.delete('/:todo-id',removeTodo);//삭제


module.exports = router;