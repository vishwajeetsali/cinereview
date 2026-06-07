import { useState, useEffect } from 'react'
import api from '../api/axios'
import useCommentSocket from '../hooks/useCommentSocket'
import { MessageCircle, Trash2 } from 'lucide-react'

export default function CommentSection({ reviewId, user }) {
    const [open, setOpen] = useState(false)
    const [comments, setComments] = useState([])
    const [text, setText] = useState('')

    useEffect(() => {
        if (!open) return
        api.get(`/api/comments/${reviewId}`)
            .then(res => setComments(res.data))
            .catch(err => console.error(err))
    }, [open, reviewId])

    useCommentSocket(reviewId, (newComment) => {
        setComments(prev =>
            prev.find(c => c._id === newComment._id) ? prev : [...prev, newComment]
        )
    })

    const handleSubmit = async () => {
        if (!text.trim()) return
        try {
            const res = await api.post(`/api/comments/${reviewId}`, { text })
            setComments(prev => [...prev, res.data])
            setText('')
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/api/comments/${commentId}`)
            setComments(prev => prev.filter(c => c._id !== commentId))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
            <button onClick={() => setOpen(p => !p)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition">
                <MessageCircle size={13} />
                {open ? 'Hide' : 'Comments'}
            </button>
            {open && (
                <div className="mt-3 space-y-2">
                    {comments.map(c => (
                        <div key={c._id} className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-rose-600 overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
                                {c.userId?.avatar
                                    ? <img src={c.userId.avatar} alt={c.userId.name} className="w-full h-full object-cover" />
                                    : c.userId?.name?.charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-400 font-semibold text-xs">{c.userId?.name}</span>
                                    {user?.id === c.userId?._id && (
                                        <button onClick={() => handleDelete(c._id)}
                                            className="text-zinc-600 hover:text-rose-400 transition">
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-zinc-300 text-sm mt-0.5">{c.text}</p>
                            </div>
                        </div>
                    ))}

                    {user && (
                        <div className="flex gap-2 mt-3">
                            <input value={text}
                                onClick={e => e.stopPropagation()}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); handleSubmit(); } }}
                                placeholder="Add a comment..."
                                className="flex-1 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-rose-500 placeholder-zinc-600 transition-colors" />
                            <button onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                                className="text-sm px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition">
                                Send
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}