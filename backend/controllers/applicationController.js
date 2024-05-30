import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import {Application} from '../models/applicationSchema.js';
import { Job } from "../models/jobSchema.js";
import cloudinary from 'cloudinary';

export const employerGetAllApplications = catchAsyncError(async(req, res, next) => {
    const { role } = req.user; 
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job seekers are not allowed to access this rosource.",
          400
        )
      );
    }
    const {_id} = req.user;
    const applications = await Application.find({'employerId.user': _id});
    res.status(200).json({
        success: true,
        applications
    })
});

export const jobSeekerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employers are not allowed to access this rosource.",
          400
        )
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantId.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobSeekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employers are not allowed to access this rosource.",
          400
        )
      );
    }
    const { id } = req.params;
    const applications = await Application.findById(id);
    if(!applications){
        return next(new ErrorHandler("No application found.", 404));
    }
    await applications.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application deleted successfully!",
    });
  }
);

export const postApplication = catchAsyncError(async(req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler(
        "Employers are not allowed to access this rosource.",
        400
      )
    );
  }
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new ErrorHandler('Resume file required!', 400));
  }
  const {resume} = req.files;

  const allowedFormats = ["image/png", "image/jpg", "image/webp"]; //cloudinary doesnt allow access to pdf files in frontend sonwe are using webp, png or jpg formats for resume
  if(!allowedFormats.includes(resume.mimetype)){
    return next(new ErrorHandler("Invalid file type. Please upload your resume in a png, jpg or webp format.", 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );
  if(!cloudinaryResponse || cloudinaryResponse.error){
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown cloudinary error");
    return next(new ErrorHandler("Failed to upload resume.", 500));
  }
  const {name, email, coverLetter, phone, address, jobId} = req.body
  const applicantId = {
    user: req.user._id,
    role: "Job Seeker"
  };
  if(!jobId){
    return next(new ErrorHandler("Job not found.", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if(!jobDetails){
    return next(new ErrorHandler("No such Job Found.", 404));
  }
  const employerId = {
    user: jobDetails.postedBy,
    role: "Employer"
  }
  if(!name || !email || !coverLetter || !phone || !address || !applicantId || !employerId || !resume){
    return next(new ErrorHandler("All fields are not filled out.", 400));
  }
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantId,
    employerId,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url
    },
  });
  res.status(200).json({
    success: true,
    message: "Application submitted",
    application,
  });
});