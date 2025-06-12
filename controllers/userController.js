import User from "../modals/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Course from "../modals/Course.js";
import { Purchase } from "../modals/Purchase.js";
import Stripe from "stripe";
import { CourseProgress } from "../modals/CourseProgress.js";
import connectCloudinary from "../configs/cloudinary.js";

//Create/Register user
const cloudinary = connectCloudinary();

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profilePhotos" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Check required fields except profilePhoto (file)
    if (!email || !password || !role || !name) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // Check if file is attached
    if (!req.file) {
      return res.status(400).json({
        message: "Profile photo is required",
        success: false,
      });
    }

    // Upload profile photo to Cloudinary
    const result = await streamUpload(req.file.buffer);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with imageUrl from Cloudinary upload
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      imageUrl: result.secure_url,
    });

    // Generate JWT token
    const jwtKey = process.env.SECRET_KEY;
    const tokenData = { _id: newUser._id };
    const token = jwt.sign(tokenData, jwtKey, { expiresIn: "1d" });

    return res.json({
      message: "Account Created",
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        imageUrl: newUser.imageUrl,
      },
      authToken: token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// export const signup = async (req, res) => {
//   try {
//     const { email, password, role, name, imageUrl } = req.body;
//     if (!email || !password || !role || !name) {
//       return res.status(400).json({
//         message: "Someting is missing",
//         succeed: false,
//       });
//     }

//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({
//         message: "User is already exist with this email",
//         succeed: false,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("hashed password: " + hashedPassword);
//     const newUser = await User.create({email, password: hashedPassword, role, name, imageUrl});

//     // Create the JWT token
//     const jwtKey = process.env.SECRET_KEY;
//     const tokenData = { _id: newUser._id };
//     const token = jwt.sign(tokenData, jwtKey, { expiresIn: "1d" });

//     return res.json({
//       message: "Account Created",
//       success: true,
//       user: {
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//         logo: newUser.imageUrl,
//       },
//       authToken: token,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// login user

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Someting is missing",
        succeed: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email and Password",
        succeed: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect Email and Password",
        succeed: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account does not exeist with current role",
        succeed: false,
      });
    }

    const jwtKey = process.env.SECRET_KEY;
    const tokenData = { _id: user._id };
    const token = jwt.sign(tokenData, jwtKey, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login Successfully",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        logo: user.imageUrl,
      },
      authToken: token,
    });
  } catch (error) {
    console.log(error);
  }
};

// Logout

export const logout = (req, res) => {
  try {
    return res.status(200).cookies("token", { maxAge: 0 }).json({
      message: "Logout Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Update User

export const updateProfile = async (req, res) => {
  try {
    const { name, email, role, _id } = req.body;

    if (!email || !role || !name || !_id) {
      return res.status(400).json({
        message: "Someting is missing",
        succeed: false,
      });
    }

    const userId = _id;
    let user = await User.findById(userId);

    if (!user) {
      return response.json({
        message: "User Not Found",
        success: false,
      });
    }

    // Updating Data

      (user.name = name),
      (user.email = email),
      (user.role = role),
      await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserData = async (req, res) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt');

    if (!user) {
      return res.json({ success: false, message: "USER NOT FOUND" });
    }
    res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// User enrolled coursess with lecture link

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req._id;
    const userData = await User.findById(userId).populate("enrolledCourses");
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// Purchase course

export const purchaseCourse = async (req, res) => {
  try {
    const userId = req._id;
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      console.log("error missing data")
      return res.send({ success: false, message: "DATA NOT FOUND" });
     }


    const purchaseData = {
      courseId: courseData._id,
      userId: userId,
      amount: (courseData.coursePrice -(courseData.discount * courseData.coursePrice) / 100).toFixed(2),
    };


    const newPurchase = await Purchase.create(purchaseData);

    // stripe gate way initia;ize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    const currency = process.env.currency.toLowerCase();


    // Creating line item for Stripe
    const line_items = [{
      price_data:{
        currency,
        product_data:{
          name: courseData.courseTitle
        },
        unit_amount: Math.floor(newPurchase.amount)*100,

      },
      quantity: 1
    }]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    })
    
    res.json({ success: true, session_url: session.url});
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};


// Update user course progress

export const updateUserCourseProgress = async (req, res)=>{
  try {
    const userId = req._id;
    const{courseId, lectureId} = req.body
    const progressData = await CourseProgress.findOne({userId, courseId})

    if(progressData){
      if(progressData.lectureCompleted.includes(lectureId)){
        return res.json({success: true, message: 'Lecture Already Completed'})
      }
      progressData.lectureCompleted.push(lectureId)

      await progressData.save()

    }else{
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted:[lectureId],
      })
      return res.json({success: true, message: 'Progress Updated'})
    }
    
  } catch (error) {
    return res.json({success: false, message: error.message})
    
  }
}

// Get User Course Progress

export const getUserCourseProgress = async (req, res)=>{
  try {    
    const userId = req._id;
    const{courseId, lectureId} = req.body
    const progressData = await CourseProgress.findOne({userId, courseId})

    return res.json({success: true, progressData})
  } catch (error) {
    return res.json({success: false, message: error.message})    
  }
}

// Add user Ratings to course

export const addUserRating = async(req, res) =>{
  const userId = req._id;
  const{courseId, rating} = req.body

  if(!courseId || !userId || rating<1 || rating>5){
    return res.json({success: false, message: "Invalid Details"})
  }

  try {
    const course = await Course.findById(courseId)
    if(!course){
      return res.json({success: false, message: "Course not found"})
    }

    const user = await User.findById(userId)
      if(!user || !user.enrolledCourses.includes(courseId)){
        return res.json({success: false, message: "User has not purchased this course"})
        }

        const existingRatingIndex = course.courseRatings.findIndex(r=>r.userId === userId)

if(existingRatingIndex > -1){
  course.courseRatings[existingRatingIndex].rating = rating
}
else{
  course.courseRatings.push({userId, rating})
  await course.save()
  return res.json({success: false, message: "Rating Added"})
}

  } catch (error) {
    return res.json({success: false, message: error.message})    
    
  }



}