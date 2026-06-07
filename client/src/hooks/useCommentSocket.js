import { useEffect } from 'react'
import { io } from 'socket.io-client'

export default function useCommentSocket(reviewId, onNewComment) {
    useEffect(() => {
        if (!reviewId) return
        const socket = io(import.meta.env.VITE_API_URL)
        socket.emit('joinReview', reviewId)
        socket.on('commentReceived', onNewComment)
        return () => socket.disconnect()
    }, [reviewId])
}