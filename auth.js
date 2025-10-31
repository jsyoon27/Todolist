const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');
dotenv.config();

const ensureAuthorization = (req, res, next) => {
    const { token } = req.cookies; 

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "로그인이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        
        req.userId = decoded.userId; 
        
        next(); 
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "인증 토큰이 유효하지 않습니다." });
    }
};

module.exports = ensureAuthorization;