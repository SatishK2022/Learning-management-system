import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast"
import axiosInstance from "../../config/axiosInstance.js"

const initialState = {
    courseList: []
}

export const getAllCourses = createAsyncThunk('course/getAllCourses', async (data) => {
    const response = axiosInstance.get("courses", data)
    toast.promise(response, {
        loading: 'Fetching All Courses',
        success: (data) => {
            return data?.data?.message;
        },
        error: "Failed to Load Courses"
    })

    return (await response).data.courses;
})

export const createCourse = createAsyncThunk('/course/create', async (data) => {
    try {
        let formData = new FormData();
        formData.append('title', data?.title);
        formData.append('description', data?.description);
        formData.append('category', data?.category);
        formData.append('createdBy', data?.createdBy);
        formData.append('thumbnail', data?.thumbnail);

        const response = axiosInstance.post('/courses', formData);
        toast.promise(response, {
            loading: 'Creating Course',
            success: (data) => {
                return data?.data?.message;
            }, 
            error: "Failed to Create Course"
        })

        return (await response).data;

    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const deleteCourse = createAsyncThunk('/course/delete', async (courseId) => {
    try {
        const response = axiosInstance.delete(`/courses/${courseId}`);
        toast.promise(response, {
            loading: 'Deleting Course...',
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to Delete Course"
        })

        console.log(response)

        return (await response).data;

    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const getCourseDetails = createAsyncThunk("/course/courseDetails", async (courseId) => {
    try {
        const response = axiosInstance.get(`/courses/${courseId}`);
        toast.promise(response, {
            loading: 'Fetching Course Details...',
            success: "Course Details Fetched Successfully",
            error: "Failed to Fetch Course Details"
        })

        return (await response)?.data?.course;
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const updateCourse = createAsyncThunk('/course/update', async (data) => {
    try {
        console.log(data)

        const response = axiosInstance.put(`/courses/${data?.courseId}`, data?.userInput);
        console.log("Response: ", response)
        toast.promise(response, {
            loading: 'Updating Course',
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to Update Course"
        })

        return (await response).data;

    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllCourses.fulfilled, (state, action) => {
            if (action?.payload) {
                state.courseList = [...action.payload]
            }
        })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                if (action?.payload) {
                    state.courseList = state.courseList.filter(course => course._id !== action.payload._id)
                }
            })
    }
})

export default courseSlice.reducer;