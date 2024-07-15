import Category from "../../../DB/models/category.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
import Task from "../../../DB/models/task.model.js";
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message , category}
 * @description addCategory
 */
export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  const { authUser } = req;
  const category = new Category({ name, createdBy: authUser._id });
  await category.save();
  res.status(201).json({ msg: "category created", category });
};
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {categories}
 * @description getCategoriesOfAuthUserSchema
 */
export const getCategoriesOfAuthUserSchema = async (req, res, next) => {
  const { authUser } = req;
  const categories = await Category.find({ createdBy: authUser._id });
  //.populate({path:"createdBy"})
  res.status(200).json({ categories });
};


/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message , deletedCategory, deletedTask}
 * @description deleteMyCategory
 */
export const deleteMyCategory = async (req, res, next) => {
  const { authUser } = req;
  const { _id } = req.params; // category id
  const category = await Category.findById({ _id });
  if (!category) {
    return next(
      new ErrorClass(
        "this category does not exist",
        400,
        "this category does not exist"
      )
    );
  }
  if (!category.createdBy == authUser._id) {
    return next(
      new ErrorClass(
        "you are not allowed to delete this category",
        401,
        "you are not allowed to delete this category"
      )
    );
  }
  const deletedCategory = await Category.findByIdAndDelete({ _id });
  const deletedTask = await Task.deleteMany({ addedBy: _id });
  res.status(200).json({ msg: "task category ", deletedCategory, deletedTask });
};



/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message ,updatedCategory}
 * @description updateMyCategory
 */
export const updateMyCategory = async (req, res, next) => {
  const { authUser } = req;
  const { _id } = req.params; // category id
  const { name } = req.body;
  const category = await Category.findById({ _id });
  if (!category) {
    return next(
      new ErrorClass(
        "this category does not exist",
        400,
        "this category does not exist"
      )
    );
  }
  if (!category.createdBy == authUser._id) {
    return next(
      new ErrorClass(
        "you are not allowed to update this category",
        401,
        "you are not allowed to update this category"
      )
    );
  }
  const updatedCategory = await Category.findByIdAndUpdate(
    { _id },
    { name },
    { new: true }
  );
  res.status(200).json({ msg: "category updated ", updatedCategory });
};
//pagination function
async function paginateCat(pageNumber, pageSize) {
  const skip = (pageNumber - 1) * pageSize;
  try {
    const categories = await Category.find()
      .sort({ name: -1 }) // Sort by catgerory name descending
      .skip(skip)
      .limit(pageSize)
      .exec();
    return categories;
  } catch (err) {
    console.error("Error paginating categories:", err);
    throw err;
  }
}



/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message , categories}
 * @description paginate
 */
export const paginate = async (req, res, next) => {
    const pageNumber = 1; // Page number (1-based index)
    const pageSize = 3; // Number of items per page
    paginateCat(pageNumber, pageSize)
    .then((categories) => {
      res.status(200).json({msg:`page number ${pageNumber}`,categories})
    })
    .catch((err) => {
        return next(
            new ErrorClass(
              err,
              400,
              err
            )
          );
    });
};

//
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message}
 * @description Filtering By Category Name 
 */
export const search = async (req, res, next) => {
    const { search } = req.body;
    const result = await Category.find({
      name: { $regex: search, $options: "i" }, // for making it case insensitive search
    });
    res.json({ msg: result });
  };
  