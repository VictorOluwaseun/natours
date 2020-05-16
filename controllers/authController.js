const crypto = require("crypto");
const {
  promisify
} = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = id => {
  return jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure = req.secure || req.headers["x-forwarded-proto"] === "https"
  };

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  //process.env.NODE_ENV === production does not mean connection is actually secured because of course not all deplyed application will automatically set to https. So there is need to change process.env.NODE_ENV === production. In express, there is secure property on a request.When a request is secure, then the req.secure is true

  // if (req.secure) cookieOptions.secure = true;

  //The problem with this is, with heroku this does not work. Because heroku proxies so basically redirects or modifies all incomint requests into the application b4 they actually read the app. For it to make it work on heroku, there is need to test if req.headers["x-forwarded-proto"] === "https")

  // if (req.secure || req.headers["x-forwarded-proto"] === "https") cookieOptions.secure = true; //refactor
  // cookieOptions.secure = req.secure || req.headers["x-forwarded-proto"] === "https"

  res.cookie("jwt", token, cookieOptions);

  //Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); for admin...puting all data coming from the body 
  // const { name, email, password, passwordConfirm } =req.body;  //don't rush, be calm
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role //get another method
    // name,
    // email,
    // password,
    // passwordConfirm
  });

  const url = `${req.protocol}:/${req.get("host")}/me`;
  // console.log(url);

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);

  //   const token = signToken(newUser._id);

  //   res.status(201).json({
  //     status: "success",
  //     token,
  //     data: {
  //       user: newUser
  //     }
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  //1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //2. Check if the user exists && password is correct
  const user = await User.findOne({
    email
  }).select("+password");
  // const correct =  await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3. if everything ok, send token to client

  createSendToken(user, 200, req, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token
  // });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 1 * 1000), //instead 10 used 1
    httpOnly: true
  });
  res.status(200).json({
    status: "success"
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }
  //2. Validate the token/ verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //async 

  //3. Check if user still exists //some will stop here. If the user has been deleted in mean time, the token will still exits. This is important for proper security
  const currentUser = await User.findById(decoded.id); //To check if the user still exists

  if (!currentUser) {
    return next(new AppError("The user belonging to the token no longer exists.", 401)); //message not deliver in delivered in globalerrorhandler
  }
  //4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please log in again.", 401));
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      ); //async 

      //3. Check if user still exists 
      const currentUser = await User.findById(decoded.id); //To check if the user still exists
      if (!currentUser) {
        return next();
      }
      //4. Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGGED IN USER
      res.locals.user = currentUser; //To make the user to the template
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

//wrapper function
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ["admin", "lead-guide"], role = "user"
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403)); //forbidden
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on Posted email
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  //2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });

  //3. Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

    // await sendEmail({ // the try catch block is needed because we want to do more than sending error to global error handling middleware and send error to the client
    //   // email: user.email,
    //   email: req.body.email,
    //   subject: "Your password reset token (valid for 10 mins)",
    //   message
    // });

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Token sent to email"
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false
    });
    // the try catch block to do more
    return next(new AppError("There was an error sending the email. Try again later", 500));
  }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  }); //acutally token is the only thing we have about the user right now, no email and all that //b. putting the expiring into consideration

  //2. If token has not expired, and there is user, set the new password
  //actually if the token has expired, it will return the user
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //validation runs here again. So it will not save if the validation didn't pass. More reason while save is better to use. For tours, we use findOneAndUpdate which will not run the validation again. So, anything pertaining to password, save is used in order to run the validation again and also the save middleware function
  //3. Update changePasswordAt property for the user

  //4. Log the user in, send JWT
  createSendToken(user, 200, req, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get the user from collection
  //since the user is already logged in, get id from JWT but user id on the request object
  const user = await User.findById(req.user.id).select("+password");

  //2. Check if the posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  //3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate will NOT work as intended!
  //4. Log User in, Send JWT
  createSendToken(user, 200, req, res);
});