const conn = require('../mariadb'); 
const {StatusCodes} = require('http-status-codes'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const dotenv = require('dotenv'); 
dotenv.config();

const join = (req, res) => {
    const {userId, password} = req.body;

    let sql = 'INSERT INTO users (userId, password, salt) VALUES (?, ?, ?)';
    
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    let values = [userId, hashPassword,salt];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST
            }
            return res.status(StatusCodes.CREATED).json(results);
        })
    };
const login = (req, res) => {
    const {userId, password} = req.body;

    let sql = 'SELECT * FROM users WHERE userId = ?';
    conn.query(sql, userId,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(StatusCodes.BAD_REQUEST).end(); 
            }
            const loginUser = results[0];

            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

            if (loginUser && loginUser.password == hashPassword) {
                const token = jwt.sign({
                    userId : loginUser.userId
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '5m',
                    issuer : 'sungyoon'
                });

                res.cookie('token', token, {
                    httpOnly : true
                });
                const responseData = {
                    userId: loginUser.userId,
                    lastViewedTeamId: loginUser.lastViewedTeamId 
                };

                return res.status(StatusCodes.OK).json(responseData);
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end(); 
            }
        })
    };

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(StatusCodes.OK).json({ message: "로그아웃 되었습니다." });
    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "로그아웃 중 오류 발생" });
    }
};
const updateLastViewedList = (req, res) => {
    const { userId, teamId } = req.body; 

    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "userId가 필요합니다." });
    }

  const sql = 'UPDATE users SET lastViewedListId = ? WHERE userId = ?';
  conn.query(sql, [teamId, userId], (err, results) => {
    if (err || results.affectedRows === 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).end();
  });
};


module.exports = {
    join,
    login,
    logout,
    updateLastViewedList
};