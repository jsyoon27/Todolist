const conn = require('../mariadb'); 
const {StatusCodes} = require('http-status-codes');

const getTodo = (req, res) => {
  const { userId } = req;

  const sql = 
    `SELECT * FROM todos 
    WHERE (userId = ? AND teamNumber IS NULL) 
      OR (teamNumber IN (SELECT teamNumber FROM team_members WHERE userId = ?))`;
    
  conn.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
    return res.status(StatusCodes.OK).json(results);
  });
};


const registerTodo = (req, res) => {
    const {userId} = req;
    const {description} = req.body;
    
    const sql = 'INSERT INTO todos (userId, description) VALUES (?, ?)';
    conn.query(sql, [userId, description], 
        (err, result) => { 
            if (err) {
                console.error(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.CREATED).json({ 
                todoId: result.insertId, 
                userId,
                description
            });
    });
};

// todo 수정, 완료
const editTodo = (req, res) => {
  const todoId = req.params['todo-id']
  const { description, done } = req.body; //두개 다 받는다 가정
  const { userId } = req;

  const sql = `UPDATE todos SET description = ?, done = ? WHERE todoId = ? AND userId = ?`;
  const values = [description, done, Number(todoId), userId];

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


const removeTodo = (req, res) => {
  const todoId = req.params['todo-id'] 
  const { userId } = req;

  const sql = 'DELETE FROM todos WHERE todoId = ? AND userId = ?';
  conn.query(sql, [todoId,userId], (err, results) => {
    if (err) {
        console.error(err);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "삭제 중 오류가 발생했습니다." });
    }

    if (results.affectedRows === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "삭제할 항목을 찾을 수 없습니다." });
    }

    return res.status(StatusCodes.OK).json(results);
  });
};


module.exports = { 
    getTodo,
    registerTodo,
    editTodo,
    removeTodo
};

