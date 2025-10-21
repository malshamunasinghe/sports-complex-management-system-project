const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  method: { type: String, required: true },
  sport: { type: String, required: true },
  sportTime: { type: String, required: true },
  amount: { type: String, required: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
