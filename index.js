import express from 'express';
import { config } from "dotenv";


import { db_connection } from "./DB/connection.js";
import taskRouter from './src/modules/Task/task.routes.js'
import userRouter from './src/modules/User/user.routes.js';
import categoryRouter from './src/modules/Category/category.routes.js'
import { globaleResponse } from './src/middleware/error-handling.middleware.js';



const app = express();

config();

const port = process.env.PORT;


app.use(express.json());



app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/task", taskRouter);



app.use(globaleResponse);



db_connection();


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
