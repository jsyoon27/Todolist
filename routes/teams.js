//teams.js
const express = require('express'); //express 모듈
const router = express.Router();
const ensureAuthorization = require('../auth');

const  {
    createTeam,
    inviteMember,
    removeMember,
    registerTeamtodo,
    editTeamtodo,
    removeTeamtodo
}  = require('../controller/team-controller'); //controller 모듈
 

router.use(express.json());
router.use(ensureAuthorization);

router.post('/', createTeam);
router.post('/:team-number',inviteMember);
router.delete('/:team-number',removeMember);
router.post('/:team-number/todos', registerTeamtodo);
router.put('/:team-number/todos/:todo-id', editTeamtodo);
router.delete('/:team-number/todos/:todo-id', removeTeamtodo);

module.exports = router;