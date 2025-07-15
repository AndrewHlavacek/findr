from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from . import crud, models, schemas
from .database import engine, get_db
from .spotify_service import SpotifyService
from .recommendation_engine import MusicRecommendationEngine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Findr Music Recommendation API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
spotify_service = SpotifyService()
recommendation_engine = MusicRecommendationEngine()

def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """Get or create user ID from header"""
    if not x_user_id:
        x_user_id = str(uuid.uuid4())
    return x_user_id

@app.get("/")
def read_root():
    return {"message": "Welcome to Findr Music Recommendation API"}

@app.get("/songs/recommend", response_model=schemas.RecommendationResponse)
def get_recommendation(
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Get the next song recommendation for a user"""
    # Get or create user
    user = crud.get_or_create_user(db, user_id)
    
    # Get user's swipe history
    user_swipes = crud.get_user_swipes(db, user_id)
    
    # Get all available songs
    all_songs = crud.get_all_songs(db)
    
    if not all_songs:
        # If no songs in database, fetch from Spotify
        songs_data = spotify_service.get_popular_songs(50)
        for song_data in songs_data:
            crud.create_or_get_song(db, song_data)
        all_songs = crud.get_all_songs(db)
    
    # Convert to dict format for recommendation engine
    songs_dict = []
    for song in all_songs:
        song_dict = {
            'id': song.id,
            'title': song.title,
            'artist': song.artist,
            'album': song.album,
            'preview_url': song.preview_url,
            'image_url': song.image_url,
            'spotify_id': song.spotify_id,
            'danceability': song.danceability,
            'energy': song.energy,
            'key': song.key,
            'loudness': song.loudness,
            'mode': song.mode,
            'speechiness': song.speechiness,
            'acousticness': song.acousticness,
            'instrumentalness': song.instrumentalness,
            'liveness': song.liveness,
            'valence': song.valence,
            'tempo': song.tempo
        }
        songs_dict.append(song_dict)
    
    # Convert swipes to dict format
    swipes_dict = []
    for swipe in user_swipes:
        swipes_dict.append({
            'song_id': swipe.song_id,
            'swipe_type': swipe.swipe_type
        })
    
    # Train recommendation engine if user has swipes
    if swipes_dict:
        recommendation_engine.train_on_user_data(swipes_dict, songs_dict)
    
    # Get recommendations
    recommendations = recommendation_engine.get_recommendations(songs_dict, swipes_dict, 1)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail="No songs available")
    
    recommended_song = recommendations[0]
    
    # Check if user has already swiped on this song
    if crud.has_user_swiped_song(db, user_id, recommended_song['id']):
        # Get next recommendation
        recommendations = recommendation_engine.get_recommendations(songs_dict, swipes_dict, 10)
        for song in recommendations:
            if not crud.has_user_swiped_song(db, user_id, song['id']):
                recommended_song = song
                break
        else:
            raise HTTPException(status_code=404, detail="No more songs available")
    
    # Get confidence score
    confidence = recommendation_engine.predict_score(recommended_song)
    
    return schemas.RecommendationResponse(
        song=schemas.Song(
            id=recommended_song['id'],
            title=recommended_song['title'],
            artist=recommended_song['artist'],
            album=recommended_song['album'],
            preview_url=recommended_song['preview_url'],
            image_url=recommended_song['image_url'],
            spotify_id=recommended_song['spotify_id'],
            danceability=recommended_song.get('danceability'),
            energy=recommended_song.get('energy'),
            key=recommended_song.get('key'),
            loudness=recommended_song.get('loudness'),
            mode=recommended_song.get('mode'),
            speechiness=recommended_song.get('speechiness'),
            acousticness=recommended_song.get('acousticness'),
            instrumentalness=recommended_song.get('instrumentalness'),
            liveness=recommended_song.get('liveness'),
            valence=recommended_song.get('valence'),
            tempo=recommended_song.get('tempo')
        ),
        confidence=confidence
    )

@app.post("/swipe", response_model=schemas.Swipe)
def create_swipe(
    swipe_data: schemas.SwipeCreate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Record a user's swipe on a song"""
    # Get or create user
    user = crud.get_or_create_user(db, user_id)
    
    # Check if song exists
    song = crud.get_song(db, swipe_data.song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Check if user has already swiped on this song
    if crud.has_user_swiped_song(db, user_id, swipe_data.song_id):
        raise HTTPException(status_code=400, detail="User has already swiped on this song")
    
    # Create swipe record
    swipe = crud.create_swipe(db, user_id, swipe_data.song_id, swipe_data.swipe_type)
    
    # If it's a like, add to playlist
    if swipe_data.swipe_type == 'like':
        crud.add_to_playlist(db, user_id, swipe_data.song_id)
    
    return swipe

@app.get("/playlist", response_model=List[schemas.PlaylistItem])
def get_playlist(
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Get user's playlist"""
    # Get or create user
    user = crud.get_or_create_user(db, user_id)
    
    playlist_items = crud.get_user_playlist(db, user_id)
    return playlist_items

@app.post("/playlist/add", response_model=schemas.PlaylistItem)
def add_to_playlist(
    playlist_data: schemas.PlaylistItemCreate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Add a song to user's playlist"""
    # Get or create user
    user = crud.get_or_create_user(db, user_id)
    
    # Check if song exists
    song = crud.get_song(db, playlist_data.song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Add to playlist
    playlist_item = crud.add_to_playlist(db, user_id, playlist_data.song_id)
    return playlist_item

@app.delete("/playlist/remove/{song_id}")
def remove_from_playlist(
    song_id: str,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Remove a song from user's playlist"""
    # Get or create user
    user = crud.get_or_create_user(db, user_id)
    
    # Remove from playlist
    success = crud.remove_from_playlist(db, user_id, song_id)
    if not success:
        raise HTTPException(status_code=404, detail="Song not found in playlist")
    
    return {"message": "Song removed from playlist"}

@app.get("/songs/search")
def search_songs(
    query: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search for songs using Spotify API"""
    songs_data = spotify_service.search_songs(query, limit)
    
    # Save songs to database
    saved_songs = []
    for song_data in songs_data:
        song = crud.create_or_get_song(db, song_data)
        saved_songs.append(schemas.Song.from_orm(song))
    
    return saved_songs

@app.get("/songs/popular")
def get_popular_songs(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get popular songs from Spotify"""
    songs_data = spotify_service.get_popular_songs(limit)
    
    # Save songs to database
    saved_songs = []
    for song_data in songs_data:
        song = crud.create_or_get_song(db, song_data)
        saved_songs.append(schemas.Song.from_orm(song))
    
    return saved_songs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 