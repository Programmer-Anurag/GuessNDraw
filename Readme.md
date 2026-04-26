# 🎨 Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and guessing game (like Skribbl) built using React, Node.js, Express, and Socket.IO.

---

## 🚀 Features

- 🎮 Real-time multiplayer gameplay  
- ✏️ Live drawing canvas  
- 💬 In-game chat & guessing system  
- 🔄 Turn-based rounds  
- ⏱ Timer-based drawing  
- 🏆 Score tracking system  
- 🔁 Auto round progression  
- ❌ Player disconnect handling  

---

## 🛠 Tech Stack

Frontend
- React.js
- Tailwind CSS
- Socket.IO Client

Backend
- Node.js
- Express.js
- Socket.IO

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository

bash git clone https://github.com/your-username/your-repo-name.git cd your-repo-name 

---

### 2️⃣ Install dependencies

#### Backend
bash cd server npm install 

set environment varibale
MONGO_URL
PORT=3000
CLIENT_URL

#### Frontend
bash cd client npm install 
set environment varibale
VITE_API_URL


---

### 3️⃣ Run the project

#### Start backend
bash cd server npm run start 

#### Start frontend
bash cd client npm run dev

---

## 🌐 Live Demo

👉 Play the Game.
  https://guess-n-draw-ten.vercel.app/

---

## 🎯 Game Flow

1. Players join a room  
2. Host starts the game  
3. Each player gets a turn to draw  
4. Others guess the word via chat  
5. Correct guess → score +1  
6. After all players → next round  
7. After max rounds → game over  

---

## ⚡ Future Improvements

- 🏅 Leaderboard UI enhancements  
- 🎯 Difficulty levels  
- 🔊 Sound effects  
- 📱 Mobile responsiveness  
- 🔐 Authentication system  

---

## 👨‍💻 Author

- Anurag Yadav

---

## ⭐ Contribute

Feel free to fork this repo and improve