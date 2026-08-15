import React, { useContext, useState } from 'react';
import axios from 'axios';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import '../Styles/MusicCard.css';

export const MusicCard = ({ track, queue = [], onUserClick, onCommentClick, onDeleteSuccess }) => {
    const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, userLikedTracks, currentUser, addToQueue } =
        useContext(MusicPlayerContext);

    const [likesCount, setLikesCount] = useState(
        Array.isArray(track?.likes) ? track.likes.length : typeof track?.likes === 'number' ? track.likes : 0
    );

    if (!track) return null;

    const isCurrent = currentTrack && currentTrack._id === track._id;
    const isLiked = userLikedTracks.has(track._id);
    const isOwner = currentUser && (currentUser.userid === track.user || currentUser._id === track.user);

    const handlePlayClick = () => {
        if (isCurrent) {
            togglePlay();
        } else {
            playTrack(track, queue);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${track.info}"?`)) return;
        try {
            await axios.delete('/auth/musics/delete', { data: { id: track._id } });
            if (onDeleteSuccess) onDeleteSuccess(track._id);
        } catch (err) {
            console.error('Failed to delete track:', err);
            alert(err.response?.data?.message || 'Failed to delete track');
        }
    };

    const commentsCount = Array.isArray(track?.comments) ? track.comments.length : track?.comments || 0;

    return (
        <div className="music-card">
            <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="music-card-title">{track.info || 'Untitled Music'}</h5>
                    {isOwner && (
                        <button className="delete-track-btn" onClick={handleDelete} title="Delete your track">
                            🗑️
                        </button>
                    )}
                </div>
                <div className="mb-3">
                    <span className="text-light me-1" style={{ fontSize: '0.85rem' }}>
                        By
                    </span>
                    <span
                        className="author-link"
                        onClick={() => onUserClick && onUserClick(track.user)}
                        title={`View @${track.user}'s profile`}
                    >
                        @{track.user || 'author'}
                    </span>
                </div>
                <div className="mb-3">
                    {Array.isArray(track.genre) &&
                        track.genre.map((g, idx) => (
                            <span key={idx} className="genre-pill">
                                {g}
                            </span>
                        ))}
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                    <button
                        className={`card-action-btn ${isCurrent && isPlaying ? 'active-play' : ''}`}
                        onClick={handlePlayClick}
                    >
                        <span>{isCurrent && isPlaying ? '⏸' : '▶'}</span>
                        <span>{isCurrent && isPlaying ? 'Playing' : 'Play'}</span>
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => addToQueue(track)}
                        title="Add to queue"
                        style={{ fontSize: '1.2rem', padding: '0 8px' }}
                    >
                        <span>➕</span>
                    </button>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button
                        className="icon-btn"
                        onClick={() => toggleLike(track._id, likesCount, setLikesCount)}
                        title={isLiked ? 'Unlike' : 'Like'}
                    >
                        <span>{isLiked ? '❤️' : '🤍'}</span>
                        <span style={{ fontSize: '0.9rem', color: isLiked ? '#ff4d4d' : '#fff' }}>{likesCount}</span>
                    </button>

                    <button
                        className="icon-btn"
                        onClick={() => onCommentClick && onCommentClick(track._id, track.info)}
                        title="Comments"
                    >
                        <span>💬</span>
                        <span style={{ fontSize: '0.9rem' }}>{commentsCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MusicCard;
