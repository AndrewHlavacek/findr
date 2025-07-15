import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import SongCard from './SongCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Home = ({ userId }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchNextSong()
    }
  }, [userId])

  const fetchNextSong = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`${API_BASE_URL}/songs/recommend`, {
        headers: {
          'X-User-ID': userId
        }
      })
      
      setCurrentSong(response.data.song)
    } catch (err) {
      console.error('Error fetching song:', err)
      setError('Failed to load song. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction) => {
    if (!currentSong) return

    const swipeType = direction === 'right' ? 'like' : 'dislike'
    
    try {
      await axios.post(`${API_BASE_URL}/swipe`, {
        song_id: currentSong.id,
        swipe_type: swipeType
      }, {
        headers: {
          'X-User-ID': userId
        }
      })

      setSwipeDirection(direction)
      
      // Wait for animation to complete, then fetch next song
      setTimeout(() => {
        setSwipeDirection(null)
        fetchNextSong()
      }, 300)
    } catch (err) {
      console.error('Error recording swipe:', err)
      setError('Failed to record swipe. Please try again.')
    }
  }

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100
    const { offset } = info

    if (Math.abs(offset.x) > swipeThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left'
      handleSwipe(direction)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your next song...</p>
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
            onClick={fetchNextSong}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentSong) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No more songs available!</p>
          <button 
            onClick={fetchNextSong}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Discover Music</h1>
        <p className="text-gray-600">Swipe right to like, left to skip</p>
      </div>

      <div className="relative">
        <motion.div
          key={currentSong.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
          }}
          transition={{ duration: 0.3 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <SongCard song={currentSong} />
        </motion.div>

        {/* Swipe indicators */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: swipeDirection === 'left' ? 1 : 0,
              x: swipeDirection === 'left' ? 0 : -50
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            SKIP
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: swipeDirection === 'right' ? 1 : 0,
              x: swipeDirection === 'right' ? 0 : 50
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            LIKE
          </motion.div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-8 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
        >
          ✕
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
        >
          ♥
        </button>
      </div>
    </div>
  )
}

export default Home 