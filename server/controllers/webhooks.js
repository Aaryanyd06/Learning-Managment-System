import { Webhook } from "svix";
import User from "../models/User.js";

console.log("entered whook")
export const clerkWebhooks = async (req, res)=>{
    try{
        console.log("starting")
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        console.log("calling svix")

        await whook.verify(JSON.stringify(req.body), {
            "svix-id":req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        console.log("svix-verified")

        const {data, type} = req.body
        console.log(data)
        console.log(type)
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url
                }
                await User.create(userData)
                res.json({})
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                console.log("Yes")
                break;
            }


            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }
            default:
                break;
        }
    }
    catch (error){
        console.error("Webhook verification failed:", error);
        res.json({success: false, message: error.message})
    }
}