import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';
import FloorPlanMap, { generateDefaultPositions, checkCapacity, STALL_WEIGHTS, HALL_CAPACITY, MAX_STALLS } from '../../components/FloorPlanMap';

export default function AdminEventNew() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ name: '', description: '', location: '', eventDate: '', imageUrl: '' });
    const [imageMode, setImageMode] = useState('url'); 
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [stallConfig, setStallConfig] = useState([
        { key: 'SMALL', label: 'Small',  count: '', price: '' },
        { key: 'MEDIUM', label: 'Medium',  count: '', price: '' },
        { key: 'LARGE', label: 'Large', count: '', price: '' },
    ]);
    const [stalls, setStalls] = useState([]);
    const [mapGenerated, setMapGenerated] = useState(false);
    const [editingLayout, setEditingLayout] = useState(false);
    const [layoutLocked, setLayoutLocked] = useState(false);
    const [creating, setCreating] = useState(false);
    const [msg, setMsg] = useState('');

    if (!isAdmin) return <Navigate to="/login" replace />;

    const updateConfig = (idx, field, value) => {
        setStallConfig(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    };

    const handleAddStalls = () => {
        const counts = {
            SMALL: parseInt(stallConfig[0].count) || 0,
            MEDIUM: parseInt(stallConfig[1].count) || 0,
            LARGE: parseInt(stallConfig[2].count) || 0,
        };

        if (counts.SMALL === 0 && counts.MEDIUM === 0 && counts.LARGE === 0) {
            setMsg('Add at least one stall.');
            return;
        }

        const capacityCheck = checkCapacity(counts);
        if (!capacityCheck.valid) {
            setMsg(`Total stall capacity exceeded! Current load: ${capacityCheck.total}, Max: ${HALL_CAPACITY}. Please reduce stall counts.`);
            return;
        }

        const prices = stallConfig.map(c => parseFloat(c.price) || 0);
        const generated = generateDefaultPositions(counts.SMALL, counts.MEDIUM, counts.LARGE);

        generated.forEach(s => {
            if (s.size === 'SMALL') s.price = prices[0];
            else if (s.size === 'MEDIUM') s.price = prices[1];
            else s.price = prices[2];
            s.blocked = false;
        });
        setStalls(generated);
        setMapGenerated(true);
        setLayoutLocked(false);
        setMsg('');
    };

    const handleStallClick = (stall) => {
        setStalls(prev => prev.map(s =>
            s.stallCode === stall.stallCode ? { ...s, blocked: !s.blocked } : s
        ));
    };

    const handlePositionChange = (stallCode, x, y) => {
        setStalls(prev => prev.map(s =>
            s.stallCode === stallCode ? { ...s, positionX: x, positionY: y } : s
        ));
    };

    const handleSetMap = () => {
        setLayoutLocked(true);
        setEditingLayout(false);
        setMsg('Map layout set! You can now create the event.');
    };

    // Image upload handler
    const handleImageUpload = async () => {
        if (!imageFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch('/api/admin/content/upload-image', {
                method: 'POST', headers, body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            setForm(f => ({ ...f, imageUrl: data.url }));
            setMsg('Image uploaded successfully!');
        } catch (err) {
            setMsg('Upload error: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.name || !form.location || !form.eventDate) {
            setMsg('Please fill in event name, location, and date.');
            return;
        }
        setCreating(true);
        setMsg('');
        try {
            const result = await adminApi.events.create({
                ...form,
                stalls: stalls.map(s => ({
                    stallCode: s.stallCode, size: s.size, price: s.price,
                    blocked: s.blocked, positionX: s.positionX, positionY: s.positionY,
                })),
            });
            navigate(`/admin/events/${result.id}`);
        } catch (err) {
            setMsg('Error: ' + err.message);
            setCreating(false);
        }
    };

    const heldCount = stalls.filter(s => s.blocked).length;
    const heldSet = new Set(stalls.filter(s => s.blocked).map(s => s.stallCode));

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="font-display text-2xl font-bold mb-6">Create New Event</h1>

            {msg && (
                <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${msg.startsWith('Error') || msg.startsWith('Upload error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {msg}
                </div>
            )}

            <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Event Name </label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. BMICH Book Fair 2026"
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Location </label>
                        <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                            placeholder="e.g. BMICH, Colombo"
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Event Date & Time </label>
                        <input type="datetime-local" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="About this event..." rows={3}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" />
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    Event Image
                </h2>

                <div className="flex gap-2 mb-4">
                    <button type="button"
                        onClick={() => setImageMode('url')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'url' ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        🔗 Use URL
                    </button>
                    <button type="button"
                        onClick={() => setImageMode('file')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'file' ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        📁 Upload File
                    </button>
                </div>

                {imageMode === 'url' ? (
                    <div>
                        <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                            placeholder="https://example.com/event-banner.jpg"
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                        <input type="file" ref={fileInputRef} accept="image/*"
                            onChange={e => setImageFile(e.target.files?.[0] || null)}
                            className="border border-stone-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:border-0 file:text-sm file:font-medium file:bg-violet-100 file:text-violet-700 file:rounded-lg file:cursor-pointer" />
                        <button type="button" onClick={handleImageUpload} disabled={!imageFile || uploading}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition">
                            {uploading ? 'Uploading...' : '⬆ Upload'}
                        </button>
                    </div>
                )}

                {form.imageUrl && (
                    <div className="mt-3">
                        <p className="text-xs text-stone-500 mb-1">Preview:</p>
                        <img src={form.imageUrl} alt="Event preview" className="w-48 h-32 object-cover rounded-lg border border-stone-200" onError={e => e.target.style.display = 'none'} />
                    </div>
                )}
            </section>

            <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    Stall Configuration
                </h2>
                <div className="space-y-3">
                    {stallConfig.map((cfg, idx) => (
                        <div key={cfg.key} className="flex items-center gap-3 flex-wrap p-3 bg-stone-50 rounded-lg border border-stone-200">
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <span className="text-lg">{cfg.icon}</span>
                                <span className="font-semibold text-stone-700">{cfg.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-stone-500">Count:</label>
                                <input type="number" min="0" max={MAX_STALLS[cfg.key]} value={cfg.count}
                                    onChange={e => updateConfig(idx, 'count', e.target.value)}
                                    placeholder="0"
                                    className="w-20 border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                <span className="text-xs text-stone-400">(max {MAX_STALLS[cfg.key]})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-stone-500">Price (Rs) : </label>
                                <input type="number" min="0" value={cfg.price}
                                    onChange={e => updateConfig(idx, 'price', e.target.value)}
                                    placeholder="0"
                                    className="w-28 border border-stone-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddStalls}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
                     Add Stalls
                </button>
            </section>

            {mapGenerated && stalls.length > 0 && (
                <section className="bg-white rounded-xl shadow border border-stone-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            Reservation Map
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingLayout(!editingLayout)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${editingLayout ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                            >
                                {editingLayout ? ' Dragging Mode ON' : '↔ Edit Layout'}
                            </button>
                            <button onClick={handleSetMap}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
                                ✅ Set Map
                            </button>
                        </div>
                    </div>
                    <p className="text-stone-500 text-sm mb-4">
                        {editingLayout
                            ? 'Drag stalls to rearrange them. Click "Set Map" when done.'
                            : 'Click a stall to hold (admin-reserved). Click again to release. Use "Edit Layout" to drag-and-drop stalls.'}
                    </p>

                    <FloorPlanMap
                        stalls={stalls}
                        selectedSet={heldSet}
                        onStallClick={editingLayout ? undefined : handleStallClick}
                        onPositionChange={handlePositionChange}
                        draggable={editingLayout}
                        mode="create"
                    />

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
                        <span>Total: <strong>{stalls.length}</strong></span>
                        <span>Admin held: <strong className="text-red-600">{heldCount}</strong></span>
                        <span>Available: <strong className="text-emerald-600">{stalls.length - heldCount}</strong></span>
                        {layoutLocked && <span className="text-emerald-600 font-semibold">✅ Layout set</span>}
                    </div>
                </section>
            )}

            {mapGenerated && stalls.length > 0 && (
                <button onClick={handleCreate} disabled={creating}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-3.5 rounded-lg transition disabled:opacity-50 text-lg shadow-lg">
                    {creating ? 'Creating Event...' : ' Create Event'}
                </button>
            )}
        </div>
    );
}
