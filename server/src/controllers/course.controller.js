import { Course } from "../models/course.model.js";
import ApiError from "../utils/apiError.js"
import cloudinary from "cloudinary"
import fs from "fs/promises"

async function getAllCourses(req, res, next) {
    try {
        const courses = await Course.find({}).select('-lectures');

        return res.status(200).json({
            success: true,
            message: "All courses",
            courses
        })
    } catch (error) {
        return next(new ApiError(500, error.message))
    }
}

async function getLecturesByCourseId(req, res, next) {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return next(new ApiError(404, "Course not found"));
        }

        return res.status(200).json({
            success: true,
            message: "Course Lectures fetched Successfully",
            lectures: course.lectures
        })
    } catch (error) {
        return next(new ApiError(500, error.message))
    }
}

async function createCourse(req, res, next) {
    try {
        const { title, description, category, createdBy } = req.body;

        if (!title || !description || !category || !createdBy) {
            return next(new ApiError(400, "All fields are required"));
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: "DUMMY",
                secure_url: "DUMMY",
            }
        })

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms/thumbnails'
            })

            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }

            fs.rm(`./public/${req.file.filename}`);
        }

        await course.save();

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        })

    } catch (error) {
        return next(new ApiError(500, error.message))
    }
}

async function updateCourse(req, res, next) {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: req.body
            },
            { runValidators: true }
        )

        if (!course) {
            return next(new ApiError(404, "Course not found"));
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
        })
    } catch (error) {
        return next(new ApiError(500, error.message))
    }
}

async function deleteCourse(req, res, next) {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return next(new ApiError(404, "Course not found"));
        }

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        return next(new ApiError(500, error.message))
    }
}

async function addLectureToCourseById(req, res, next) {
    try {
        const { title, description } = req.body;
        const { courseId } = req.params;

        if (!title || !description) {
            return next(new ApiError(400, "All fields are required"));
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return next(new ApiError(404, "Course not found"));
        }

        const lectureData = {
            title,
            description,
            lecture: {}
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms/lectures'
            })

            if (result) {
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }

            fs.rm(`./public/${req.file.filename}`);
        }

        course.lectures.push(lectureData);
        course.numberOfLectures = course.lectures.length;
        await course.save();

        return res.status(200).json({
            success: true,
            message: "Lecture added successfully",
            course
        })

    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

async function removeLectureFromCourse(req, res, next) {
    try {
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return next(new ApiError(404, "Course not found"));
        }

        course.lectures = course.lectures.filter(lecture => lecture._id.toString() !== lectureId);
        course.numberOfLectures = course.lectures.length;

        await course.save();
        
        return res.status(200).json({
            success: true,
            message: "Lecture removed successfully",
            course
        })
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    deleteCourse,
    addLectureToCourseById,
    removeLectureFromCourse
}