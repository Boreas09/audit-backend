import mongoose from "mongoose";

class MongoDB {
  constructor() {
    this.connection = null;
    this.config = null;
    this.connectionString = null;
  }

  async initialize() {
    if (this.config) return; // Already initialized

    this.connectionString = process.env.MONGO_URL;

    if (!this.connectionString) {
      throw new Error(
        "MongoDB connection string not found. Please set MONGO_URL environment variable"
      );
    }

    this.config = {
      initialized: true,
      url: this.connectionString
    };
  }

  async connect() {
    try {
      // Initialize config if not already done
      await this.initialize();

      if (this.connection && (await this.isConnected())) {
        console.log("MongoDB already connected");
        return this.connection;
      }

      console.log("Connecting to MongoDB...");

      // Connection options
      const connectionOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        autoIndex: true,
      };

      this.connection = await mongoose.connect(this.connectionString, connectionOptions);

      console.log("Successfully connected to MongoDB");

      return this.connection;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.connection = null;
        console.log("Disconnected from MongoDB");
      }
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  // Get main mongoose connection
  getConnection() {
    if (!this.connection) {
      throw new Error("MongoDB not connected. Call connect() first.");
    }
    return this.connection;
  }

  // Get users collection via mongoose connection
  getUsersCollection() {
    if (!this.connection) {
      throw new Error("MongoDB not connected. Call connect() first.");
    }
    return mongoose.connection.db.collection('users');
  }

  // Get comments collection via mongoose connection
  getCommentsCollection() {
    if (!this.connection) {
      throw new Error("MongoDB not connected. Call connect() first.");
    }
    return mongoose.connection.db.collection('comments');
  }

  async isConnected() {
    try {
      if (!mongoose.connection || mongoose.connection.readyState !== 1) {
        return false;
      }
      // Test the connection
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const mongodb = new MongoDB();

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Gracefully shutting down MongoDB connection...");
  await mongodb.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Gracefully shutting down MongoDB connection...");
  await mongodb.disconnect();
  process.exit(0);
});

// Backward compatibility function
export async function dbConnect() {
  return await mongodb.connect();
}

export default mongodb;
