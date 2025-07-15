from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Song schemas
class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    preview_url: Optional[str] = None
    image_url: Optional[str] = None
    spotify_id: Optional[str] = None

class SongCreate(SongBase):
    pass

class Song(SongBase):
    id: str
    danceability: Optional[float] = None
    energy: Optional[float] = None
    key: Optional[int] = None
    loudness: Optional[float] = None
    mode: Optional[int] = None
    speechiness: Optional[float] = None
    acousticness: Optional[float] = None
    instrumentalness: Optional[float] = None
    liveness: Optional[float] = None
    valence: Optional[float] = None
    tempo: Optional[float] = None

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    id: str

class User(UserBase):
    created_at: datetime

    class Config:
        from_attributes = True

# Swipe schemas
class SwipeBase(BaseModel):
    song_id: str
    swipe_type: str  # 'like' or 'dislike'

class SwipeCreate(SwipeBase):
    pass

class Swipe(SwipeBase):
    id: int
    user_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Playlist schemas
class PlaylistItemBase(BaseModel):
    song_id: str

class PlaylistItemCreate(PlaylistItemBase):
    pass

class PlaylistItem(PlaylistItemBase):
    id: int
    user_id: str
    timestamp: datetime
    song: Song

    class Config:
        from_attributes = True

# Recommendation schemas
class RecommendationResponse(BaseModel):
    song: Song
    confidence: Optional[float] = None 