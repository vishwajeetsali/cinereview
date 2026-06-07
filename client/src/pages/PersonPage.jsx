import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import PageTransition from '../components/PageTransition'
import MovieCard from '../components/MovieCard';

export default function PersonPage() {
    const { personId } = useParams()
    const navigate = useNavigate()
    const [person, setPerson] = useState(null)
    const [crewCredits, setCrewCredits] = useState([])
    const [credits, setCredits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (person) document.title = `${person.name} — CineReview`
        return () => { document.title = 'CineReview' }
    }, [person])

    useEffect(() => {
        const fetchBoth = async () => {
            try {
                const [detailsRes, creditsRes] = await Promise.all([
                    api.get(`/api/movies/person/${personId}`),
                    api.get(`/api/movies/person/${personId}/credits`)
                ])
                setPerson(detailsRes.data)
                setCredits(creditsRes.data.cast || [])
                setCrewCredits(creditsRes.data.crew || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchBoth();
    }, [personId])

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
        </div>
    )

    const filmography = person?.known_for_department === 'Directing'
        ? [...new Map(crewCredits.filter(m => m.job === 'Director' && m.poster_path).map(m => [m.id, m])).values()]
            .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
        : person?.known_for_department === 'Production'
            ? [...new Map(crewCredits.filter(m => m.job === 'Producer' && m.poster_path).map(m => [m.id, m])).values()]
                .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
            : [...new Map(credits.filter(m => m.poster_path).map(m => [m.id, m])).values()]
                .sort((a, b) => (b.release_date || b.first_air_date || '').localeCompare(a.release_date || a.first_air_date || ''))

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← Back</button>
                    <div className="flex gap-8 mb-10">
                        {person.profile_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                                alt={person.name}
                                className="w-40 rounded-xl shrink-0 object-cover"
                            />
                        )}
                        <div className="space-y-2">
                            <h1 className="font-serif text-4xl">{person.name}</h1>
                            <p className="text-zinc-500 text-sm">
                                {person.known_for_department}{person.birthday ? ` · ${person.birthday}` : ''}
                            </p>
                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-5">{person.biography}</p>
                        </div>
                    </div>

                    <h2 className="font-serif text-2xl text-zinc-100 mb-4">Filmography</h2>
                    {filmography.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No filmography available.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filmography.map(m => (
                                <MovieCard key={m.id} movie={{ ...m, title: m.title || m.name }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}