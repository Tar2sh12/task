// import Company from "../../../DB/models/company.model.js";
import User from "./../../../DB/models/user.model.js";
// import Job from "../../../DB/models/job.model.js";
// import Application from "../../../DB/models/application.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
import { sendEmailService } from "../../services/send-email.service.js";

import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message,userInstance }
 * @description sign up
 */
export const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  const isEmailAndPhoneExist = await User.findOne({ email });
  if (isEmailAndPhoneExist) {
    return next(
      new ErrorClass("Email already exists", 400, "Email already exists")
    );
  }

  //hashing password
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  const userInstance = new User({
    name,
    email,
    password: hashedPassword,
  });
  //generate token instead of sending _id
  const confirmationToken = jwt.sign(
    { user: userInstance },
    process.env.CONFIRM_TOKEN,
    { expiresIn: "1d" }
  );
  // generate email confirmation link
  const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirmation/${confirmationToken}`;
  //sending email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "welcome",
    htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
  });
  if (isEmailSent.rejected.length) {
    return res
      .status(500)
      .json({ msg: "verification email sending is failed " });
  }

  await userInstance.save();
  res.status(201).json({ msg: "user created ", userInstance });
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message, confirmed user}
 * @description verify email
 */
export const verifyEmail = async (req, res, next) => {
  const { confirmationToken } = req.params;
  const data = jwt.verify(confirmationToken, process.env.CONFIRM_TOKEN);
  // updating isConfirmed to true
  const confirmedAuthor = await User.findOneAndUpdate(
    { _id: data?.user._id, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!confirmedAuthor) {
    return res.status(404).json({ msg: "not confirmed" });
  }
  res
    .status(200)
    .json({ msg: "User email successfully confirmed ", confirmedAuthor });
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message, token}
 * @description login user
 */

export const login = async (req, res, next) => {
  // destruct email and password from req.body
  const { email, password } = req.body;
  // find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }

  // compare password
  const isMatch = compareSync(password, user.password);
  if (!isMatch) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }
  //update status
  user.status = true;
  await user.save();
  // generate the access token
  const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET, {
    expiresIn: "1d",
  });

  // response
  res.status(200).json({ message: "Login success", token });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message}
 * @description log out
 */
export const logOut = async (req, res, next) => {
  const { authUser } = req;
  const user = await User.findById(authUser._id);
  user.status = false;
  await user.save();
  res.status(200).json({ msg: "logged out successfuly" });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message, user}
 * @description update user
 */
export const updateUser = async (req, res, next) => {
  const { authUser } = req;
  const { email, phone, recoveryEmail, DOB, lastName, firstName } = req.body;
  const isEmailAndPhoneExist = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (isEmailAndPhoneExist) {
    return next(
      new ErrorClass(
        "Email or phone already exists",
        400,
        "Email or phone already exists"
      )
    );
  }

  if (email) {
    const userByEmail = await User.findByIdAndUpdate(
      authUser._id,
      {
        isConfirmed: false,
      },
      { new: true }
    );
    //generate token instead of sending _id
    const confirmationToken = jwt.sign(
      { user: userByEmail },
      process.env.CONFIRM_TOKEN,
      { expiresIn: "1h" }
    );
    // generate email confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirmation/${confirmationToken}`;
    //sending email
    const isEmailSent = await sendEmailService({
      to: email,
      subject: "welcome",
      htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });
    if (isEmailSent.rejected.length) {
      return res
        .status(500)
        .json({ msg: "verification email sending is failed " });
    }
  }
  //find user and update
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      email,
      phone,
      recoveryEmail,
      DOB,
      lastName,
      firstName,
    },
    { new: true }
  );
  // update username field
  user.userName = user.firstName + " " + user.lastName;
  await user.save();
  res.status(200).json({ msg: "user updated ", user });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message,  deleteCompany, deleteJob, dUser, deleteApp}
 * @description delete user
 */
export const deleteUser = async (req, res, next) => {
  const { authUser } = req;
  const job = await Job.find({ addedBy: authUser._id }).select("_id");
  let jobs = [];
  // store all jobs added by the authenticated user
  job.forEach((e) => {
    jobs.push(e._id);
  });
  //delete company
  const deleteCompany = await Company.deleteMany({ companyHR: authUser._id });
  //delete applications that is either applied by the authenticated user or created by jobs we deleted
  const deleteApp = await Application.deleteMany({
    $or: [{ userId: authUser._id }, { jobId: { $in: jobs } }],
  });
  //delete job
  const deleteJob = await Job.deleteMany({ addedBy: authUser._id });
  //delete user
  const dUser = await User.findByIdAndDelete(authUser._id);

  res
    .status(200)
    .json({ msg: "user deleted ", deleteCompany, deleteJob, dUser, deleteApp });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response { user}
 * @description get user information
 */
export const getInfo = async (req, res, next) => {
  const { authUser } = req;
  // return user information except password and _id
  const user = await User.findById(authUser._id).select("-password -_id");
  res.status(200).json({ user });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response { user}
 * @description get user information by id
 */
export const getById = async (req, res, next) => {
  const { _id } = req.params;
  //get user by id
  const user = await User.findById(_id).select("-password -_id");
  // user not found
  if (!user) {
    return next(
      new ErrorClass(
        "there is no matched users",
        400,
        "there is no matched users"
      )
    );
  }

  res.status(200).json({ user });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message user}
 * @description update password
 */
export const updatePass = async (req, res, next) => {
  const { authUser } = req;
  const { password } = req.body;
  // hashing the new pass
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      password: hashedPassword,
    },
    { new: true }
  );
  res.status(200).json({ msg: "user password updated ", user });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response { user}
 * @description get users associated with specific recovery email
 */
export const getAllRecovery = async (req, res, next) => {
  const { recoveryEmail } = req.body;
  const user = await User.find({ recoveryEmail }).select("-password -_id");
  if (!user.length) {
    return next(
      new ErrorClass(
        "there is no matched users",
        400,
        "there is no matched users"
      )
    );
  }
  res.status(200).json({ user });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message}
 * @description forget password
 */
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const isUserExists = await User.findOne({
    $or: [{ email }, { recoveryEmail: email }],
  });
  if (!isUserExists) {
    return next(
      new ErrorClass("email doesn't exist", 400, "email doesn't exist")
    );
  }
  //sending email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "welcome",
    htmlMessage: `<h1>your otp numbers for reseting the password are : ${isUserExists.otp}</h1>`,
  });
  if (isEmailSent.rejected.length) {
    return res
      .status(500)
      .json({ msg: "verification email sending is failed " });
  }
  res.json({ msg: "check your email" });
};

/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message , savedUser}
 * @description change password
 */
export const changePassword = async (req, res, next) => {
  const { email, password, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass("email doesn't exist", 400, "email doesn't exist")
    );
  }
  if (!user?.otp == otp) {
    return new ErrorClass("otp is wrong", 400, "otp is wrong");
  }
  // generating new otp and store the new one in the DB
  const newOTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  user.password = hashedPassword;
  user.otp = newOTP;
  const savedUser = await user.save();
  res.json({ msg: "password changed", savedUser });
};
