import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MusicCard } from './MusicCard.jsx';
import '../Styles/Feed.css';

const GENRES = ['all', 'pop', 'rock', 'edm', 'classical', 'blue', 'jazz', 'metal', 'hiphop', 'indie', 'liked'];

export const Feed = ({ onOpenUpload, onUserClick, onCommentClick, refreshTrigger = 0 }) => {
    const [activeGenre, setActiveGenre] = useState('all');
    const [page, setPage] = useState(1);
    const [tracks, setTracks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`/auth/feed/${activeGenre}/${page}`);
            // Check response format: for 'all'/genres it returns { data, pages, ... }, for 'liked' it returns { data: [] }
            if (res.data?.data && Array.isArray(res.data.data)) {
                setTracks(res.data.data);
                setTotalPages(res.data?.pages || 1);
            } else if (Array.isArray(res.data)) {
                setTracks(res.data);
                setTotalPages(1);
            } else {
                setTracks([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to load feed:', err);
            setError(err.response?.data?.message || 'Failed to load tracks.');
            setTracks([]);
        } finally {
            setLoading(false);
        }
    }, [activeGenre, page]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed, refreshTrigger]);

    const handleGenreChange = (g) => {
        setActiveGenre(g);
        setPage(1);
    };

    const handleDeleteSuccess = (deletedId) => {
        setTracks((prev) => prev.filter((t) => t._id !== deletedId));
    };

    return (
        <div className="feed-container">
            {/* Header & Upload Button */}
            <div className="feed-header">
                <div>
                    <h2 className="feed-title">𝄞 Discover Music</h2>
                    <p className="text-light text-opacity-75 mb-0">Explore top tracks from artists around the world</p>
                </div>
                {onOpenUpload && (
                    <button className="upload-fab-btn" onClick={onOpenUpload}>
                        <span>+</span> Upload Track
                    </button>
                )}
            </div>

            {/* Genre Filter Bar */}
            <div className="genre-filter-bar">
                {GENRES.map((g) => (
                    <button
                        key={g}
                        className={`genre-tab-btn ${activeGenre === g ? 'active' : ''}`}
                        onClick={() => handleGenreChange(g)}
                    >
                        {g === 'liked' ? '❤️ Liked' : g}
                    </button>
                ))}
            </div>

            {/* Feed State handling */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-info">Loading beats...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger text-center my-4" role="alert">
                    {error}
                </div>
            ) : tracks.length === 0 ? (
                <div className="empty-feed-state">
                    <h4>No music found in "{activeGenre}"</h4>
                    <p className="text-light text-opacity-75">Be the first to upload a track to this genre!</p>
                    {onOpenUpload && (
                        <button className="upload-fab-btn mx-auto mt-3" onClick={onOpenUpload}>
                            Upload Track
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Track Grid */}
                    <div className="row g-4">
                        {tracks.map((track) => (
                            <div key={track._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                <MusicCard
                                    track={track}
                                    queue={tracks}
                                    onUserClick={onUserClick}
                                    onCommentClick={onCommentClick}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← Previous
                            </button>
                            <span className="text-light">
                                Page <strong className="text-info">{page}</strong> of <strong>{totalPages}</strong>
                            </span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Feed;
