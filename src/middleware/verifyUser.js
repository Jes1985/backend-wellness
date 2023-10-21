const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.sendStatus(401);
  }

  jwt.verify(authorization, process.env.JWT_ACCESS_KEY, (err, result) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.user = result;
      next();
    }
  });
};

module.exports = verifyUser;
