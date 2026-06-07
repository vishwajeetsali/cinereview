import { useState } from 'react';
import api from '../api/axios.jsx';

export default function EditReviewModal({ review, onClose, onSave }) {
    const [rating, setRating] = useState(review.rating);
    const [text, setText] = useState(review.text);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!text.trim()) return
        try {
            setSubmitting(true);
            setError('');
            const res = await api.put(`/api/reviews/${review._id}`, { rating, text });
            onSave(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to save. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-md w-full mx-4"
                onClick={e => e.stopPropagation()}>

                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Edit Review</h3>

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest w-16">Rating</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <button
                                key={n}
                                onClick={() => setRating(n)}
                                className={`w-7 h-7 rounded text-xs font-semibold transition-all ${n <= rating ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                            >{n}</button>
                        ))}
                    </div>
                </div>

                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-600 transition-colors resize-none mb-4"
                />

                {error && <p className="text-rose-400 text-xs mb-2">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 text-white text-sm rounded-lg transition">
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}