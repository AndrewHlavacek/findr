import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from typing import List, Dict, Optional
import random

class SpotifyService:
    def __init__(self):
        client_id = os.getenv("SPOTIFY_CLIENT_ID")
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        
        if client_id and client_secret:
            self.sp = spotipy.Spotify(
                client_credentials_manager=SpotifyClientCredentials(
                    client_id=client_id,
                    client_secret=client_secret
                )
            )
        else:
            self.sp = None
    
    def search_songs(self, query: str, limit: int = 20) -> List[Dict]:
        """Search for songs on Spotify"""
        if not self.sp:
            return self._get_mock_songs(limit)
        
        try:
            results = self.sp.search(q=query, type='track', limit=limit)
            songs = []
            
            for track in results['tracks']['items']:
                song = {
                    'id': track['id'],
                    'title': track['name'],
                    'artist': track['artists'][0]['name'] if track['artists'] else 'Unknown Artist',
                    'album': track['album']['name'],
                    'preview_url': track['preview_url'],
                    'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                    'spotify_id': track['id']
                }
                songs.append(song)
            
            return songs
        except Exception as e:
            print(f"Spotify search error: {e}")
            return self._get_mock_songs(limit)
    
    def get_audio_features(self, track_ids: List[str]) -> List[Dict]:
        """Get audio features for multiple tracks"""
        if not self.sp or not track_ids:
            return []
        
        try:
            features = self.sp.audio_features(track_ids)
            return features
        except Exception as e:
            print(f"Error getting audio features: {e}")
            return []
    
    def get_popular_songs(self, limit: int = 50) -> List[Dict]:
        """Get popular songs from various genres"""
        if not self.sp:
            return self._get_mock_songs(limit)
        
        # Popular genres to sample from
        genres = ['pop', 'rock', 'hip-hop', 'electronic', 'r-n-b', 'country', 'indie']
        all_songs = []
        
        try:
            for genre in genres:
                # Get playlists for each genre
                playlists = self.sp.search(q=genre, type='playlist', limit=5)
                
                for playlist in playlists['playlists']['items']:
                    if len(all_songs) >= limit:
                        break
                    
                    # Get tracks from playlist
                    tracks = self.sp.playlist_tracks(playlist['id'], limit=10)
                    
                    for item in tracks['items']:
                        if len(all_songs) >= limit:
                            break
                        
                        track = item['track']
                        if track:
                            song = {
                                'id': track['id'],
                                'title': track['name'],
                                'artist': track['artists'][0]['name'] if track['artists'] else 'Unknown Artist',
                                'album': track['album']['name'],
                                'preview_url': track['preview_url'],
                                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                                'spotify_id': track['id']
                            }
                            all_songs.append(song)
            
            return all_songs[:limit]
        except Exception as e:
            print(f"Error getting popular songs: {e}")
            return self._get_mock_songs(limit)
    
    def _get_mock_songs(self, limit: int = 20) -> List[Dict]:
        """Return mock songs when Spotify API is not available"""
        mock_songs = [
            {
                'id': '1',
                'title': 'Bohemian Rhapsody',
                'artist': 'Queen',
                'album': 'A Night at the Opera',
                'preview_url': None,
                'image_url': 'https://via.placeholder.com/300x300?text=Queen',
                'spotify_id': 'mock_1',
                'danceability': 0.7,
                'energy': 0.8,
                'key': 5,
                'loudness': -5.2,
                'mode': 1,
                'speechiness': 0.1,
                'acousticness': 0.2,
                'instrumentalness': 0.1,
                'liveness': 0.3,
                'valence': 0.6,
                'tempo': 145.0
            },
            {
                'id': '2',
                'title': 'Hotel California',
                'artist': 'Eagles',
                'album': 'Hotel California',
                'preview_url': None,
                'image_url': 'https://via.placeholder.com/300x300?text=Eagles',
                'spotify_id': 'mock_2',
                'danceability': 0.5,
                'energy': 0.6,
                'key': 7,
                'loudness': -6.1,
                'mode': 1,
                'speechiness': 0.05,
                'acousticness': 0.4,
                'instrumentalness': 0.2,
                'liveness': 0.2,
                'valence': 0.4,
                'tempo': 75.0
            },
            {
                'id': '3',
                'title': 'Imagine',
                'artist': 'John Lennon',
                'album': 'Imagine',
                'preview_url': None,
                'image_url': 'https://via.placeholder.com/300x300?text=John+Lennon',
                'spotify_id': 'mock_3',
                'danceability': 0.3,
                'energy': 0.4,
                'key': 0,
                'loudness': -8.5,
                'mode': 1,
                'speechiness': 0.03,
                'acousticness': 0.8,
                'instrumentalness': 0.1,
                'liveness': 0.1,
                'valence': 0.3,
                'tempo': 76.0
            },
            {
                'id': '4',
                'title': 'Stairway to Heaven',
                'artist': 'Led Zeppelin',
                'album': 'Led Zeppelin IV',
                'preview_url': None,
                'image_url': 'https://via.placeholder.com/300x300?text=Led+Zeppelin',
                'spotify_id': 'mock_4',
                'danceability': 0.4,
                'energy': 0.7,
                'key': 2,
                'loudness': -7.2,
                'mode': 0,
                'speechiness': 0.04,
                'acousticness': 0.3,
                'instrumentalness': 0.4,
                'liveness': 0.2,
                'valence': 0.5,
                'tempo': 82.0
            },
            {
                'id': '5',
                'title': 'Billie Jean',
                'artist': 'Michael Jackson',
                'album': 'Thriller',
                'preview_url': None,
                'image_url': 'https://via.placeholder.com/300x300?text=Michael+Jackson',
                'spotify_id': 'mock_5',
                'danceability': 0.9,
                'energy': 0.8,
                'key': 0,
                'loudness': -4.8,
                'mode': 0,
                'speechiness': 0.08,
                'acousticness': 0.1,
                'instrumentalness': 0.05,
                'liveness': 0.3,
                'valence': 0.7,
                'tempo': 117.0
            }
        ]
        
        # Add more mock songs if needed
        while len(mock_songs) < limit:
            mock_songs.extend(mock_songs[:min(limit - len(mock_songs), len(mock_songs))])
        
        return mock_songs[:limit] 