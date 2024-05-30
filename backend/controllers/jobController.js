import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import {Job} from '../models/jobSchema.js';

export const getAllJobs = catchAsyncError(async(req, res, next) => {
    const jobs = await Job.find({expired: false});  //to find jobs which are not expired
    res.status(200).json({
        success: true,
        jobs,
    });
});

export const postJob = catchAsyncError(async(req, res, next) => {
    const {role} = req.user;  //coming from auth.js which we have already used in route for jobPost 
    if(role == "Job Seeker"){
        return next(new ErrorHandler("Job seekers are not allowed to access this rosource.", 400));
    }
    const {title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo} = req.body;
    if(!title || !description || !category || !country || !city || !location){
        return next(new ErrorHandler('Please provide all fields.', 400));
    }
    if((!salaryFrom || !salaryTo) && !fixedSalary){
        return next(new ErrorHandler('Either salary range or fixed salary should be provided.', 400));
    }
    if(salaryFrom && salaryTo && fixedSalary){
        return next(new ErrorHandler('Cannot enter fixed salary and ranged salary together.', 400));
    }
    const postedBy = req.user._id;
    const job = await Job.create({
      title,
      description,
      category,
      country,
      city,
      location,
      fixedSalary,
      salaryFrom,
      salaryTo,
      postedBy
    });

    res.status(200).json({
        success: true,
        message: "Job posted successfully!",
        job
    })
});

// employer can get all the jobs posted by him so that they cannot edit the jobs posted by other employers
export const getMyJobs = catchAsyncError(async(req, res, next) => {
    const { role } = req.user; //coming from auth.js which we have already used in route for jobPost
    if (role == "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job seekers are not allowed to access this rosource.",
          400
        )
      );
    }
    const myjobs = await Job.find({postedBy: req.user._id});
    res.status(200).json({
        success:true,
        myjobs,
    });
});

export const updateJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user; 
    if (role == "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job seekers are not allowed to access this rosource.",
          400
        )
      );
    }
    const {id} = req.params;
    let job = await Job.findById(id);
    if(!job){
        return next(
          new ErrorHandler(
            "Oops! Job not found.",
            404
          )
        );
    }
    job = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message:"Job updated successfully!",
        job,
    })
});   

export const deleteJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role == "Job Seeker") {
    return next(
      new ErrorHandler(
        "Job seekers are not allowed to access this rosource.",
        400
      )
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job deleted successfully!",
    job,
  });
});   