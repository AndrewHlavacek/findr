from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import models, schemas
from typing import List, Optional
import uuid

# User operations
def create_user(db: Session) -> models.User:
    """Create a new user with a UUID"""
    user = models.User(id=str(uuid.uuid4()))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db: Session, user_id: str) -> Optional[models.User]:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_or_create_user(db: Session, user_id: str) -> models.User:
    """Get existing user or create new one"""
    user = get_user(db, user_id)
    if not user:
        user = models.User(id=user_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# Song operations
def create_song(db: Session, song_data: dict) -> models.Song:
    """Create a new song"""
    song = models.Song(**song_data)
    db.add(song)
    db.commit()
    db.refresh(song)
    return song

def get_song(db: Session, song_id: str) -> Optional[models.Song]:
    """Get song by ID"""
    return db.query(models.Song).filter(models.Song.id == song_id).first()

def get_song_by_spotify_id(db: Session, spotify_id: str) -> Optional[models.Song]:
    """Get song by Spotify ID"""
    return db.query(models.Song).filter(models.Song.spotify_id == spotify_id).first()

def get_all_songs(db: Session, skip: int = 0, limit: int = 100) -> List[models.Song]:
    """Get all songs with pagination"""
    return db.query(models.Song).offset(skip).limit(limit).all()

def create_or_get_song(db: Session, song_data: dict) -> models.Song:
    """Create song if it doesn't exist, otherwise return existing"""
    if 'spotify_id' in song_data and song_data['spotify_id']:
        existing_song = get_song_by_spotify_id(db, song_data['spotify_id'])
        if existing_song:
            return existing_song
    
    return create_song(db, song_data)

# Swipe operations
def create_swipe(db: Session, user_id: str, song_id: str, swipe_type: str) -> models.Swipe:
    """Create a new swipe record"""
    swipe = models.Swipe(
        user_id=user_id,
        song_id=song_id,
        swipe_type=swipe_type
    )
    db.add(swipe)
    db.commit()
    db.refresh(swipe)
    return swipe

def get_user_swipes(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Swipe]:
    """Get all swipes for a user"""
    return db.query(models.Swipe).filter(
        models.Swipe.user_id == user_id
    ).offset(skip).limit(limit).all()

def has_user_swiped_song(db: Session, user_id: str, song_id: str) -> bool:
    """Check if user has already swiped on a song"""
    swipe = db.query(models.Swipe).filter(
        and_(
            models.Swipe.user_id == user_id,
            models.Swipe.song_id == song_id
        )
    ).first()
    return swipe is not None

# Playlist operations
def add_to_playlist(db: Session, user_id: str, song_id: str) -> models.PlaylistItem:
    """Add a song to user's playlist"""
    # Check if already in playlist
    existing = db.query(models.PlaylistItem).filter(
        and_(
            models.PlaylistItem.user_id == user_id,
            models.PlaylistItem.song_id == song_id
        )
    ).first()
    
    if existing:
        return existing
    
    playlist_item = models.PlaylistItem(
        user_id=user_id,
        song_id=song_id
    )
    db.add(playlist_item)
    db.commit()
    db.refresh(playlist_item)
    return playlist_item

def remove_from_playlist(db: Session, user_id: str, song_id: str) -> bool:
    """Remove a song from user's playlist"""
    playlist_item = db.query(models.PlaylistItem).filter(
        and_(
            models.PlaylistItem.user_id == user_id,
            models.PlaylistItem.song_id == song_id
        )
    ).first()
    
    if playlist_item:
        db.delete(playlist_item)
        db.commit()
        return True
    return False

def get_user_playlist(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.PlaylistItem]:
    """Get user's playlist with song details"""
    return db.query(models.PlaylistItem).filter(
        models.PlaylistItem.user_id == user_id
    ).offset(skip).limit(limit).all()

def is_song_in_playlist(db: Session, user_id: str, song_id: str) -> bool:
    """Check if a song is in user's playlist"""
    playlist_item = db.query(models.PlaylistItem).filter(
        and_(
            models.PlaylistItem.user_id == user_id,
            models.PlaylistItem.song_id == song_id
        )
    ).first()
    return playlist_item is not None 