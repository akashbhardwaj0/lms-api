import User from "../modals/User.js";


// Middleware (Protect Educator Route)
const protectEducator = async (req, res, next) => {
  try {
    const userId = req._id; // Assumes `req.user` is set by auth middleware

    const user = await User.findById(userId);
    if (!user || user.role !== 'educator') {
      return res.json({ success: false, message: 'Unauthorized Access' });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default protectEducator;





// const protectEducator = async (req, res, next)=>{
//     try {
//         const userId = req.auth.userId
//         const response = await User.findOne({email})
//         // const response = clerkClient.users.getUserID(userId)
//         // if(response.publicMetaData.role !== 'educator'){
//         if(response.role !== 'educator'){
//             res.json({success:false, message:'Unauthorize Access'})
//         }
//         next()
        
//     } catch (error) {
//         res.json({success:false, message:error.message})
        
//     }

// }
// export default protectEducator