import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Camera } from "lucide-react";

export default function EditProfileModal({ onClose, onSave }) {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB');
            return;
        }
        setAvatarFile(file);
        setPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append("name", name);
            if (avatarFile) fd.append("avatar", avatarFile);
            const res = await api.put("/api/users/profile", fd);
            updateUser({ name: res.data.name, avatar: res.data.avatar });
            onSave(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to save. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm mx-4 p-5"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-zinc-100">Edit Profile</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 mb-5">
                    <label className="relative cursor-pointer group">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-rose-600 flex items-center justify-center text-2xl font-black text-white">
                            {preview
                                ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                                : user?.name?.charAt(0).toUpperCase()
                            }
                        </div>
                        {/* Camera overlay on hover */}
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Camera size={20} className="text-white" />
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <span className="text-xs text-zinc-500">Click avatar to change photo</span>
                </div>

                {/* Name input */}
                <label className="text-xs text-zinc-400 mb-1 block">Display Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-rose-500 rounded-lg px-3 py-2 text-zinc-100 text-sm mb-4 focus:outline-none transition-colors"
                />

                {error && <p className="text-rose-400 text-xs mb-2">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}