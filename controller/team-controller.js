const conn = require("../mariadb"); //db 모듈
const { StatusCodes } = require("http-status-codes");


const createTeam = (req, res) => {
   const { teamId } = req.body;
   const { userId } = req;

   conn.beginTransaction(err => {
     if (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "트랜잭션 시작 실패" });
     }

     const sql1 = "INSERT INTO teams (teamId,userId) VALUES (?, ?)";
     const values1 = [teamId, userId];

     conn.query(sql1, values1, (err1, results) => {
        if (err1) {
          console.error(err1);
          return conn.rollback(() => {
             res.status(StatusCodes.BAD_REQUEST).json({ message: "팀 생성 실패", error: err1.message });
          });
        }

        const teamNumber = results.insertId;
        const sql2 = "INSERT INTO team_members (teamNumber, userId) VALUES (?, ?)";
        const values2 = [teamNumber, userId];

        conn.query(sql2, values2, (err2) => {
          if (err2) {
             console.error(err2);
             return conn.rollback(() => {
               res.status(StatusCodes.BAD_REQUEST).json({ message: "팀 멤버 추가 실패", error: err2.message });
             });
          }

          conn.commit((errC) => {
             if (errC) {
               return conn.rollback(() => {
                  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "커밋 실패", error: errC.message });
               });
             }
             return res.status(StatusCodes.CREATED).json({
               teamNumber,
               teamId,
               userId,
             });
          }); 
        }); 
     }); 
   }); 
};

const inviteMember = (req, res) => {
  const teamNumber = Number(req.params['team-number']);
  const { userId } = req.body;

  const sql = "INSERT INTO team_members (teamNumber, userId) VALUES (?, ?)";
  conn.query(sql, [teamNumber, userId], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
          return res.status(StatusCodes.CONFLICT).json({ message: "이미 팀에 속한 사용자입니다." });
      }
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(StatusCodes.NOT_FOUND).json({ message: "초대하려는 사용자를 찾을 수 없습니다." });
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "초대 중 오류가 발생했습니다." });
    }

    return res.status(StatusCodes.OK).json({
      teamNumber,
      userId,
    });
  });
};

const removeMember = (req, res) => {
  const teamNumber = Number(req.params['team-number']);
  const { userId } = req.body;

  const sql = "DELETE FROM team_members WHERE teamNumber = ? AND userId = ?";
  conn.query(sql, [teamNumber, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "삭제할 팀원이나 팀을 찾을 수 없습니다." });
    }
    return res.status(StatusCodes.OK).json({
      teamNumber,
      userId,
      deleted: result.affectedRows === 1,
    });
  });
};

const registerTeamtodo = (req, res) => {
  const { description } = req.body;
  const { userId } = req;
  const teamNumber = Number(req.params['team-number']);

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

const editTeamtodo = (req, res) => {
  const teamNumber = req.params['team-number'];
  const todoId = req.params['todo-id'];
  const { description, done } = req.body;

  if (typeof description === 'undefined' || typeof done === 'undefined') {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "description과 done이 모두 필요합니다." });
  }

  const sql = `UPDATE todos SET description = ?, done = ? WHERE todoId = ? AND teamNumber = ?`;  
  const values = [description, done, Number(todoId), Number(teamNumber)];

  conn.query(sql, values, (err, results) => {
    if (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
    }
    
    if (results.affectedRows === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "해당 할 일을 찾거나 수정할 권한이 없습니다." });
    }

    return res.status(StatusCodes.OK).json({ message: "수정되었습니다." });
  });
};

const removeTeamtodo = (req, res) => {
  const teamNumber = req.params['team-number'];
  const todoId = req.params['todo-id'];

  let sql = "DELETE FROM todos WHERE todoId = ? AND teamNumber = ?";
  const values = [Number(todoId), Number(teamNumber)];

  conn.query(sql,values,
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      if (results.affectedRows === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "삭제할 항목을 찾을 수 없습니다." });
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
