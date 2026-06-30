import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";

export default fastifyPlugin(async (fastify, opts) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    fastify.decorate("mongoose", mongoose);
    fastify.log.info("MongoDB connected !!");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
