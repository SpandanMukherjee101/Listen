import React, { useContext } from 'react';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import '../Styles/MusicPlayerBar.css';

export const MusicPlayerBar = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        seek,
        setVolume,
        nextTrack,
        prevTrack,
        toggleLike,
        userLikedTracks,
    } = useContext(MusicPlayerContext);

    if (!currentTrack) return null;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const isLiked = userLikedTracks.has(currentTrack._id);

    return (
        <div className="player-bar d-flex align-items-center justify-content-between">
            {/* Track info & Like */}
            <div className="player-left d-flex align-items-center">
                <div className="me-3">
                    <h6 className="track-info-title">{currentTrack.info || 'Unknown Track'}</h6>
                    <div className="d-flex align-items-center mt-1">
                        <small className="text-light me-2" style={{ fontSize: '0.75rem' }}>
                            @{currentTrack.user || 'author'}
                        </small>
                        {Array.isArray(currentTrack.genre) &&
                            currentTrack.genre.slice(0, 2).map((g, idx) => (
                                <span key={idx} className="track-genre-badge">
                                    {g}
                                </span>
                            ))}
                    </div>
                </div>
                <button
                    className="like-btn"
                    onClick={() => toggleLike(currentTrack._id, currentTrack.likes?.length || 0)}
                    title={isLiked ? 'Unlike' : 'Like'}
                >
                    {isLiked ? '❤️' : '🤍'}
                </button>
            </div>

            {/* Controls & Seek Bar */}
            <div className="player-center d-flex flex-column align-items-center justify-content-center">
                <div className="d-flex align-items-center mb-1">
                    <button className="player-btn" onClick={prevTrack} title="Previous">
                        ⏮
                    </button>
                    <button className="player-btn play-pause-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button className="player-btn" onClick={nextTrack} title="Next">
                        ⏭
                    </button>
                </div>
                <div className="d-flex align-items-center w-100 px-3">
                    <span className="time-display">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        className="seek-slider mx-2"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => seek(Number(e.target.value))}
                    />
                    <span className="time-display">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume */}
            <div className="player-right d-flex align-items-center justify-content-end">
                <span className="me-2" style={{ fontSize: '1.2rem' }}>
                    {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </span>
                <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

export default MusicPlayerBar;
