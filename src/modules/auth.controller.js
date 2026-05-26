// const asyncHandler = require("../middlewares/asynchandler");
// const ApiResponse = require("../utlis/ApiResponse");
// const authService = require("./auth.service");

// const parseDurationToMs = (value, fallback) => {
//   if (!value || typeof value !== "string") {
//     return fallback;
//   }

//   const trimmedValue = value.trim();
//   const exactMs = Number(trimmedValue);

//   if (Number.isFinite(exactMs) && exactMs > 0) {
//     return exactMs;
//   }

//   const durationMatch = trimmedValue.match(/^(\d+)(ms|s|m|h|d)$/i);

//   if (!durationMatch) {
//     return fallback;
//   }

//   const amount = Number(durationMatch[1]);
//   const unit = durationMatch[2].toLowerCase();
//   const multipliers = {
//     ms: 1,
//     s: 1000,
//     m: 60 * 1000,
//     h: 60 * 60 * 1000,
//     d: 24 * 60 * 60 * 1000,
//   };

//   return amount * multipliers[unit];
// };

// const buildAuthCookieOptions = (maxAge) => ({
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict",
//   maxAge,
// });

// const setAuthCookies = (res, tokens = {}) => {
//   if (tokens.accessToken) {
//     res.cookie(
//       "accessToken",
//       tokens.accessToken,
//       buildAuthCookieOptions(
//         parseDurationToMs(process.env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000)
//       )
//     );
//   }

//   if (tokens.refreshToken) {
//     res.cookie(
//       "refreshToken",
//       tokens.refreshToken,
//       buildAuthCookieOptions(
//         parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000)
//       )
//     );
//   }
// };

// const googleSignup = asyncHandler(async (req, res) => {
//   const { idToken } = req.body;

//   const result = await authService.googleSignup(
//     idToken,
//     req.cookies,  );

//   setAuthCookies(res, {
//     accessToken: result.accessToken,
//   });

//   res.status(200).json(new ApiResponse(200, result.message, result));
// });
// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const refreshToken =
//     req.cookies?.refreshToken || req.body?.refreshToken;

//   const result = await authService.refreshAccessToken(refreshToken);

//   setAuthCookies(res, {
//     accessToken: result.accessToken,
//   });

//   res.status(200).json(
//     new ApiResponse(200, "Access token refreshed successfully", result)
//   );
// });
// const submitPhoneNumber = asyncHandler(async (req, res) => {
//   const { userId, phoneNumber } = req.body;

//   const result = await authService.submitPhoneNumber(userId, phoneNumber);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "OTP sent to registered email", result));
// });

// const verifyPhoneOtp = asyncHandler(async (req, res) => {
//   const { userId, otp } = req.body;

//   const result = await authService.verifyPhoneOtp(userId, otp);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "Phone verified successfully", result));
// });

// const setPin = asyncHandler(async (req, res) => {
//   const { userId, pin } = req.body;

//   const result = await authService.setPin(userId, pin);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "PIN saved. OTP sent for confirmation", result));
// });

// const verifyPinOtp = asyncHandler(async (req, res) => {
//   const { userId, otp } = req.body;

//   const result = await authService.verifyPinOtp(userId, otp);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "PIN confirmed successfully", result));
// });

// const setPassword = asyncHandler(async (req, res) => {
//   const { userId, password } = req.body;

//   const result = await authService.setPassword(userId, password);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "Password set successfully", result));
// });

// const emailSignup = asyncHandler(async (req, res) => {
//   const { email, loginAccess } = req.body;

//   const result = await authService.emailSignup(
//     email,
//     loginAccess,
//     req.cookies,
//     req.headers.authorization
//   );

//   setAuthCookies(res, {
//     accessToken: result.accessToken,
//   });

//   res
//     .status(200)
//     .json(new ApiResponse(200, result.message, result));
// });

// const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const result = await authService.login(email, password);

//   res
//     .status(200)
//     .json(new ApiResponse(200, "Password verified. PIN required", result));
// });

// const verifyLoginPin = asyncHandler(async (req, res) => {
//   const { userId, pin } = req.body || {};

