import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
                    <div className="text-center space-y-4">
                        <h1 className="font-serif text-4xl text-rose-600">Oops!</h1>
                        <p className="text-zinc-400">Something went wrong.</p>
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => this.setState({ hasError: false })}
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition">
                                Try again
                            </button>
                            <Link to="/" className="text-rose-400 hover:text-rose-300 underline underline-offset-4 text-sm transition">
                                ← Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary