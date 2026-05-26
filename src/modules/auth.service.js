// const User = require("../models/user");
// const ApiError = require("../utlis/ApiError");
// const { verifyGoogleToken } = require("../services/google.service");
// const { createAndSendOtp, verifyOtp } = require("../services/otp.service");
// const { hashValue } = require("../utlis/hash");
// const {
//   USER_STATUS,
//   AUTH_PROVIDER,
//   OTP_PURPOSE,
// } = require("./auth.constants");
// const { compareHash } = require("../utlis/hash");
// const {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
//   extractBearerToken,
// } = require("../services/jwt.service");

// // const googleSignup = async (idToken) => {
// //   const googleUser = await verifyGoogleToken(idToken);

// //   if (!googleUser.emailVerified) {
// //     throw new ApiError(400, "Google email is not verified");
// //   }

// //   let user = await User.findOne({ email: googleUser.email });

// //   if (!user) {
// //     user = await User.create({
// //       googleId: googleUser.googleId,
// //       name: googleUser.name,
// //       email: googleUser.email,
// //       authProvider: AUTH_PROVIDER.GOOGLE,
// //       status: USER_STATUS.PHONE_REQUIRED,
// //     });
// //   }

// //   return {
// //     userId: user._id,
// //     email: user.email,
// //     name: user.name,
// //     status: user.status,
// //     nextStep: user.status,
// //   };
// // };

// const buildActiveSessionResponse = (user, message, extra = {}) => {
//   return {
//     userId: user._id,
//     email: user.email,
//     name: user.name || null,
//     status: user.status,
//     isExistingUser: true,
//     nextStep: "VERIFY_LOGIN_PIN",
//     redirectTo: "VERIFY_PIN_PAGE",
//     message,
//     ...extra,
//   };
// };

// const getValidAccessTokenPayload = (cookies = {}, authHeader) => {
//   const tokenCandidates = [
//     extractBearerToken(authHeader),
//     cookies?.accessToken,
//   ].filter(Boolean);

//   for (const token of tokenCandidates) {
//     try {
//       return verifyAccessToken(token);
//     } catch (error) {}
//   }

//   return null;
// };

// const googleSignup = async (idToken, cookies = {}, authHeader) => {
//   if (!idToken) {
//     throw new ApiError(400, "Google ID token is required");
//   }

//   const googleUser = await verifyGoogleToken(idToken);

//   if (!googleUser.emailVerified) {
//     throw new ApiError(400, "Google email is not verified");
//   }

//   const normalizedEmail = googleUser.email.toLowerCase().trim();

//   let user = await User.findOne({ email: normalizedEmail });

//   // CASE 1: New Google user
//   if (!user) {
//     user = await User.create({
//       googleId: googleUser.googleId,
//       name: googleUser.name,
//       email: normalizedEmail,
//       authProvider: AUTH_PROVIDER.GOOGLE,
//       status: USER_STATUS.PHONE_REQUIRED,
//     });

//     return {
//       userId: user._id,
//       email: user.email,
//       name: user.name || null,
//       status: user.status,
//       isExistingUser: false,
//       nextStep: USER_STATUS.PHONE_REQUIRED,
//       redirectTo: "PHONE_PAGE",
//       message: "New user. Continue signup.",
//     };
//   }

//   // Update Google details if missing
//   if (!user.googleId) user.googleId = googleUser.googleId;
//   if (!user.name) user.name = googleUser.name;
//   await user.save();

//   // CASE 2: Existing active user
//   if (user.status === USER_STATUS.ACTIVE) {
//     return handleActiveUserSession(user, cookies, authHeader);
//   }

//   // CASE 3: Existing but signup not completed
//   return {
//     userId: user._id,
//     email: user.email,
//     name: user.name || null,
//     status: user.status,
//     isExistingUser: true,
//     nextStep: user.status,
//     redirectTo: getRedirectPageByStatus(user.status),
//     message: "Signup not completed. Continue onboarding.",
//   };
// };
// const handleActiveUserSession = async (user, cookies = {}, authHeader) => {
//   const refreshToken = cookies?.refreshToken;

//   const decodedAccessToken = getValidAccessTokenPayload(cookies, authHeader);

