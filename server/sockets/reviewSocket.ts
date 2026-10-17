import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        socket.on('joinMovie', (tmdbId: number | string) => {
            socket.join(`movie_${tmdbId}`)
        })

        socket.on('joinUser', (userId: string) => {
            socket.join(`user_${userId}`)
        })

        socket.on('joinReview', (reviewId: string) => {
            socket.join(`review_${reviewId}`)
        })

        socket.on('newComment', (comment: any) => {
            io.to(`review_${comment.reviewId}`).emit('commentReceived', comment)
        })
    })
}
