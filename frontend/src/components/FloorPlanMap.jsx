import { useState, useRef, useCallback, useEffect } from 'react';


const HALL_W = 900, HALL_H = 700;
const SIZES = {
    SMALL: { w: 56, h: 44, label: 'Small Booths' },
    MEDIUM: { w: 84, h: 52, label: 'Medium Booths' },
    LARGE: { w: 120, h: 64, label: 'Large Booths' },
};
const COLORS = {
    SMALL: { bg: '#c8e6c9', border: '#43a047', text: '#1b5e20' },
    MEDIUM: { bg: '#bbdefb', border: '#1e88e5', text: '#0d47a1' },
    LARGE: { bg: '#e1bee7', border: '#8e24aa', text: '#4a148c' },
    selected: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    blocked: { bg: '#ffcdd2', border: '#e53935', text: '#b71c1c' },
    booked: { bg: '#e0e0e0', border: '#9e9e9e', text: '#424242' }, 
    disabled: { bg: '#eeeeee', border: '#bdbdbd', text: '#757575' },
};



const SECTION_TOP = 50;
const SEC1_START = SECTION_TOP;        
const SEC1_END = 250;
const SEC2_START = SEC1_END;           
const SEC2_END = 450;
const SEC3_START = SEC2_END;          
const SEC3_END = 620;
const MARGIN_X = 40;
const USABLE_W = HALL_W - MARGIN_X * 2 - 40; 
const GRID_SIZE = 10; 


export function toLogicalCoordinates(x, y) {
   
    const logicalX = ((x - (HALL_W / 2)) / (HALL_W / 2)) * 20;

    const logicalY = ((y - SECTION_TOP) / (HALL_H - SECTION_TOP)) * 15;

    return { x: parseFloat(logicalX.toFixed(2)), y: parseFloat(logicalY.toFixed(2)) };
}


export const HALL_CAPACITY = 1080;
export const STALL_WEIGHTS = { SMALL: 10, MEDIUM: 15, LARGE: 36 };

export const checkCapacity = (counts) => {
    const total = (counts.SMALL || 0) * STALL_WEIGHTS.SMALL +
        (counts.MEDIUM || 0) * STALL_WEIGHTS.MEDIUM +
        (counts.LARGE || 0) * STALL_WEIGHTS.LARGE;
    return { valid: total <= HALL_CAPACITY, total, remaining: HALL_CAPACITY - total };
};

export const MAX_STALLS = {
    SMALL: Math.floor(HALL_CAPACITY / STALL_WEIGHTS.SMALL),  
    MEDIUM: Math.floor(HALL_CAPACITY / STALL_WEIGHTS.MEDIUM), 
    LARGE: Math.floor(HALL_CAPACITY / STALL_WEIGHTS.LARGE), 
};


export function generateDefaultPositions(smallCount, mediumCount, largeCount) {
    const stalls = [];
    let currentY = SECTION_TOP + 20;

    const sections = [
        { count: smallCount, size: 'SMALL', prefix: 'S' },
        { count: mediumCount, size: 'MEDIUM', prefix: 'M' },
        { count: largeCount, size: 'LARGE', prefix: 'L' }
    ];

    sections.forEach(({ count, size, prefix }) => {
        if (count <= 0) return;

        const dim = SIZES[size];
        const gap = 10;
        const rowHeight = dim.h + 16; 

        const perRow = Math.floor((USABLE_W + gap) / (dim.w + gap));
        const rows = Math.ceil(count / perRow);

        let idx = 0;
        for (let r = 0; r < rows; r++) {
            const rowCount = Math.min(perRow, count - idx);
            const rowWidth = rowCount * dim.w + (rowCount - 1) * gap;
            const startX = MARGIN_X + (USABLE_W - rowWidth) / 2; 

            for (let c = 0; c < rowCount; c++) {
                stalls.push({
                    stallCode: `${prefix}-${String(++idx).padStart(2, '0')}`,
                    size: size,
                    positionX: Math.round(startX + c * (dim.w + gap)),
                    positionY: Math.round(currentY + r * rowHeight),
                });
            }
        }
        currentY += rows * rowHeight + 20;
    });

    return stalls;
}

function getColor(stall, isSelected, isBooked, mode) {
    if (stall.blocked) return COLORS.blocked;
    if (mode === 'book' && isBooked) return COLORS.disabled;
    if (isSelected) return COLORS.selected;
    if ((stall.bookedBy || isBooked) && mode !== 'create') return COLORS.booked;
    return COLORS[stall.size] || COLORS.SMALL;
}

