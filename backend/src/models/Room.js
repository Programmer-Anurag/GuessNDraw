const roomSchema = new mongoose.Schema({
  roomId: String,
  players: [playerSchema],
  host: String,
  isGameStarted: { type: Boolean, default: false },
  settings: {
    maxPlayers: Number,
    rounds: Number,
    drawTime: Number
  },
  gameState: {
    round: Number,
    drawerIndex: Number,
    currentWord: String
  }
});