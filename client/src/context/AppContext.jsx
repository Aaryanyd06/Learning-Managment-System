import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'

export const AppContext = createContext()

export const AppContextProvider = (props)=>{

    const currency = process.env.REACT_APP_CURRENCY || "₹"
    console.log(currency)

    const navigate=useNavigate()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    //Fetch all courses
    const fetchAllCourses = async()=>{
        setAllCourses(dummyCourses)
    }
    useEffect(()=>{
        fetchAllCourses()
        fetchUserEnrolledCourses()
    }, [])

    const calculateRating=(course)=>{
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return totalRating/course.courseRatings.length
    }

    //Function to cal course chapter time
    const calulcateChapterTime = (chapter)=>{
        let time = 0;
        chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
        return humanizeDuration(time*60*1000, {units :["h", "m"]})
    }

    // course duration
    const calculateCourseDuration = (course)=>{
        let time = 0

        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration))

          return humanizeDuration(time*60*1000, {units :["h", "m"]}) 
    }

    //num of lecture in course
    const calculateNoOfLectures = (course)=>{
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length
            }
        });
        return totalLectures;
    }

    //Fetch user enrolled courses
    const fetchUserEnrolledCourses = async()=>{
        setEnrolledCourses(dummyCourses)
    }
    const value = {
        currency, allCourses, navigate, calculateRating, isEducator, setIsEducator, calculateCourseDuration, calculateNoOfLectures, calulcateChapterTime, enrolledCourses, fetchUserEnrolledCourses
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}