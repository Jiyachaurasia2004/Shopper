const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).send("Access denied");

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = data;
        next();
    } catch {
        res.status(401).send("Invalid token");
    }
};

module.exports = fetchUser;