//   if (
//     decodedAccessToken &&
//     decodedAccessToken.userId === user._id.toString() &&
//     decodedAccessToken.email === user.email
//   ) {
//     return buildActiveSessionResponse(user, "Session active. Verify PIN.");
//   }

//   if (refreshToken) {
//     try {
//       const decoded = verifyRefreshToken(refreshToken);

//       if (
//         decoded.userId === user._id.toString() &&
//         decoded.email === user.email
//       ) {
//         const newAccessToken = generateAccessToken(user);

//         return buildActiveSessionResponse(user, "Session refreshed. Verify PIN.", {
//           accessToken: newAccessToken,
//         });
//       }
//     } catch (error) {}
//   }

//   return {
//     userId: user._id,
//     email: user.email,
//     name: user.name || null,
//     status: user.status,
//     isExistingUser: true,
//     nextStep: "LOGIN_REQUIRED",
//     redirectTo: "LOGIN_PAGE",
//     message: "User already exists. Please login.",
//   };
// };

// const submitPhoneNumber = async (userId, phoneNumber) => {
//   if (!userId || !phoneNumber) {
//     throw new ApiError(400, "User ID and phone number are required");
//   }
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }
//   if (user.status !== USER_STATUS.PHONE_REQUIRED) {
//     throw new ApiError(400, "Phone number cannot be submitted at this stage");
//   }
//   user.phoneNumber = phoneNumber;
//   user.status = USER_STATUS.PHONE_OTP_PENDING;
//   await user.save();
//   await createAndSendOtp({
//     userId: user._id,
//     email: user.email,
//     purpose: OTP_PURPOSE.PHONE_VERIFICATION,
//   });
//   return {
//     userId: user._id,
//     status: user.status,
//     nextStep: USER_STATUS.PHONE_OTP_PENDING,
//   };
// };

// const verifyPhoneOtp = async (userId, otp) => {
//   if (!userId || !otp) {
//     throw new ApiError(400, "User ID and OTP are required");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (user.status !== USER_STATUS.PHONE_OTP_PENDING) {
//     throw new ApiError(400, "OTP verification not allowed at this stage");
//   }

//   await verifyOtp({
//     userId: user._id,
//     otp,
//     purpose: OTP_PURPOSE.PHONE_VERIFICATION,
//   });

//   user.phoneVerified = true;
//   user.status = USER_STATUS.PIN_REQUIRED;
//   await user.save();

//   return {
//     userId: user._id,
//     status: user.status,
//     nextStep: USER_STATUS.PIN_REQUIRED,
//   };
// };

// const setPin = async (userId, pin) => {
//   if (!userId || !pin) {
//     throw new ApiError(400, "User ID and PIN are required");
//   }

//   if (!/^\d{4}$/.test(pin)) {
//     throw new ApiError(400, "PIN must be exactly 4 digits");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (user.status !== USER_STATUS.PIN_REQUIRED) {
//     throw new ApiError(400, "PIN cannot be set at this stage");
//   }

//   user.pinHash = await hashValue(pin);
//   user.status = USER_STATUS.PIN_OTP_PENDING;
//   await user.save();

//   await createAndSendOtp({
//     userId: user._id,
//     email: user.email,
//     purpose: OTP_PURPOSE.PIN_CONFIRMATION,
//   });

//   return {
//     userId: user._id,
//     status: user.status,
//     nextStep: USER_STATUS.PIN_OTP_PENDING,
//   };
// };

// const verifyPinOtp = async (userId, otp) => {
//   if (!userId || !otp) {
//     throw new ApiError(400, "User ID and OTP are required");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (user.status !== USER_STATUS.PIN_OTP_PENDING) {
//     throw new ApiError(400, "PIN OTP verification not allowed at this stage");
//   }

//   await verifyOtp({
//     userId: user._id,
//     otp,
//     purpose: OTP_PURPOSE.PIN_CONFIRMATION,
//   });

//   user.status = USER_STATUS.PASSWORD_REQUIRED;
//   await user.save();

//   return {
//     userId: user._id,
//     status: user.status,
//     nextStep: USER_STATUS.PASSWORD_REQUIRED,
//   };
// };