export default function FloorPlanMap({
    stalls = [],
    selectedSet = new Set(),
    onStallClick,
    onPositionChange,
    draggable = false,
    mode = 'view',
    bookedIds = new Set(),
}) {
    const containerRef = useRef(null);
    const [dragInfo, setDragInfo] = useState(null);
    const [containerW, setContainerW] = useState(HALL_W);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) setContainerW(e.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const scale = containerW / HALL_W;

    const handlePointerDown = useCallback((e, stall) => {
        if (!draggable) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = containerRef.current.getBoundingClientRect();
        setDragInfo({
            code: stall.stallCode,
            id: stall.id, 
            ox: e.clientX - (stall.positionX * scale + rect.left),
            oy: e.clientY - (stall.positionY * scale + rect.top),
        });
    }, [draggable, scale]);

    const handlePointerMove = useCallback((e) => {
        if (!dragInfo) return;
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const stall = stalls.find(s => s.stallCode === dragInfo.code);
        if (!stall) return;
        const dim = SIZES[stall.size];
        let nx = Math.round((e.clientX - dragInfo.ox - rect.left) / scale);
        let ny = Math.round((e.clientY - dragInfo.oy - rect.top) / scale);
      
        nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
        ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
        nx = Math.max(0, Math.min(HALL_W - dim.w, nx));
        ny = Math.max(0, Math.min(HALL_H - dim.h, ny));
        onPositionChange?.(dragInfo.code, nx, ny);
    }, [dragInfo, stalls, scale, onPositionChange]);

    const handlePointerUp = useCallback(() => setDragInfo(null), []);

    useEffect(() => {
        if (dragInfo) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            return () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            };
        }
    }, [dragInfo, handlePointerMove, handlePointerUp]);

    const clickable = mode !== 'view';

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14, padding: '10px 16px', background: '#fafafa', borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 13,color: "black" }}>
                {Object.entries(SIZES).map(([k, v]) => (
                    <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS[k].bg, border: `2px solid ${COLORS[k].border}`, display: 'inline-block' }} />
                        {v.label}
                    </span>
                ))}
                {(mode === 'create' || mode === 'book') && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.selected.bg, border: `2px solid ${COLORS.selected.border}`, display: 'inline-block' }} />
                        Selected
                    </span>
                )}
                {mode !== 'create' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.booked.bg, border: `2px solid ${COLORS.booked.border}`, display: 'inline-block' }} />
                        Booked
                    </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS.blocked.bg, border: `2px solid ${COLORS.blocked.border}`, display: 'inline-block' }} />
                    Blocked
                </span>
            </div>

            <div
                ref={containerRef}
                style={{
                    position: 'relative', width: '100%',
                    paddingBottom: `${(HALL_H / HALL_W) * 100}%`,
                    background: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%)',
                    border: '4px solid #607d8b',
                    borderRadius: 16, overflow: 'hidden',
                    touchAction: 'none', userSelect: 'none',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.03)',
                }}
            >
                
                <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: 'top left', width: HALL_W, height: HALL_H }}>

                    {draggable && (
                        <svg width={HALL_W} height={HALL_H} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
                            <defs>
                                <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#b0bec5" strokeWidth="0.5" />
                                </pattern>
                                <pattern id="bigGrid" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
                                    <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#smallGrid)" />
                                    <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#78909c" strokeWidth="1.0" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#bigGrid)" />
                        </svg>
                    )}

                    <div style={{ position: 'absolute', top: 4, left: 14, fontSize: 10, fontWeight: 700, color: '#90a4ae', letterSpacing: 2, textTransform: 'uppercase', zIndex: 50 }}>
                        Exhibition Hall · Floor Plan
                    </div>

                    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #ff8f00, #e65100)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 26px', borderRadius: 20, letterSpacing: 2, boxShadow: '0 3px 10px rgba(230,81,0,0.3)', zIndex: 50 }}>
                        ▼ MAIN ENTRANCE ▼
                    </div>

                    <div style={{ position: 'absolute', right: 0, top: '32%', height: '18%', width: 34, background: '#e3f2fd', borderLeft: '3px solid #42a5f5', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
                        <span style={{ writingMode: 'vertical-rl', fontSize: 9, fontWeight: 700, color: '#0277bd', letterSpacing: 1 }}>🚻 WC</span>
                    </div>

                    {[250, 450].map(py => [120, HALL_W - 140].map(px => (
                        <div key={`p-${px}-${py}`} style={{ position: 'absolute', left: px - 5, top: py - 5, width: 10, height: 10, background: '#b0bec5', borderRadius: '50%', border: '2px solid #78909c', zIndex: 40 }} />
                    )))}

                    {stalls.map((stall) => {
                        const dim = SIZES[stall.size];
                        const isSelected = selectedSet.has(stall.stallCode) || selectedSet.has(stall.id);
                        const isBooked = bookedIds.has?.(stall.id) || false;
                        const color = getColor(stall, isSelected, isBooked, mode);
                        const canClick = clickable && !(mode === 'book' && (stall.blocked || isBooked));
                        const isDragging = dragInfo?.code === stall.stallCode;

                        return (
                            <div
                                key={stall.stallCode}
                                onPointerDown={(e) => draggable && handlePointerDown(e, stall)}
                                onClick={() => canClick && !draggable && onStallClick?.(stall)}
                                style={{
                                    position: 'absolute',
                                    left: stall.positionX ?? 0,
                                    top: stall.positionY ?? 0,
                                    width: dim.w, height: dim.h,
                                    background: color.bg,
                                    border: `2px solid ${color.border}`,
                                    borderTop: `4px solid ${color.border}`,
                                    borderRadius: '2px 2px 6px 6px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : canClick ? 'pointer' : 'default',
                                    transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.15s',
                                    boxShadow: isDragging
                                        ? `0 8px 24px rgba(0,0,0,0.2), 0 0 0 3px ${color.border}`
                                        : isSelected ? `0 0 0 3px ${color.border}50` : '0 1px 4px rgba(0,0,0,0.1)',
                                    zIndex: isDragging ? 1000 : isSelected ? 20 : 10,
                                    transform: isDragging ? 'scale(1.08)' : undefined,
                                    opacity: mode === 'book' && (stall.blocked || isBooked) ? 0.5 : 1,
                                }}
                            >
                                <span style={{ fontSize: 10, fontWeight: 700, color: color.text, lineHeight: 1, pointerEvents: 'none' }}>{stall.stallCode}</span>
                                {stall.price != null && <span style={{ fontSize: 8, color: color.text, opacity: 0.7, pointerEvents: 'none' }}>Rs.{stall.price}</span>}
                                {stall.blocked && <span style={{ fontSize: 9, pointerEvents: 'none' }}>🔒</span>}
                                {isSelected && !stall.blocked && <span style={{ fontSize: 9, pointerEvents: 'none' }}>✓</span>}
                                {stall.bookedBy && !stall.blocked && !isSelected && <span style={{ fontSize: 9, pointerEvents: 'none' }}>👤</span>}

                                {(isDragging || isSelected) && (
                                    <div style={{
                                        position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)',
                                        background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '2px 6px', borderRadius: 4,
                                        fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 2000
                                    }}>
                                        {(() => {
                                            const l = toLogicalCoordinates(stall.positionX, stall.positionY);
                                            return `${l.x}, ${l.y}`;
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div style={{ position: 'absolute', bottom: 12, left: 14, background: '#c62828', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 12px', borderRadius: 12, letterSpacing: 1, zIndex: 40 }}>
                        🚪 EMERGENCY
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, right: 14, background: '#c62828', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 12px', borderRadius: 12, letterSpacing: 1, zIndex: 40 }}>
                        EMERGENCY 🚪
                    </div>

                    <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: '#37474f', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 26px', borderRadius: 20, letterSpacing: 2, zIndex: 50 }}>
                        ▲ EXIT ▲
                    </div>
                </div>
            </div>

            {draggable && (
                <div style={{
                    position: 'fixed', bottom: 20, right: 20, width: 220,
                    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                    border: '1px solid #e0e0e0', borderRadius: 12, padding: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 3000,
                    fontSize: 12, fontFamily: 'monospace'
                }}>
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 6, marginBottom: 6, color: '#333' }}>
                        📍 Spatial Coordinates
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#666' }}>X Range:</span>
                        <span style={{ fontWeight: 'bold', color: '#1976d2' }}>-20 to +20</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#666' }}>Y Range:</span>
                        <span style={{ fontWeight: 'bold', color: '#1976d2' }}>0 to 15</span>
                    </div>
                    {dragInfo ? (
                        <div style={{ background: '#e3f2fd', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#0277bd' }}>
                                Dragging: {stalls.find(s => s.stallCode === dragInfo.code)?.stallCode}
                            </div>
                            {(() => {
                                const s = stalls.find(s => s.stallCode === dragInfo.code);
                                if (!s) return null;
                                const l = toLogicalCoordinates(s.positionX, s.positionY);
                                return <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>({l.x}, {l.y})</div>;
                            })()}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: 8 }}>
                            Drag a stall to see real-time coordinates
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}