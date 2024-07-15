import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as users from "./user.conrtoller.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import {
  changePassword,
  deleteSchema,
  forgetPassword,
  getByIdSchema,
  getInfoSchema,
  logInSchema,
  logOutSchema,
  recoveryEmailSchema,
  SignUpSchema,
  updatePassSchema,
  updateSchema,
  verifySchema,
} from "./user.schema.js";

import { auth } from "../../middleware/authentication.middleware.js";
const router = Router();
router.post(
  "/signUp",
  errorHandler(validationMiddleware(SignUpSchema)),
  errorHandler(users.signUp)
);
router.post(
  "/login",
  errorHandler(validationMiddleware(logInSchema)),
  errorHandler(users.login)
);
router.patch(
  "/logout",
  errorHandler(auth()),
  errorHandler(validationMiddleware(logOutSchema)),
  errorHandler(users.logOut)
);

router.put(
  "/update",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updateSchema)),
  errorHandler(users.updateUser)
);
router.delete(
  "/delete",
  errorHandler(auth()),
  errorHandler(validationMiddleware(deleteSchema)),
  errorHandler(users.deleteUser)
);
router.get(
  "/getInfo",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getInfoSchema)),
  errorHandler(users.getInfo)
);
router.get(
  "/getById/:_id",
  errorHandler(validationMiddleware(getByIdSchema)),
  errorHandler(users.getById)
);
router.patch(
  "/updatePass",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updatePassSchema)),
  errorHandler(users.updatePass)
);
router.get(
  "/recoveryEmail",
  errorHandler(validationMiddleware(recoveryEmailSchema)),
  errorHandler(users.getAllRecovery)
);
router.get(
  "/confirmation/:confirmationToken",
  errorHandler(validationMiddleware(verifySchema)),
  errorHandler(users.verifyEmail)
);
router.post(
  "/forgetPass",
  errorHandler(validationMiddleware(forgetPassword)),
  errorHandler(users.forgetPassword)
);
router.patch(
  "/changePass",
  errorHandler(validationMiddleware(changePassword)),
  errorHandler(users.changePassword)
);
export default router;