// const setPassword = async (userId, password) => {
//   if (!userId || !password) {
//     throw new ApiError(400, "User ID and password are required");
//   }

//   if (password.length < 8) {
//     throw new ApiError(400, "Password must be at least 8 characters");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (user.status !== USER_STATUS.PASSWORD_REQUIRED) {
//     throw new ApiError(400, "Password cannot be set at this stage");
//   }

//   user.passwordHash = await hashValue(password);
//   user.status = USER_STATUS.ACTIVE;
//   user.lastLoginAt = new Date();
//   await user.save();

//   return {
//     userId: user._id,
//     email: user.email,
//     status: user.status,
//     nextStep: USER_STATUS.ACTIVE,
//   };
// };

// const login = async (email, password) => {
//   if (!email || !password) {
//     throw new ApiError(400, "Email and password are required");
//   }

//   const user = await User.findOne({ email: email.toLowerCase() });

//   if (!user) {
//     throw new ApiError(401, "Invalid email or password");
//   }

//   if (user.status !== USER_STATUS.ACTIVE) {
//     throw new ApiError(403, `Signup not completed. Current step: ${user.status}`);
//   }

//   const isPasswordValid = await compareHash(password, user.passwordHash);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid email or password");
//   }

//   return {
//     userId: user._id,
//     email: user.email,
//     nextStep: "PIN_REQUIRED",
//   };
// };

// const verifyLoginPin = async (userId, pin) => {
//   if (!userId || !pin) {
//     throw new ApiError(400, "User ID and PIN are required");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (user.status !== USER_STATUS.ACTIVE) {
//     throw new ApiError(403, "User account is not active");
//   }

//   const isPinValid = await compareHash(pin, user.pinHash);

//   if (!isPinValid) {
//     throw new ApiError(401, "Invalid PIN");
//   }

//   const accessToken = generateAccessToken(user);
//   const refreshToken = generateRefreshToken(user);

//   user.lastLoginAt = new Date();
//   await user.save();

//   return {
//     user: {
//       userId: user._id,
//       email: user.email,
//       name: user.name,
//     },
//     tokens: {
//       accessToken,
//       refreshToken,
//     },
//   };
// };

// // const verifyLoginPin = asyncHandler(async (userId,pin) => {
// //   // const { userId, pin } = req.body || {};

// //   const result = await authService.verifyLoginPin(userId, pin);

// //   res.cookie("accessToken", result.tokens.accessToken, {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "strict",
// //     maxAge: 15 * 60 * 1000,
// //   });

// //   res.cookie("refreshToken", result.tokens.refreshToken, {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "strict",
// //     maxAge: 7 * 24 * 60 * 60 * 1000,
// //   });

// //   res.status(200).json(
// //     new ApiResponse(200, "Login successful", {
// //       user: result.user,
// //     })
// //   );
// // });
// // const emailSignup = async (email) => {
// //   if (!email) {
// //     throw new ApiError(400, "Email is required");
// //   }

// //   const normalizedEmail = email.toLowerCase().trim();

// //   let user = await User.findOne({ email: normalizedEmail });

// //   if (user && user.status === USER_STATUS.ACTIVE) {
// //     throw new ApiError(409, "User already exists. Please login");
// //   }

// //   if (!user) {
// //     user = await User.create({
// //       email: normalizedEmail,
// //       authProvider: AUTH_PROVIDER.EMAIL,
// //       status: USER_STATUS.PHONE_REQUIRED,
// //     });
// //   }

// //   return {
// //     userId: user._id,
// //     email: user.email,
// //     name: user.name || null,
// //     status: user.status,
// //     nextStep: user.status,
// //   };
// // };

// const emailSignup = async (
//   email,
//   loginAccess = false,
//   cookies = {},
//   authHeader
// ) => {
//   if (!email) {
//     throw new ApiError(400, "Email is required");
//   }

//   const normalizedEmail = email.toLowerCase().trim();

//   let user = await User.findOne({ email: normalizedEmail });

//   // CASE 1: Existing active user
//   if (user && user.status === USER_STATUS.ACTIVE) {
//     return handleActiveUserSession(user, cookies, authHeader);
//   }

