import jwt from 'jsonwebtoken';

const verifyToken = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Backwards compatibility for older tokens that didn't include the role field
      if (!decoded.role) {
        decoded.role = 'student';
      }

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${roles.join(', ')}. Got: ${decoded.role}`,
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  };
};

export { verifyToken };
