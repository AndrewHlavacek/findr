# 🎵 Findr

A modern, AI-powered music recommendation app with a Tinder-style swiping interface. Discover new tracks, get personalized recommendations, and connect your Spotify account for a seamless experience.

---

## 🚀 Features

- **Tinder-style Swiping:** Like or skip songs with a beautiful, animated interface.
- **Spotify Integration:** Log in with your Spotify account to get real music data and recommendations.
- **AI Recommendations:** Uses a TensorFlow-based engine to suggest songs tailored to your taste.
- **Search & Popular Songs:** Browse trending tracks or search for any song in Spotify’s vast library.
- **Responsive UI:** Built with React, Vite, TailwindCSS, and Framer Motion for smooth, modern interactions.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Framer Motion
- **Backend:** FastAPI, PostgreSQL (Railway), TensorFlow, Spotify API
- **Deployment:** Vercel (frontend), Railway (backend)

---

## 📸 Preview

<p align="center">
  <img src="https://user-images.githubusercontent.com/your-github-username/findr-demo.gif" alt="Findr Demo" width="600"/>
</p>

---

## ⚡ Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/AndrewHlavacek/findr.git
cd findr
```

### 2. Backend Setup
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in your Spotify and DB credentials
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env  # Set VITE_API_URL to your backend
npm run dev
```

---

## 🌐 Live Demo

- [Frontend on Vercel](https://findr-frontend.vercel.app)
- [Backend on Railway](https://findr-backend.up.railway.app)

---

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- Built by [Andrew Hlavacek](https://github.com/AndrewHlavacek)
- Powered by Spotify, TensorFlow, FastAPI, and the open source community. 