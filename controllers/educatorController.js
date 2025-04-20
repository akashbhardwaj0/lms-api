import { clerkClient } from "@clerk/express";
import Course from "../modals/Course.js";
import {v2 as cloudinary} from 'cloudinary'
import User from "../modals/User.js";


// Update role to educator

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.body._id;
    await User.findByIdAndUpdate(userId, { role: "educator" });
    res.json({
      success: true,
      message: "You can publish a course now",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};



// export const updateRoleToEducator = async (req, res) => {
//   try {
//     const userId = req.auth.userId;
//     await clerkClient.users.updateUserMetaData(userId, {
//       publicMetaData: {
//         role: "educator",
//       },
//     });
//     req.json({
//       success: true,
//       message: "You can publish a course now",
//     });
//   } catch (error) {
//     req.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Add New Course

export const addCourse = async (req, res)=>{
  try {
    const {courseData} = req.body
    const imageFile = req.file

    // const educatorID = courseData.educator;
    // const educatorID = req.body.educator;
        

    if(!imageFile){
      return res.status(400).json({success:false, message:'Thumbnail Not Attached'})
    }

    const parseCourseData = await JSON.parse(courseData);

    const educatorID = parseCourseData.educator;

    console.log("id is "+educatorID)


    if (!parseCourseData.educator) {
      return res.status(400).json({ success: false, message: "Educator ID is missing" });
    }
    
    // parseCourseData.educator = educatorID;
    const newCourse = await Course.create(parseCourseData)
    const imageUpload = await cloudinary.uploader.upload(imageFile.path)
    newCourse.courseThumbnail = imageUpload.secure_url
    await newCourse.save()
    
    res.status(200).json({
      success:true, message:"Course Added"
    })
    
  } catch (error) {
    res.status(500).json({error, success:false, message:error.message})
    
  }

}

// Get educator courses

export const getEducatorCourses = async(req, res)=>{
  try {
    const educator = req.body._id;
    const course = await Course.find({educator})
    res.status(200).json({
         success:true,
         course
    })

  } catch (error) {
    res.json({
      success:false,
      message: error.message
    })
    
  }
}

// Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)

const rducatorDashboardData = async(req, res)=>{
  try {

    const educator = req.body._id;
    const course = Course.find({educator});


    
  } catch (error) {
    res.json({
      message:error.message,
      success: false
    })
    
  }
}
