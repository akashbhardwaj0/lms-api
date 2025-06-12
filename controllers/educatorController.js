import Course from "../modals/Course.js";
import {v2 as cloudinary} from 'cloudinary'
import User from "../modals/User.js";
import { Purchase } from "../modals/Purchase.js";


// Update role to educator

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req._id;
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



// Add New Course


export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorID = req._id;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Thumbnail not attached' });
    }

    // Parse and enrich course data
    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorID;

    // Upload image buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'courseThumbnails' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(imageFile.buffer); // stream the buffer from multer.memoryStorage
    });

    parsedCourseData.courseThumbnail = uploadResult.secure_url;

    // Create new course
    await Course.create(parsedCourseData);

    res.status(200).json({
      success: true,
      message: "Course added successfully",
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// export const addCourse = async (req, res)=>{
//   try {
//     const {courseData} = req.body
//     const imageFile = req.file
//     const educatorID = req._id;        

//     if(!imageFile){
//       return res.status(400).json({success:false, message:'Thumbnail Not Attached'})
//     }

//     const parseCourseData = await JSON.parse(courseData);
//     parseCourseData.educator = educatorID;

//     if (!parseCourseData.educator) {
//       return res.status(400).json({ success: false, message: "Educator ID is missing" });
//     }
    
    
//     const newCourse = await Course.create(parseCourseData)
//     const imageUpload = await cloudinary.uploader.upload(imageFile.path)
//     newCourse.courseThumbnail = imageUpload.secure_url
//     await newCourse.save()
    
//     res.status(200).json({
//       success:true, message:"Course Added"
//     })
    
//   } catch (error) {
//     res.status(500).json({error, success:false, message:error.message})
    
//   }

// }

// Get educator courses

export const getEducatorCourses = async(req, res)=>{
  try {
    const educator = req._id;
    const courses = await Course.find({educator})
    res.status(200).json({
         success:true,
         courses
    })

  } catch (error) {
    res.json({
      success:false,
      message: error.message
    })
    
  }
}

// Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)

export const educatorDashboardData = async(req, res)=>{
  try {

    const educator = req._id;
    const courses = await Course.find({educator});
    const totalCourses = courses.length
    const courseIds = courses.map((course)=>course._id)


// Calcumate total earning from purchases

    const purchases = await Purchase.find({
      courseId: {$in:courseIds},
      status: 'completed'
    })

    const totalEarnings = purchases.reduce((sum, purchase)=>sum+purchase.amount, 0);
    

    const enrolledStudentsData = [];
    
    for(const course of courses){
      const students = await User.find({
        _id: {$in: course.enrolledStudents}
      }, 'name imageUrl')

      students.forEach(student=>{
        enrolledStudentsData.push({
          courseTitle:course.courseTitle,
          student
        })

      })

    }



    res.json({
      success:true,
      dashboardData:{
        totalEarnings, enrolledStudentsData, totalCourses
      }
    })
    
  } catch (error) {
    res.json({
      message:error.message,
      success: false
    })
    
  }
}
// get enrolled student data with purchased data

export const getEnrolledStudentData = (async(req, res)=>{
  try {
    const educator = req._id;
    const courses = await Course.find({educator})
    const courseIds = courses.map((course)=>course._id)

    const purchases = await Purchase.find({
      courseId:{$in: courseIds},
      status:'completed'
      }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

      const enrolledStudents = purchases.map((purchase)=>({
        student:purchase.userId,
        courseTitle:purchase.courseId.courseTitle,
        purchaseDate: purchase.createdAt
      }))

      res.json({
        success:true,
        enrolledStudents,

      })

    
  } catch (error) {
    res.json({
      success: false,
      message:error.message

    })
    
  }
})
