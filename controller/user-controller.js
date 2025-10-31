const conn = require('../mariadb'); 
const {StatusCodes} = require('http-status-codes'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const dotenv = require('dotenv'); 
dotenv.config();

const join = (req, res) => {
    const {userId, password} = req.body;

    if (!userId || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "아이디와 비밀번호를 모두 입력해주세요." });
    }
    if (password.length < 4) { 
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "비밀번호는 4자리 이상이어야 합니다." });
    }

    let checkSql = 'SELECT * FROM users WHERE userId = ?';
    conn.query(checkSql, userId, (checkErr, results) => {
    if (checkErr) {
       console.error(checkErr);
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(checkErr);
    }
        
    if (results.length > 0) {
       return res.status(StatusCodes.CONFLICT).json({ message: "이미 존재하는 아이디입니다." }); // 409 Conflict
    }

    let insertSql = 'INSERT INTO users (userId, password, salt) VALUES (?, ?, ?)';
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
    let values = [userId, hashPassword, salt];

    conn.query(insertSql, values, (insertErr, insertResults) => {
       if (insertErr) {
           console.error(insertErr);
        return res.status(StatusCodes.BAD_REQUEST).end(); 
       }
       return res.status(StatusCodes.CREATED).json({ userId: userId, message: "회원가입 성공" });
        });
    });
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

            if (!loginUser) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
            }

            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

            if (loginUser.password === hashPassword) {
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
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: "아이디 또는 비밀번호가 틀렸습니다." }); 
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


module.exports = {
    join,
    login,
    logout
};