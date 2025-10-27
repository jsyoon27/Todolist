//teams.js
const express = require('express'); //express 모듈
const router = express.Router();

const  {
    createTeam,
    inviteMember,
    removeMember,
    registerTeamtodo,
    editTeamtodo,
    removeTeamtodo

}  = require('../controller/TeamController'); //controller 모듈
 

router.use(express.json());

router.post('/', createTeam);
router.post('/:teamNumber',inviteMember);
router.delete('/:teamNumber',removeMember);
router.post('/:teamNumber/todos', registerTeamtodo);
router.patch('/:teamNumber/todos/:todoId', editTeamtodo);
router.delete('/:teamNumber/todos/:todoId', removeTeamtodo)

module.exports = router;