//   // CASE 2: Existing but signup not completed
//   if (user && user.status !== USER_STATUS.ACTIVE) {
//     return {
//       userId: user._id,
//       email: user.email,
//       status: user.status,
//       isExistingUser: true,
//       nextStep: user.status,
//       redirectTo: getRedirectPageByStatus(user.status),
//       message: "Signup not completed. Continue onboarding.",
//     };
//   }

//   // CASE 3: New user
//   user = await User.create({
//     email: normalizedEmail,
//     authProvider: AUTH_PROVIDER.EMAIL,
//     status: USER_STATUS.PHONE_REQUIRED,
//   });

//   return {
//     userId: user._id,
//     email: user.email,
//     status: user.status,
//     isExistingUser: false,
//     nextStep: USER_STATUS.PHONE_REQUIRED,
//     redirectTo: "PHONE_PAGE",
//     message: "New user. Continue signup.",
//   };
// };

// const getRedirectPageByStatus = (status) => {
//   const redirectMap = {
//     [USER_STATUS.PHONE_REQUIRED]: "PHONE_PAGE",
//     [USER_STATUS.PHONE_OTP_PENDING]: "PHONE_OTP_PAGE",
//     [USER_STATUS.PIN_REQUIRED]: "SET_PIN_PAGE",
//     [USER_STATUS.PIN_OTP_PENDING]: "PIN_OTP_PAGE",
//     [USER_STATUS.PASSWORD_REQUIRED]: "SET_PASSWORD_PAGE",
//     [USER_STATUS.ACTIVE]: "LOGIN_PAGE",
//   };

//   return redirectMap[status] || "LOGIN_PAGE";
// };
// const refreshAccessToken = async (refreshToken) => {
//   if (!refreshToken) {
//     throw new ApiError(401, "Refresh token is required");
//   }

//   let decoded;

//   try {
//     decoded = verifyRefreshToken(refreshToken);
//   } catch (error) {
//     throw new ApiError(401, "Invalid or expired refresh token");
//   }

//   const user = await User.findById(decoded.userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (decoded.email !== user.email) {
//     throw new ApiError(401, "Invalid refresh token");
//   }

//   if (user.status !== USER_STATUS.ACTIVE) {
//     throw new ApiError(403, "User account is not active");
//   }

//   const newAccessToken = generateAccessToken(user);

//   return {
//     accessToken: newAccessToken,
//   };
// };
// module.exports = {
//   googleSignup,
//   submitPhoneNumber,
//   verifyPhoneOtp,
//   setPin,
//   verifyPinOtp,
//   setPassword,
//   login,
//   verifyLoginPin,
//   emailSignup,
//   refreshAccessToken,
// };

const User = require("../models/user");
const ApiError = require("../utlis/ApiError");
const { verifyGoogleToken } = require("../services/google.service");
const { createAndSendOtp, verifyOtp } = require("../services/otp.service");
const { hashValue } = require("../utlis/hash");
const {
  USER_STATUS,
  AUTH_PROVIDER,
  OTP_PURPOSE,
} = require("./auth.constants");
const { compareHash } = require("../utlis/hash");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../services/jwt.service");

const buildActiveSessionResponse = (user, message, extra = {}) => {
  return {
    userId: user._id,
    email: user.email,
    name: user.name || null,
    status: user.status,
    isExistingUser: true,
    nextStep: "VERIFY_LOGIN_PIN",
    redirectTo: "VERIFY_PIN_PAGE",
    message,
    ...extra,
  };
};

const getValidAccessTokenPayload = (cookies = {}) => {
  const accessToken = cookies?.accessToken;

  if (!accessToken) {
    return null;
  }

  try {
    return verifyAccessToken(accessToken);
  } catch (error) {
    return null;
  }
};

