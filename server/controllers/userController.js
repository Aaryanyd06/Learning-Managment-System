import { connect } from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import {Purchase} from "../models/purchase.js"
import Stripe from "stripe";
// import { User } from "@clerk/express";
export const getUserData = async (req, res)=>{
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)

        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        res.json({success:true, user})
    } catch (error) {
        res.json({success:false, message: error.message})        
    }
}

export const userEnrolledCourses = async(req,res)=>{
    try {
        const { userId } = req.auth()
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({success:true, enrolledCourses: userData.enrolledCourses})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

export const purchaseCourse = async(req,res)=>{
    try {
        const { courseId } = req.body
        const {origin} = req.headers
        const userId  = req.auth.userId;
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)
        console.log(userId)
        console.log(courseData)
        console.log(userData)
        console.log(1)


        if(!userData || !courseData){
            return res.json({success: false, message: 'Data not found'})
        }

        const amount =  Number((courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2));
        console.log(amount)
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount,
        }
            console.log(purchaseData)
            const newPurchase = await Purchase.create(purchaseData)
            
            console.log(newPurchase)
            const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

            console.log("stripew instance created")
            const currency = process.env.CURRENCY.toLowerCase()

            const line_items = [{
                price_data: {
                    currency,
                    product_data: {
                        name: courseData.courseTitle
                    },
                    unit_amount: Math.floor(amount) * 100
                },
                quantity: 1
            }]
            console.log(line_items)

            console.log("entering webhook")

            const session = await stripeInstance.checkout.sessions.create({
                success_url: `${origin}/loading/my-enrollments`,
                cancel_url: `${origin}/`,
                line_items: line_items,
                mode: 'payment',
                metadata: {
                    purchaseId: newPurchase._id.toString()
                }
            })
            console.log("Out of webhoooks")
            res.json({success: true, session_url : session.url})

    } catch (error) {
         res.json({success:false, message: error.message});
    }
}

export const updateUserCourseProgress = async (req, res)=>{
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body

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
                lectureCompleted: [lectureId]
            })
        }
        res.json({success: true, message: 'Progress updated'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getUserCourseProgress = async(req, res)=>{
    try {
         const userId = req.auth.userId
        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({userId, courseId})

        res.json({success: true, progressData})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const addUserRating = async(req, res)=>{
    const userId = req.auth.userId
    const { courseId, rating } = req.body;

    if(!userId || !courseId || !rating || rating < 1 || rating > 5){
        return res.json({success: false, message: 'invalid details'})
    }

    try {
        const course = await Course.findById(courseId)

        if(!course){
            return res.json({success:false, message:' course not found'})
        }

        const user = await User.findById(userId);
        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success: false, message: 'not purchased'})
        }
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)

        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating
        }else{
            course.courseRatings.push({userId, rating})
        }
        await course.save();

        return res.json({success: true, message: 'Rating added'})

    } catch (error) {
        res.json({success: false, message: error.message});
    }

}