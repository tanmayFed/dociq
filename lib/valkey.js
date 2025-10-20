import Redis from "ioredis";

const connectionString = process.env.REDIS_URL;
const redisClient = new Redis(connectionString);

export default redisClient;
