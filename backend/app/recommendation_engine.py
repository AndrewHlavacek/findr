import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Optional
import joblib
import os

class MusicRecommendationEngine:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'danceability', 'energy', 'key', 'loudness', 'mode',
            'speechiness', 'acousticness', 'instrumentalness',
            'liveness', 'valence', 'tempo'
        ]
        self.is_trained = False
        
    def build_model(self, input_dim: int):
        """Build a simple neural network for recommendation scoring"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(input_dim,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def extract_features(self, song_data: Dict) -> np.ndarray:
        """Extract audio features from song data"""
        features = []
        for col in self.feature_columns:
            value = song_data.get(col, 0.0)
            if col == 'tempo' and value is None:
                value = 120.0  # Default tempo
            elif value is None:
                value = 0.0
            features.append(float(value))
        
        return np.array(features).reshape(1, -1)
    
    def train_on_user_data(self, user_swipes: List[Dict], all_songs: List[Dict]):
        """Train the recommendation model on user's swipe history"""
        if not user_swipes:
            return
        
        # Prepare training data
        X = []
        y = []
        
        for swipe in user_swipes:
            song_id = swipe['song_id']
            song_data = next((s for s in all_songs if s['id'] == song_id), None)
            
            if song_data:
                features = self.extract_features(song_data)
                X.append(features.flatten())
                y.append(1 if swipe['swipe_type'] == 'like' else 0)
        
        if not X:
            return
        
        X = np.array(X)
        y = np.array(y)

        # Only train if we have at least 2 samples
        if len(X) < 2:
            return
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Build and train model
        self.model = self.build_model(X.shape[1])
        self.model.fit(
            X_scaled, y,
            epochs=10,
            batch_size=32,
            validation_split=0.2,
            verbose=0
        )
        
        self.is_trained = True
    
    def predict_score(self, song_data: Dict) -> float:
        """Predict how much a user would like a song (0-1 score)"""
        if not self.is_trained or self.model is None:
            return 0.5  # Neutral score for untrained model
        
        features = self.extract_features(song_data)
        features_scaled = self.scaler.transform(features)
        score = self.model.predict(features_scaled, verbose=0)[0][0]
        return float(score)
    
    def get_recommendations(self, candidate_songs: List[Dict], user_swipes: List[Dict], 
                          n_recommendations: int = 10) -> List[Dict]:
        """Get top recommendations for a user"""
        if not self.is_trained:
            # Return random songs if model not trained
            import random
            return random.sample(candidate_songs, min(n_recommendations, len(candidate_songs)))
        
        # Filter out already swiped songs
        swiped_song_ids = {swipe['song_id'] for swipe in user_swipes}
        available_songs = [s for s in candidate_songs if s['id'] not in swiped_song_ids]
        
        # Score all available songs
        scored_songs = []
        for song in available_songs:
            score = self.predict_score(song)
            scored_songs.append({
                'song': song,
                'score': score
            })
        
        # Sort by score and return top recommendations
        scored_songs.sort(key=lambda x: x['score'], reverse=True)
        return [item['song'] for item in scored_songs[:n_recommendations]]
    
    def save_model(self, filepath: str):
        """Save the trained model and scaler"""
        if self.model and self.is_trained:
            self.model.save(f"{filepath}_model")
            joblib.dump(self.scaler, f"{filepath}_scaler.pkl")
    
    def load_model(self, filepath: str):
        """Load a trained model and scaler"""
        try:
            self.model = tf.keras.models.load_model(f"{filepath}_model")
            self.scaler = joblib.load(f"{filepath}_scaler.pkl")
            self.is_trained = True
        except:
            self.is_trained = False 