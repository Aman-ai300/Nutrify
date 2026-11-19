const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Please Send a Valid Bearer Token" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Invalid or Expired Token" });
    }

    req.user = data;
    next();
  });
}

module.exports = verifyToken;
