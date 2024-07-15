import Task from "../../../DB/models/task.model.js";
import Category from "../../../DB/models/category.model.js";
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message , task}
 * @description addJob
 */
export const addTask = async (req, res, next) => {
  const { list, text, privacy } = req.body;
  const { authUser } = req;
  const { _id } = req.params; // category id
  const category = await Category.findById(_id);
  if (!category) {
    return next(
      new ErrorClass(
        "this category is not an existing one",
        400,
        "this category is not an existing one"
      )
    );
  }
  if (!category.createdBy == authUser._id) {
    return next(
      new ErrorClass(
        "you are not allowed to add this task",
        401,
        "you are not allowed to add this task"
      )
    );
  }
  const task = new Task({
    list,
    text,
    privacy,
    addedBy: _id,
    owner: authUser._id,
  });
  await task.save();
  res.status(201).json({ msg: "task created", task });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response { task}
 * @description get tasks of autheticated user
 */
export const getTaskOfAuthUser = async (req, res, next) => {
  const { authUser } = req;
  const tasks = await Task.find({ owner: authUser._id });
  res.status(200).json({ tasks });
};
export const getAll = async (req, res, next) => {
// Filtering By task shared option (Public/Private)   
const tasks = await Task.find({ privacy: "public" }).populate([
    { path: "addedBy" },{path:"owner",select: '-password -isConfirmed -status'}
  ]);
  res.status(200).json({ tasks });
};

export const deleteMyTask = async (req, res, next) => {
  const { authUser } = req;
  const { _id } = req.params; // task id
  const task = await Task.findById({ _id });
  if (!task) {
    return next(
      new ErrorClass(
        "this task does not exist",
        401,
        "this task does not exist"
      )
    );
  }
  if (!task.owner == authUser._id) {
    return next(
      new ErrorClass(
        "you are not allowed to delete this task",
        401,
        "you are not allowed to delete this task"
      )
    );
  }
  const deletedTask = await Task.findByIdAndDelete({ _id });
  res.status(200).json({ msg: "task deleted ", deletedTask });
};
export const updateMyTask = async (req, res, next) => {
  const { authUser } = req;
  const { _id } = req.params; // task id
  const { privacy } = req.body;
  const task = await Task.findById({ _id });
  if (!task) {
    return next(
      new ErrorClass(
        "this task does not exist",
        401,
        "this task does not exist"
      )
    );
  }
  if (!task.owner == authUser._id) {
    return next(
      new ErrorClass(
        "you are not allowed to update this task",
        401,
        "you are not allowed to update this task"
      )
    );
  }
  const updatedTask = await Task.findByIdAndUpdate(
    { _id },
    { privacy },
    { new: true }
  );
  res.status(200).json({ msg: "task updated ", updatedTask });
};
