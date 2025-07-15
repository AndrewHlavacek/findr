import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Playlist = ({ userId }) => {
  const [playlist, setPlaylist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playingAudio, setPlayingAudio] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchPlaylist()
    }
  }, [userId])

  const fetchPlaylist = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`${API_BASE_URL}/playlist`, {
        headers: {
          'X-User-ID': userId
        }
      })
      
      setPlaylist(response.data)
    } catch (err) {
      console.error('Error fetching playlist:', err)
      setError('Failed to load playlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPreview = (song) => {
    if (!song.preview_url) {
      alert('No preview available for this song')
      return
    }

    if (playingAudio) {
      playingAudio.pause()
      setPlayingAudio(null)
    } else {
      const audio = new Audio(song.preview_url)
      audio.addEventListener('ended', () => {
        setPlayingAudio(null)
      })
      audio.play()
      setPlayingAudio(audio)
    }
  }

  const handleRemoveSong = async (songId) => {
    try {
      await axios.delete(`${API_BASE_URL}/playlist/remove/${songId}`, {
        headers: {
          'X-User-ID': userId
        }
      })
      
      // Update local state
      setPlaylist(playlist.filter(item => item.song.id !== songId))
    } catch (err) {
      console.error('Error removing song:', err)
      alert('Failed to remove song from playlist')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your playlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPlaylist}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Playlist</h1>
        <p className="text-gray-600">
          {playlist.length === 0 
            ? "Start swiping to build your playlist!" 
            : `${playlist.length} song${playlist.length === 1 ? '' : 's'} in your playlist`
          }
        </p>
      </div>

      {playlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-500 mb-4">Your playlist is empty</p>
          <p className="text-sm text-gray-400">
            Go back to the home page and start swiping to discover music!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {playlist.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Album Art */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                  {item.song.image_url ? (
                    <img
                      src={item.song.image_url}
                      alt={`${item.song.title} album cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white text-4xl">🎵</div>
                    </div>
                  )}
                  
                  {/* Play button overlay */}
                  {item.song.preview_url && (
                    <button
                      onClick={() => handlePlayPreview(item.song)}
                      className="absolute top-2 right-2 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg"
                    >
                      {playingAudio ? (
                        <span className="text-purple-600 text-sm">⏸️</span>
                      ) : (
                        <span className="text-purple-600 text-sm">▶️</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Song Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                    {item.song.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.song.artist}</p>
                  
                  {item.song.album && (
                    <p className="text-xs text-gray-500 mb-3">{item.song.album}</p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Added {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    
                    <button
                      onClick={() => handleRemoveSong(item.song.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove from playlist"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Playlist 