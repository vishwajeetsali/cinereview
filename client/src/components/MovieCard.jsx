import { useNavigate } from 'react-router-dom'
import MoviePoster from './MoviePoster'

export default function MovieCard({ movie }) {
    const navigate = useNavigate()
    const year = movie.release_date?.split('-')[0] || 'N/A'

    return (
        <div onClick={() => navigate(`/movie/${movie.id}`)} className="cursor-pointer hover:scale-105 transition-transform duration-200">
            <MoviePoster path={movie.poster_path} title={movie.title} />
            <h3 className="text-base font-semibold text-zinc-100 mt-2 line-clamp-2">{movie.title}</h3>
            <p className="text-sm text-zinc-400">{year}</p>
        </div>
    )
}