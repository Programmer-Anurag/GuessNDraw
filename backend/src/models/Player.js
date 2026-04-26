const playerSchema = new mongoose.Schema({

  name: String,

  socketId: String,

  score: { type: Number, default: 0 }

});