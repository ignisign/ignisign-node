const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key'

export const checkBearerToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    const accessToken = token.substring(7);

    jwt.verify(accessToken, secretKey, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Unauthorized' });
      } else {
        // Token is valid, proceed to next middleware or route
        // req.user = decoded; // Store the decoded token payload in the request object if needed
        next();
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export const generateBearerToken = () => {
  const payload = {};

  const options = {
    expiresIn: '1h'
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};