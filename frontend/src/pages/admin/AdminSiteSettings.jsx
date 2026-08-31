import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

const FIELDS = {
    home: [
        { key: 'home.title', label: 'Page Title', type: 'text', placeholder: 'e.g. Book Fair Management System' },
        { key: 'home.description', label: 'Description', type: 'textarea', placeholder: 'Short tagline shown on the home page' },
    ],
    contact: [
        { key: 'contact.email', label: 'Email', type: 'email', placeholder: 'support@example.com' },
        { key: 'contact.phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
        { key: 'contact.address', label: 'Address', type: 'text', placeholder: 'Full address' },
        { key: 'contact.content', label: 'Additional Info', type: 'textarea', placeholder: 'Opening hours, map link, etc.' },
    ],
};

export default function AdminSiteSettings() {
    const { isAdmin } = useAuth();
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [aboutDeleted, setAboutDeleted] = useState(false);
    const [videoMode, setVideoMode] = useState('url'); 
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isAdmin) return;
        adminApi.content.get()
            .then((data) => {
                setForm(data);
                if (data['home.videoUrl'] && data['home.videoUrl'].startsWith('/uploads')) {
                    setVideoMode('file');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [isAdmin]);

    if (!isAdmin) return <Navigate to="/login" replace />;

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            const updated = await adminApi.content.update(form);
            setForm(updated);
            setMsg('Settings saved successfully!');
        } catch (err) {
            setMsg('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setMsg('');
        try {
            const result = await adminApi.content.uploadVideo(selectedFile);
            handleChange('home.videoUrl', result.videoUrl);
            setMsg('Video uploaded successfully!');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setMsg('Error: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAbout = async () => {
        if (!window.confirm('Delete all About page content? This cannot be undone.')) return;
        try {
            await adminApi.content.deleteAbout();
            setAboutDeleted(true);
            setMsg('About page content deleted.');
        } catch (err) {
            setMsg('Error: ' + err.message);
        }
    };

    const renderField = (field) => {
        const value = form[field.key] || '';
        if (field.type === 'textarea') {
            return (
                <textarea
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y"
                />
            );
        }
        return (
            <input
                type={field.type}
                value={value}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
        );
    };

    if (loading) return <div className="container mx-auto px-4 py-12">Loading...</div>;

    const currentVideoUrl = form['home.videoUrl'] || '';

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="font-display text-2xl font-bold mb-8">Site Settings</h1>

            {msg && (
                <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {msg}
                </div>
            )}

            <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    Home Page
                </h2>
                <p className="text-stone-500 text-sm mb-4">Manage the title, description, and background video on the home page.</p>

                <div className="space-y-4">
                    {FIELDS.home.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
                            {renderField(field)}
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Background Video</label>

                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setVideoMode('url')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${videoMode === 'url' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                🔗 Use URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoMode('file')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${videoMode === 'file' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                📁 Upload File
                            </button>
                        </div>

                        {videoMode === 'url' ? (
                            <input
                                type="url"
                                value={currentVideoUrl}
                                onChange={(e) => handleChange('home.videoUrl', e.target.value)}
                                placeholder="YouTube link or direct video URL (e.g. https://youtube.com/watch?v=...)"
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/mp4,video/webm,video/ogg"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-emerald-100 file:text-emerald-700 file:font-medium file:text-sm file:cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        disabled={!selectedFile || uploading}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                                <p className="text-xs text-stone-400">Accepted formats: MP4, WebM, OGG</p>
                            </div>
                        )}

                        {currentVideoUrl && (
                            <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                                <p className="text-xs text-stone-500 mb-1">Current video:</p>
                                <p className="text-sm text-emerald-700 font-mono break-all">{currentVideoUrl}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📞</span>
                    Contact Details
                </h2>
                <p className="text-stone-500 text-sm mb-4">Update the contact information shown on the Contact Us page.</p>
                <div className="space-y-4">
                    {FIELDS.contact.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
                            {renderField(field)}
                        </div>
                    ))}
                </div>
            </section>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save All Settings'}
            </button>
            
        </div>
    );
}