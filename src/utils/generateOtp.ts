import dotenv from 'dotenv';
import nodemailer from "nodemailer";
dotenv.config()
const transporter=nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:Number(process.env.EMAIL_PORT),
    secure:process.env.EMAIL_PORT === "465",
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASS
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.error("nodemailer configuration error:", error);
    }else{
        console.log('nodemailer setup ready')
    }
})

export default transporter;