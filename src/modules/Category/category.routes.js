import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as categories from "./category.controller.js";
import { auth } from "../../middleware/authentication.middleware.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import {
  addCategorySchema,
  getCategoriesOfAuthUserSchema,
  deleteMyCategorySchema,
  updateMyCategorySchema,
} from "./category.schema.js";

const router = Router();
router.post(
  "/addCategory",
  errorHandler(auth()),
  errorHandler(validationMiddleware(addCategorySchema)),
  errorHandler(categories.addCategory)
);

router.get(
  "/getCategoriesOfAuthUser",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getCategoriesOfAuthUserSchema)),
  errorHandler(categories.getCategoriesOfAuthUserSchema)
);
router.get("/getAll", errorHandler(categories.getAll));

router.delete(
  "/deleteMyCategory/:_id",
  errorHandler(auth()),
  errorHandler(validationMiddleware(deleteMyCategorySchema)),
  errorHandler(categories.deleteMyCategory)
);

router.patch(
  "/updateMyCategory/:_id",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updateMyCategorySchema)),
  errorHandler(categories.updateMyCategory)
);
router.get("/paginate", errorHandler(categories.paginate));
router.get("/search", errorHandler(categories.search));
export default router;
