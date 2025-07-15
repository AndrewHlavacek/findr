import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Playlist from './components/Playlist'

function App() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // Get or create user ID from localStorage
    let storedUserId = localStorage.getItem('findr_user_id')
    if (!storedUserId) {
      storedUserId = crypto.randomUUID()
      localStorage.setItem('findr_user_id', storedUserId)
    }
    setUserId(storedUserId)
  }, [])

  return (
    <Router>
      <div className="App">
        <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">🎵 Findr</Link>
            <div className="space-x-6">
              <Link to="/" className="hover:text-pink-200 transition-colors">Home</Link>
              <Link to="/playlist" className="hover:text-pink-200 transition-colors">My Playlist</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home userId={userId} />} />
            <Route path="/playlist" element={<Playlist userId={userId} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
