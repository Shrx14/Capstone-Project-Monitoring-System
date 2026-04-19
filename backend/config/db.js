const dns = require("dns");
const mongoose = require("mongoose");

const isLoopbackDnsOnly = (servers) => {
  if (!servers.length) {
    return false;
  }

  return servers.every((server) => server === "127.0.0.1" || server === "::1");
};

const configureMongoSrvDns = () => {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri.startsWith("mongodb+srv://")) {
    return;
  }

  const configuredServers = (process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  const currentServers = dns.getServers();
  const shouldOverride =
    configuredServers.length > 0 || isLoopbackDnsOnly(currentServers);

  if (!shouldOverride) {
    return;
  }

  const fallbackServers = ["8.8.8.8", "1.1.1.1"];
  const serversToUse =
    configuredServers.length > 0 ? configuredServers : fallbackServers;

  try {
    dns.setServers(serversToUse);
    console.log(`Using DNS servers for MongoDB SRV lookup: ${serversToUse.join(", ")}`);
  } catch (error) {
    console.warn("Could not set custom DNS servers for MongoDB SRV lookup.");
  }
};

const connectDB = async () => {
  try {
    configureMongoSrvDns();
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;