import Redis from "ioredis";

const connectionString = process.env.VALKEY_URL;
const redisClient = new Redis(connectionString);

export default redisClient;
