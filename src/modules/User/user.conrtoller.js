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



