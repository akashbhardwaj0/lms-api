
import User from "../modals/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signup = async(req, res)=>{

    const jwtKey = process.env.SECRET_KEY

    console.log('body data'+req.body)
    try {
        const{email, password, role, name, imageUrl} = req.body;
        if(!email || !password || !role ||!name){
            return res.status(400).json({
                message: "Someting is missing",
                succeed: false
            })
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                message: "User is already exist with this email",
                succeed: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
  await User.create({email,password: hashedPassword, role, name,imageUrl});

  return res.json({
    message: "Account Created",
    success: true
  })
    
    } catch (error) {
        console.log(error)
        
    }
}


export const login = async (req, res)=>{
    try {
        const{email, password, role} = req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                message: "Someting is missing",
                succeed: false
            })
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "Incorrect Email and Password",
                succeed: false
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message: "Incorrect Email and Password",
                succeed: false
            })
        }

        if(role!==user.role){
            return res.status(400).json({
                message: "Account does not exeist with current role",
                succeed: false
            })

        }

        
        const tokenData = {
            userId: user._id
            }

            const token = await jwt.sign(tokenData, jwtKey, {expiresIn: '1d'})

            return res.status(200).cookies('token', token, {maxAge:1*24*60*60*1000, httpOnly:true, sameSite:'strict'}).json({
                message:'Login Successfully',
                success: true,
                auth: token
            })
        
    } catch (error) {
        console.log(error)
        
    }

}

export const logout = (req, res)=>{
    try {
        return res.status(200).cookies("token", {maxAge: 0}).json({
            message:"Logout Successfully",
            success: true
        })
        
    } catch (error) {
        console.log(error)
        
    }

}

export const updateProfile = async (req, res)=>{
    try {
        const { name, email, role, _id } = req.body;

        if(!email || !role ||!name ||!_id){
            return res.status(400).json({
                message: "Someting is missing",
                succeed: false
            })
        }

        const userId = _id
        let user = await User.findById(userId)

        if(!user){
            return response.json({
                message: "User Not Found", 
                success:false
            })
        }

        // Updating Data

        user.name = name,
        user.email = email,
        user.role = role,
        await user.save()

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
          });

        
    } catch (error) {
        console.log(error)
        
    }
}






// API controller for function to manage user with database.

export const userController = async (req, res) => {
  try {
    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          password: data.password,
          role: data.role,
          imageUrl: data.imageUrl,
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          password: data.password,
          role: data.role,
          imageUrl: data.imageUrl,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// export const clerkWebhooks = async (req, res)=>{
//     try {

//         const whook = new Webhook (process.env.CLERK_WEBHOOK_SECRET)

//         await whook.verify(JSON.stringify(req.body),{
//             "svix-id": req.headers['svix-id'],
//             "svix-timestamp": req.headers['scix-timstamp'],
//             "svix-signature":req.headers['svix-signature']
//         })
//         const {data, type} = req.body

//         switch (type) {
//             case 'user.created':{
//                 const userData = {
//                     _id: data.id,
//                     email:data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageUrl: data.image_url,
//                 }
//                 await User.create(userData);
//                 res.json({})
//                 break
//             }
//             case'user.updated':{
//                 const userData = {
//                     email:data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageUrl: data.image_url,
//                 }
//                 await User.findByIdAndUpdate(data.id, userData)
//                 res.json({})
//                 break

//             }
//             case 'user.deleted':{
//                 await User.findByIdAndDelete(data.id)
//                 res.json({})
//                 break
//             }

//             default:
//                 break;
//         }

//     } catch (error) {
//         res.json({success: false, message: error.message})

//     }
// }
