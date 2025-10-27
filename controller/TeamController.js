const conn = require("../mariadb"); //db 모듈
const { StatusCodes } = require("http-status-codes");

const createTeam = (req, res) => {
  const { teamId, userId } = req.body;

  let sql = "INSERT INTO teams (teamId,userId) VALUES (?, ?)";

  let values = [teamId, userId];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); 
    }
    const teamNumber = results.insertId;

    const insertMemberSql =
      "INSERT INTO team_members (teamNumber, userId) VALUES (?, ?)";
    conn.query(insertMemberSql, [teamNumber, userId], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.CREATED).json({
        teamNumber,
        teamId,
        userId,
      });
    });
  });
};

const inviteMember = (req, res) => {
  const teamNumber = Number(req.params.teamNumber);
  const { userId } = req.body;

  const sql = "INSERT INTO team_members (teamNumber, userId) VALUES (?, ?)";
  conn.query(sql, [teamNumber, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json({
      teamNumber,
      userId,
    });
  });
};

const removeMember = (req, res) => {
  const teamNumber = Number(req.params.teamNumber);
  const { userId } = req.body;

  const sql = "DELETE FROM team_members WHERE teamNumber = ? AND userId = ?";
  conn.query(sql, [teamNumber, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json({
      teamNumber,
      userId,
      deleted: result.affectedRows === 1,
    });
  });
};

const registerTeamtodo = (req, res) => {
  const { userId, description } = req.body;
  const { teamNumber } = req.params; 

  const sql =
    "INSERT INTO todos (userId, description, teamNumber) VALUES (?, ?, ?)";
  conn.query(
    sql,
    [userId, description, Number(teamNumber)], // DB에 숫자로 저장
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.CREATED).json({
        todoId: result.insertId,
        userId,
        description,
        teamNumber: Number(teamNumber),
      });
    }
  );
};
// 유저 id가 teamNumber에 속해 있는지 확인
// 권한 확인

const editTeamtodo = (req, res) => {
  const { teamNumber, todoId } = req.params;
  const { description, done } = req.body;

  const sets = [];
  const values = [];
  if (typeof description !== "undefined") {
    sets.push("description = ?");
    values.push(description);
  }
  if (typeof done !== "undefined") {
    sets.push("done = ?");
    values.push(done ? 1 : 0);
  }

  const sql = `UPDATE todos SET ${sets.join(
    ", "
  )} WHERE todoId = ? AND teamNumber = ?`;
  values.push(Number(todoId));
  values.push(Number(teamNumber));

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    const selectSql = 'SELECT * FROM todos WHERE todoId = ? AND teamNumber = ?';
    conn.query(selectSql, [todoId, teamNumber], (err2, selectResults) => {
        if (err2) {
            console.error(err2);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
      return res.status(StatusCodes.OK).json(selectResults[0]);
      });
  });
};

const removeTeamtodo = (req, res) => {
  const { teamNumber, todoId } = req.params;

  let sql = "DELETE FROM todos WHERE todoId = ? AND teamNumber = ?";
  const values = [Number(todoId), Number(teamNumber)];

  conn.query(sql,values,
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      return res.status(StatusCodes.OK).json(results);
    }
  );
};

module.exports = {
    createTeam,
    inviteMember,
    removeMember,
    registerTeamtodo,
    editTeamtodo,
    removeTeamtodo
};