const handleActiveUserSession = async (user, cookies = {}) => {
  const decodedAccessToken = getValidAccessTokenPayload(cookies);

  if (
    decodedAccessToken &&
    decodedAccessToken.userId === user._id.toString() &&
    decodedAccessToken.email === user.email
  ) {
    return buildActiveSessionResponse(user, "Session active. Verify PIN.");
  }

  const refreshToken = cookies?.refreshToken;

  if (refreshToken) {
    try {
      const decodedRefreshToken = verifyRefreshToken(refreshToken);

      if (
        decodedRefreshToken.userId === user._id.toString() &&
        decodedRefreshToken.email === user.email
      ) {
        const newAccessToken = generateAccessToken(user);

        return buildActiveSessionResponse(
          user,
          "Session refreshed. Verify PIN.",
          {
            accessToken: newAccessToken,
          }
        );
      }
    } catch (error) {}
  }

  return {
    userId: user._id,
    email: user.email,
    name: user.name || null,
    status: user.status,
    isExistingUser: true,
    nextStep: "LOGIN_REQUIRED",
    redirectTo: "LOGIN_PAGE",
    message: "User already exists. Please login.",
  };
};

const googleSignup = async (idToken, cookies = {}) => {
  if (!idToken) {
    throw new ApiError(400, "Google ID token is required");
  }

  const googleUser = await verifyGoogleToken(idToken);

  if (!googleUser.emailVerified) {
    throw new ApiError(400, "Google email is not verified");
  }

  const normalizedEmail = googleUser.email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
  googleId: googleUser.googleId,
  name: googleUser.name,
  email: normalizedEmail,
  profileImage: googleUser.profileImage || googleUser.picture || null,
  authProvider: AUTH_PROVIDER.GOOGLE,
  status: USER_STATUS.PHONE_REQUIRED,
});

    return {
      userId: user._id,
      email: user.email,
      name: user.name || null,
      status: user.status,
      isExistingUser: false,
      nextStep: USER_STATUS.PHONE_REQUIRED,
      redirectTo: "PHONE_PAGE",
      message: "New user. Continue signup.",
    };
  }

  if (!user.googleId) user.googleId = googleUser.googleId;
if (!user.name) user.name = googleUser.name;

if (!user.profileImage && (googleUser.profileImage || googleUser.picture)) {
  user.profileImage = googleUser.profileImage || googleUser.picture;
}

await user.save();

  if (user.status === USER_STATUS.ACTIVE) {
    return handleActiveUserSession(user, cookies);
  }

  return {
  userId: user._id,
  email: user.email,
  name: user.name || null,
  profileImage: user.profileImage || null,
  status: user.status,
  isExistingUser: false,
  nextStep: USER_STATUS.PHONE_REQUIRED,
  redirectTo: "PHONE_PAGE",
  message: "New user. Continue signup.",
};
};

