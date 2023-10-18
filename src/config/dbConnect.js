const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`Connect to mongo DB ${connect.connection.host} `);
  } catch (error) {
    console.log(`Erreur:${error.message}`);

    process.exit(1);
  }
};

module.exports = { dbConnect };
