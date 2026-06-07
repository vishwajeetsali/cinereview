export const initSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('joinMovie', (tmdbId) => {
            socket.join(`movie_${tmdbId}`)
        })

        socket.on('joinUser', (userId) => {
            socket.join(`user_${userId}`)
        })

        socket.on('joinReview', (reviewId) => {
            socket.join(`review_${reviewId}`)
        })

        socket.on('newComment', (comment) => {
            io.to(`review_${comment.reviewId}`).emit('commentReceived', comment)
        })
    })
}