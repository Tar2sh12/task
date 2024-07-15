import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as tasks from "./task.controller.js";
import { auth } from "../../middleware/authentication.middleware.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import {
  addTaskSchema,
  getTaskOfAuthUserSchema,
  deleteMyTaskSchema,
  updateMyTaskSchema,
} from "./task.schema.js";

const router = Router();
router.post(
  "/addTask/:_id", // category id
  errorHandler(auth()),
  errorHandler(validationMiddleware(addTaskSchema)),
  errorHandler(tasks.addTask)
);
router.get(
  "/getTaskOfAuthUser",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getTaskOfAuthUserSchema)),
  errorHandler(tasks.getTaskOfAuthUser)
);
router.get("/getAll", errorHandler(tasks.getAll));

router.delete(
  "/deleteMyTask/:_id",
  errorHandler(auth()),
  errorHandler(validationMiddleware(deleteMyTaskSchema)),
  errorHandler(tasks.deleteMyTask)
);

router.patch(
  "/updateMyTask/:_id",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updateMyTaskSchema)),
  errorHandler(tasks.updateMyTask)
);
export default router;
