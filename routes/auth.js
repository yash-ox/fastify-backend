import authController from "../controllers/authController.js";

export default async function (fastify, opt) {
  fastify.post("/register", authController.register);
  fastify.post("/login", authController.login);
  fastify.post("/forgot-password", authController.forgotPassword);
  fastify.post("/reset-password/:resetToken", authController.resetPassword);
}
