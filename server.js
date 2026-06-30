import { configDotenv } from "dotenv";
import fastifySensible from "@fastify/sensible";
import Fastify from "fastify";

configDotenv({ path: ".env" });

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifySensible);

fastify.register(import("./plugins/mongodb.js"));

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.get("/test-db", async (request, reply) => {
  try {
    const mongoose = fastify.mongoose;
    const connectionStatus = mongoose.connection.readyState;
    let status = "";

    switch (connectionStatus) {
      case 0:
        status = "disconnected";
        break;
      case 1:
        status = "connected";
        break;
      case 2:
        status = "connecting";
        break;
      case 3:
        status = "disconnecting";
        break;

      default:
        status = "unknown";
        break;
    }

    reply.send({ database: status });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to test database" });
    process.exit(1);
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT });
    fastify.log.info(
      `Server is running on port http://localhost:${process.env.PORT}`,
    );
  } catch (err) {
    fastify.log.error(err);
    throw fastify.httpErrors.notFound("The requested item could not be found");
    process.exit(1);
  }
};
start();