//   const result = await authService.verifyLoginPin(userId, pin);

//   setAuthCookies(res, result.tokens);

//   res.status(200).json(
//     new ApiResponse(200, "Login successful", {
//       user: result.user,
//       tokens: {
//         accessToken: result.tokens.accessToken,
//         refreshToken: result.tokens.refreshToken,
//       },
//     })
//   );
// });

// module.exports = {
//   googleSignup,
//   emailSignup,
//   submitPhoneNumber,
//   verifyPhoneOtp,
//   setPin,
//   verifyPinOtp,
//   setPassword,
//   login,
//   verifyLoginPin,
//   refreshAccessToken
// };

const asyncHandler = require("../middlewares/asynchandler");
const ApiResponse = require("../utlis/ApiResponse");
const authService = require("./auth.service");

const parseDurationToMs = (value, fallback) => {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  const exactMs = Number(trimmedValue);

  if (Number.isFinite(exactMs) && exactMs > 0) {
    return exactMs;
  }

  const durationMatch = trimmedValue.match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!durationMatch) {
    return fallback;
  }

  const amount = Number(durationMatch[1]);
  const unit = durationMatch[2].toLowerCase();

  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const buildAuthCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge,
});

const setAuthCookies = (res, tokens = {}) => {
  if (tokens.accessToken) {
    res.cookie(
      "accessToken",
      tokens.accessToken,
      buildAuthCookieOptions(
        parseDurationToMs(process.env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000)
      )
    );
  }

  if (tokens.refreshToken) {
    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      buildAuthCookieOptions(
        parseDurationToMs(
          process.env.JWT_REFRESH_EXPIRES_IN,
          7 * 24 * 60 * 60 * 1000
        )
      )
    );
  }
};

const googleSignup = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  const result = await authService.googleSignup(idToken, req.cookies);

  setAuthCookies(res, {
    accessToken: result.accessToken,
  });

  res.status(200).json(new ApiResponse(200, result.message, result));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const result = await authService.refreshAccessToken(refreshToken);

  setAuthCookies(res, {
    accessToken: result.accessToken,
  });

  res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      accessTokenRefreshed: true,
    })
  );
});

const submitPhoneNumber = asyncHandler(async (req, res) => {
  const { userId, phoneNumber } = req.body;

  const result = await authService.submitPhoneNumber(userId, phoneNumber);

  res
    .status(200)
    .json(new ApiResponse(200, "OTP sent to registered email", result));
});

const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const result = await authService.verifyPhoneOtp(userId, otp);

  res
    .status(200)
    .json(new ApiResponse(200, "Phone verified successfully", result));
});

const setPin = asyncHandler(async (req, res) => {
  const { userId, pin } = req.body;

  const result = await authService.setPin(userId, pin);

  res
    .status(200)
    .json(new ApiResponse(200, "PIN saved. OTP sent for confirmation", result));
});

const verifyPinOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const result = await authService.verifyPinOtp(userId, otp);

  res
    .status(200)
    .json(new ApiResponse(200, "PIN confirmed successfully", result));
});

const setPassword = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  const result = await authService.setPassword(userId, password);

  res
    .status(200)
    .json(new ApiResponse(200, "Password set successfully", result));
});

const emailSignup = asyncHandler(async (req, res) => {
  const { email, loginAccess } = req.body;

  const result = await authService.emailSignup(
    email,
    loginAccess,
    req.cookies
  );

  setAuthCookies(res, {
    accessToken: result.accessToken,
  });

  res.status(200).json(new ApiResponse(200, result.message, result));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res
    .status(200)
    .json(new ApiResponse(200, "Password verified. PIN required", result));
});

const verifyLoginPin = asyncHandler(async (req, res) => {
  const { userId, pin } = req.body || {};

  const result = await authService.verifyLoginPin(userId, pin);

  setAuthCookies(res, result.tokens);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: result.user,
    })
  );
});

module.exports = {
  googleSignup,
  emailSignup,
  submitPhoneNumber,
  verifyPhoneOtp,
  setPin,
  verifyPinOtp,
  setPassword,
  login,
  verifyLoginPin,
  refreshAccessToken,
};