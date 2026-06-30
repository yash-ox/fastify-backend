import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const register = async (request, reply) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return reply.send("All field are required.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    reply.code(201).send({ message: "User created successfully." });
  } catch (err) {
    reply.send(err);
  }
};

const login = async (request, reply) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.send("All fields are required.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return reply.send("User not found.");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return reply.send("Wrong password");
    }

    const token = request.server.jwt.sign({ id: user._id });
    reply.send({ token });
  } catch (err) {
    reply.send(err);
  }
};

const forgotPassword = async (request, reply) => {
  try {
    const { email } = request.body;

    const user = await User.findOne({ email });

    if (!user) {
      return reply.notFound("User not found.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpire;

    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`;
    reply.send({ resetURL });
  } catch (err) {
    reply.send(err);
  }
};

const resetPassword = async (request, reply) => {
  const { resetToken } = request.params;
  const { newPassword } = request.body;

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return reply.badRequest("Invalid or expired reset password token.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  return reply.send({ message: "Password reset successfull." });
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
};
