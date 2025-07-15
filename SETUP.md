# Findr Music Recommendation App - Setup Guide

This guide will help you get the Findr music recommendation app up and running with both the frontend and backend components.

## 🎯 What is Findr?

Findr is a Tinder-style music recommendation app where users:
- Swipe right to like songs, left to skip
- Build a personalized playlist based on their preferences
- Get AI-powered recommendations that improve over time
- Listen to song previews and discover new music

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **ML**: TensorFlow for recommendation engine
- **External APIs**: Spotify for music data
- **Deployment**: Vercel (frontend) + Railway (backend + database)

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **PostgreSQL** database (Railway recommended)
4. **Spotify Developer Account**
5. **Vercel Account** (for frontend deployment)
6. **Railway Account** (for backend deployment)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
```

**Configure your `.env` file:**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/findr_db

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# App Configuration
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development

# Railway PostgreSQL (for production)
RAILWAY_DATABASE_URL=postgresql://username:password@railway_host:5432/railway_db
```

**Start the backend server:**
```bash
python run.py
```

The API will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration Details

### Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your `CLIENT_ID` and `CLIENT_SECRET`
4. Add `http://localhost:3000/callback` to your redirect URIs

### Database Setup

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database
createdb findr_db
```

**Option 2: Railway PostgreSQL (Recommended)**
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection URL to your `.env` file

### Environment Variables Explained

- `DATABASE_URL`: Local PostgreSQL connection string
- `RAILWAY_DATABASE_URL`: Railway PostgreSQL connection string (for production)
- `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret
- `SECRET_KEY`: Random string for app security
- `VITE_API_URL`: Backend API URL for frontend

## 🧪 Testing the Application

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && python run.py
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open your browser** to `http://localhost:5173`

3. **Test the features:**
   - Swipe right/left on songs
   - Check your playlist
   - Play song previews
   - See recommendations improve over time

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend-url.railway.app`
4. Deploy

### Backend (Railway)

1. Push your code to GitHub
2. Connect your repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy

## 📁 Project Structure

```
findr/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   ├── database.py      # Database configuration
│   │   ├── spotify_service.py    # Spotify API integration
│   │   └── recommendation_engine.py  # ML recommendation engine
│   ├── requirements.txt
│   ├── run.py
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx     # Main swiping interface
│   │   │   ├── SongCard.jsx # Song display component
│   │   │   └── Playlist.jsx # Playlist management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔍 API Endpoints

- `GET /songs/recommend` - Get next song recommendation
- `POST /swipe` - Record a swipe (like/dislike)
- `GET /playlist` - Get user's playlist
- `POST /playlist/add` - Add song to playlist
- `DELETE /playlist/remove/{song_id}` - Remove song from playlist
- `GET /songs/search?query={query}` - Search for songs
- `GET /songs/popular` - Get popular songs

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Spotify API Errors**
   - Verify your Spotify credentials
   - Check redirect URI configuration
   - Ensure app is properly registered

3. **Frontend Can't Connect to Backend**
   - Check `VITE_API_URL` in frontend `.env`
   - Ensure backend is running on correct port
   - Check CORS configuration

4. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python/Node.js versions
   - Restart your development servers

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check that both servers are running

## 🎉 Next Steps

Once your app is running:

1. **Customize the UI** - Modify colors, fonts, and layout
2. **Add Features** - Implement user authentication, social sharing
3. **Improve ML** - Enhance the recommendation algorithm
4. **Deploy** - Get your app live on the internet
5. **Monitor** - Add analytics and error tracking

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

Happy coding! 🎵 