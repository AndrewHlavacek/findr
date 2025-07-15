# Findr Backend API

A FastAPI-based backend for the Findr music recommendation app.

## Features

- Music recommendation engine using TensorFlow
- Spotify API integration
- PostgreSQL database with SQLAlchemy ORM
- User session management with UUID
- Swipe tracking and playlist management
- RESTful API endpoints

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Copy `env.example` to `.env` and fill in your values:
   ```bash
   cp env.example .env
   ```

3. **Configure your environment variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `RAILWAY_DATABASE_URL`: Railway PostgreSQL URL (for production)
   - `SPOTIFY_CLIENT_ID`: Your Spotify API client ID
   - `SPOTIFY_CLIENT_SECRET`: Your Spotify API client secret
   - `SECRET_KEY`: A random secret key for the application

4. **Run the application:**
   ```bash
   python run.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Songs
- `GET /songs/recommend` - Get next song recommendation
- `GET /songs/search?query={query}` - Search for songs
- `GET /songs/popular` - Get popular songs

### Swipes
- `POST /swipe` - Record a swipe (like/dislike)

### Playlist
- `GET /playlist` - Get user's playlist
- `POST /playlist/add` - Add song to playlist
- `DELETE /playlist/remove/{song_id}` - Remove song from playlist

## Authentication

The API uses a simple UUID-based user identification system:
- Users are identified by the `X-User-ID` header
- If no header is provided, a new UUID is generated
- User data is persisted in localStorage on the frontend

## Database Schema

- **users**: User information and UUID
- **songs**: Song metadata and audio features
- **swipes**: User swipe history
- **playlist_items**: User's liked songs

## Recommendation Engine

The app uses a TensorFlow neural network for content-based filtering:
- Trains on user's swipe history
- Uses Spotify audio features (danceability, energy, etc.)
- Provides confidence scores for recommendations
- Avoids showing previously swiped songs 