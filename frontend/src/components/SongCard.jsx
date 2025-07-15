import React, { useState } from 'react'
import { motion } from 'framer-motion'

const SongCard = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState(null)

  const handlePlayPreview = () => {
    if (!song.preview_url) {
      alert('No preview available for this song')
      return
    }

    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
      setAudio(null)
    } else {
      const newAudio = new Audio(song.preview_url)
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false)
        setAudio(null)
      })
      newAudio.play()
      setIsPlaying(true)
      setAudio(newAudio)
    }
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Album Art */}
      <div className="relative h-80 bg-gradient-to-br from-purple-400 to-pink-400">
        {song.image_url ? (
          <img
            src={song.image_url}
            alt={`${song.title} album cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl">🎵</div>
          </div>
        )}
        
        {/* Play button overlay */}
        {song.preview_url && (
          <button
            onClick={handlePlayPreview}
            className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg"
          >
            {isPlaying ? (
              <span className="text-purple-600 text-xl">⏸️</span>
            ) : (
              <span className="text-purple-600 text-xl">▶️</span>
            )}
          </button>
        )}
      </div>

      {/* Song Info */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {song.title}
        </h2>
        <p className="text-gray-600 mb-3">{song.artist}</p>
        
        {song.album && (
          <p className="text-sm text-gray-500 mb-4">{song.album}</p>
        )}

        {/* Audio Features (optional) */}
        {song.tempo && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>BPM: {Math.round(song.tempo)}</span>
            {song.energy && (
              <span>Energy: {Math.round(song.energy * 100)}%</span>
            )}
          </div>
        )}

        {/* Swipe Instructions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-red-500 mr-1">✕</span>
              <span>Swipe left to skip</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-1">♥</span>
              <span>Swipe right to like</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SongCard 