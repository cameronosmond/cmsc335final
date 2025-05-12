const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
   location: {
      type: String,
      unique: true,
      required: true
   }
});

// collection name will be turned into 'favorites'
const Weather = mongoose.model("Favorite", weatherSchema);
module.exports = Weather;