const submitPhoneNumber = async (userId, phoneNumber) => {
  if (!userId || !phoneNumber) {
    throw new ApiError(400, "User ID and phone number are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.PHONE_REQUIRED) {
    throw new ApiError(400, "Phone number cannot be submitted at this stage");
  }

  user.phoneNumber = phoneNumber;
  user.status = USER_STATUS.PHONE_OTP_PENDING;
  await user.save();

  await createAndSendOtp({
    userId: user._id,
    email: user.email,
    purpose: OTP_PURPOSE.PHONE_VERIFICATION,
  });

  return {
    userId: user._id,
    status: user.status,
    nextStep: USER_STATUS.PHONE_OTP_PENDING,
  };
};

const verifyPhoneOtp = async (userId, otp) => {
  if (!userId || !otp) {
    throw new ApiError(400, "User ID and OTP are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.PHONE_OTP_PENDING) {
    throw new ApiError(400, "OTP verification not allowed at this stage");
  }

  await verifyOtp({
    userId: user._id,
    otp,
    purpose: OTP_PURPOSE.PHONE_VERIFICATION,
  });

  user.phoneVerified = true;
  user.status = USER_STATUS.PIN_REQUIRED;
  await user.save();

  return {
    userId: user._id,
    status: user.status,
    nextStep: USER_STATUS.PIN_REQUIRED,
  };
};

const setPin = async (userId, pin) => {
  if (!userId || !pin) {
    throw new ApiError(400, "User ID and PIN are required");
  }

  if (!/^\d{4}$/.test(pin)) {
    throw new ApiError(400, "PIN must be exactly 4 digits");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.PIN_REQUIRED) {
    throw new ApiError(400, "PIN cannot be set at this stage");
  }

  user.pinHash = await hashValue(pin);
  user.status = USER_STATUS.PIN_OTP_PENDING;
  await user.save();

  await createAndSendOtp({
    userId: user._id,
    email: user.email,
    purpose: OTP_PURPOSE.PIN_CONFIRMATION,
  });

  return {
    userId: user._id,
    status: user.status,
    nextStep: USER_STATUS.PIN_OTP_PENDING,
  };
};

const verifyPinOtp = async (userId, otp) => {
  if (!userId || !otp) {
    throw new ApiError(400, "User ID and OTP are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.PIN_OTP_PENDING) {
    throw new ApiError(400, "PIN OTP verification not allowed at this stage");
  }

  await verifyOtp({
    userId: user._id,
    otp,
    purpose: OTP_PURPOSE.PIN_CONFIRMATION,
  });

  user.status = USER_STATUS.PASSWORD_REQUIRED;
  await user.save();

  return {
    userId: user._id,
    status: user.status,
    nextStep: USER_STATUS.PASSWORD_REQUIRED,
  };
};

const setPassword = async (userId, password) => {
  if (!userId || !password) {
    throw new ApiError(400, "User ID and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.PASSWORD_REQUIRED) {
    throw new ApiError(400, "Password cannot be set at this stage");
  }

  user.passwordHash = await hashValue(password);
  user.status = USER_STATUS.ACTIVE;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    userId: user._id,
    email: user.email,
    status: user.status,
    nextStep: USER_STATUS.ACTIVE,
  };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      403,
      `Signup not completed. Current step: ${user.status}`
    );
  }

  const isPasswordValid = await compareHash(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    userId: user._id,
    email: user.email,
    nextStep: "PIN_REQUIRED",
  };
};

const verifyLoginPin = async (userId, pin) => {
  if (!userId || !pin) {
    throw new ApiError(400, "User ID and PIN are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, "User account is not active");
  }

  const isPinValid = await compareHash(pin, user.pinHash);

  if (!isPinValid) {
    throw new ApiError(401, "Invalid PIN");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.lastLoginAt = new Date();
  await user.save();

  return {
     user: {
  userId: user._id,
  email: user.email,
  name: user.name,
  profileImage: user.profileImage || null,
},
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const emailSignup = async (email, loginAccess = false, cookies = {}) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (user && user.status === USER_STATUS.ACTIVE) {
    return handleActiveUserSession(user, cookies);
  }

  if (user && user.status !== USER_STATUS.ACTIVE) {
    return {
      userId: user._id,
      email: user.email,
      status: user.status,
      isExistingUser: true,
      nextStep: user.status,
      redirectTo: getRedirectPageByStatus(user.status),
      message: "Signup not completed. Continue onboarding.",
    };
  }

  user = await User.create({
    email: normalizedEmail,
    authProvider: AUTH_PROVIDER.EMAIL,
    status: USER_STATUS.PHONE_REQUIRED,
  });

  return {
    userId: user._id,
    email: user.email,
    status: user.status,
    isExistingUser: false,
    nextStep: USER_STATUS.PHONE_REQUIRED,
    redirectTo: "PHONE_PAGE",
    message: "New user. Continue signup.",
  };
};

const getRedirectPageByStatus = (status) => {
  const redirectMap = {
    [USER_STATUS.PHONE_REQUIRED]: "PHONE_PAGE",
    [USER_STATUS.PHONE_OTP_PENDING]: "PHONE_OTP_PAGE",
    [USER_STATUS.PIN_REQUIRED]: "SET_PIN_PAGE",
    [USER_STATUS.PIN_OTP_PENDING]: "PIN_OTP_PAGE",
    [USER_STATUS.PASSWORD_REQUIRED]: "SET_PASSWORD_PAGE",
    [USER_STATUS.ACTIVE]: "LOGIN_PAGE",
  };

  return redirectMap[status] || "LOGIN_PAGE";
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (decoded.email !== user.email) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, "User account is not active");
  }

  const newAccessToken = generateAccessToken(user);

  return {
    accessToken: newAccessToken,
  };
};

module.exports = {
  googleSignup,
  submitPhoneNumber,
  verifyPhoneOtp,
  setPin,
  verifyPinOtp,
  setPassword,
  login,
  verifyLoginPin,
  emailSignup,
  refreshAccessToken,
};