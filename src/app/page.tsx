'use client'
import { useState } from 'react'

const Home = () => {
  const [url, setUrl] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const handleDownload = async () => {
    const response = await fetch(
      `/api/download?url=${encodeURIComponent(url)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
    )
  console.log(response)
    if (!response.ok) {
      alert('Failed to download video')
      return
    }
  
    const blob = await response.blob()
    const url2 = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url2
    a.download = 'video.mp4'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url2)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">YouTube Downloader</h1>
        <div className="mb-4">
          <label className="block mb-1">YouTube URL:</label>
          <input
            placeholder='URL'
            type="text"
            className="w-full border text-gray-800 border-gray-300 p-2 rounded"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Start Time (hh:mm:ss):</label>
          <input
            placeholder='tempo inicial'
            type="text"
            className="w-full border text-gray-800 border-gray-300 p-2 rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">End Time (hh:mm:ss):</label>
          <input
            type="text"
            placeholder='tempo final'
            className="w-full border text-gray-800 border-gray-300 p-2 rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white p-2 rounded w-full"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  )
}

export default Home