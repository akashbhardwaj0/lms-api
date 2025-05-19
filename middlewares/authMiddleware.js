
import jwt from "jsonwebtoken";
import User from "../modals/User.js";


// Middleware (Protect Educator Route)
const protectEducator = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization
    const decoded = jwt.verify(authToken, process.env.SECRET_KEY);
    req._id = decoded._id;

        
    const user = await User.findById(req._id);
    if (!user || user.role !== 'educator') {
      return res.json({ success: false, message: 'Unauthorized Access' });
    }

    next();

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Middleware protect user route

const protectUser = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization
    const decoded = jwt.verify(authToken, process.env.SECRET_KEY);
    req._id = decoded._id;
    const user = await User.findById(req._id);
    if (!user) {
      return res.json({ success: false, message: 'Unauthorized Access' });
    }

    next();
    
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export { protectUser, protectEducator };
