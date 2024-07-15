import mongoose from "mongoose";
export const db_connection = async ()=>{
    try {
         await mongoose.connect(process.env.CONNECTION_DB_URI)
        console.log("connected successfully ");
    } catch (error) {
        console.log("Error in db connection");
    }
}