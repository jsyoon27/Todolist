const conn = require('../mariadb'); 
const {StatusCodes} = require('http-status-codes');

const registerTodo = (req, res) => {
    const { userId, description } = req.body;
    
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
  const { todoId } = req.params;
  const { description, done } = req.body;

  const sets = [];
  const values = [];
  if (typeof description !== 'undefined') {
    sets.push('description = ?');
    values.push(description);
  }
  if (typeof done !== 'undefined') {
    sets.push('done = ?');
    values.push(done ? 1 : 0);
  }

  const sql = `UPDATE todos SET ${sets.join(', ')} WHERE todoId = ?`;
  values.push(Number(todoId));

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    const selectSql = 'SELECT * FROM todos WHERE todoId = ?';
    conn.query(selectSql, [todoId], (err2, selectResults) => {
        if (err2) {
            console.error(err2);
            return res.status(StatusCodes.BAD_REQUEST).end();
    }
        return res.status(StatusCodes.OK).json(selectResults[0]);
    });
  });
};


const removeTodo = (req, res) => {
  const { todoId } = req.params; 

  const sql = 'DELETE FROM todos WHERE todoId = ?';
  conn.query(sql, [todoId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.BAD_REQUEST).end(); 
    }

    return res.status(StatusCodes.OK).json(results);
  });
};


module.exports = { 
    registerTodo,
    editTodo,
    removeTodo
};

