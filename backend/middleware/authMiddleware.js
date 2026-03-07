const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user to get role
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = {
      userId: decoded.userId,
      organisationId: decoded.organizationId,
      role: user.role
    };
    
    req.userId = decoded.userId;
    req.organizationId = decoded.organizationId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
