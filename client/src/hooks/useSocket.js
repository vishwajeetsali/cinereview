import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(tmdbId, onNewReview, onVerdictUpdated) {
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL);

        socket.emit('joinMovie', tmdbId);

        socket.on('newReview', (data) => {
            onNewReview(data);
        });

        socket.on('verdictUpdated', (data) => {
            onVerdictUpdated(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [tmdbId]);
}