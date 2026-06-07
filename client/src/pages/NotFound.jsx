import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import { useEffect } from 'react'


export default function NotFound() {

    useEffect(() => {
        document.title = '404 — CineReview'
        return () => { document.title = 'CineReview' }
    }, [])

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
                <div className="text-center space-y-4">
                    <h1 className="font-serif text-9xl text-rose-600">404</h1>
                    <p className="text-zinc-400 text-lg">Page not found.</p>
                    <Link to="/" className="text-rose-400 hover:text-rose-300 underline underline-offset-4 text-sm transition">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </PageTransition>
    );
}