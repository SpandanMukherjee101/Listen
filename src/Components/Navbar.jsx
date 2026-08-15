import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import profIcon from '../prof-icon.png';
import '../Styles/Navbar.css';

export const Navbar = ({ className = '', onUserClick }) => {
    const { playTrack } = useContext(MusicPlayerContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [songResults, setSongResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSongResults([]);
            setUserResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setShowDropdown(true);
            try {
                // Search songs
                const songRes = await axios.get(`/auth/musics/search/${encodeURIComponent(searchQuery.trim())}`).catch(() => ({ data: [] }));
                setSongResults(Array.isArray(songRes.data) ? songRes.data : []);

                // Search user by exact or partial ID
                const userRes = await axios.get(`/auth/follow/search/${encodeURIComponent(searchQuery.trim())}`).catch(() => ({ data: null }));
                if (userRes.data && userRes.data.name) {
                    setUserResults([{ uid: searchQuery.trim(), ...userRes.data }]);
                } else {
                    setUserResults([]);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSongClick = (song) => {
        playTrack(song);
        setShowDropdown(false);
        setSearchQuery('');
    };

    const handleUserClickItem = (uid) => {
        if (onUserClick) onUserClick(uid);
        setShowDropdown(false);
        setSearchQuery('');
    };

    return (
        <nav className={`navbar navbar-expand-lg ${className}`.trim()}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="navbar-brand d-flex">
                    <Link className="text-decoration-none l" to="/">
                        <h1>
                            <span className="sqz">𝄞</span>
                            Listen
                            <span className="sqzRev">𝄞</span>
                        </h1>
                    </Link>
                </div>

                <div className="input-group w-50 position-relative" ref={dropdownRef}>
                    <input
                        className="form-control border border-info"
                        id="searchBox"
                        type="text"
                        placeholder="Search song title or exact artist ID..."
                        aria-label="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (songResults.length > 0 || userResults.length > 0) setShowDropdown(true);
                        }}
                    />
                    <button className="btn btn-outline-info" type="button" onClick={() => setShowDropdown((prev) => !prev)}>
                        🔍
                    </button>

                    {showDropdown && (
                        <div className="search-dropdown-menu">
                            {loading ? (
                                <div className="text-center py-3 text-info">
                                    <span className="spinner-border spinner-border-sm me-2"></span> Searching...
                                </div>
                            ) : songResults.length === 0 && userResults.length === 0 ? (
                                <div className="text-center py-3 text-light text-opacity-50">No results found for "{searchQuery}"</div>
                            ) : (
                                <>
                                    {userResults.length > 0 && (
                                        <>
                                            <div className="px-3 py-1 bg-dark text-info fw-bold" style={{ fontSize: '0.75rem' }}>
                                                ARTIST / USER
                                            </div>
                                            {userResults.map((u, idx) => (
                                                <div
                                                    key={`u-${idx}`}
                                                    className="search-result-item"
                                                    onClick={() => handleUserClickItem(u.uid)}
                                                >
                                                    <div>
                                                        <h6 className="search-result-title">@{u.uid}</h6>
                                                        <span className="search-result-subtitle">{u.name || 'Artist'}</span>
                                                    </div>
                                                    <span className="badge bg-info text-dark">View Profile &rarr;</span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {songResults.length > 0 && (
                                        <>
                                            <div className="px-3 py-1 bg-dark text-info fw-bold" style={{ fontSize: '0.75rem' }}>
                                                SONGS
                                            </div>
                                            {songResults.map((song) => (
                                                <div
                                                    key={song._id}
                                                    className="search-result-item"
                                                    onClick={() => handleSongClick(song)}
                                                >
                                                    <div>
                                                        <h6 className="search-result-title">🎵 {song.info}</h6>
                                                        <span className="search-result-subtitle">By @{song.user}</span>
                                                    </div>
                                                    <span className="badge bg-success text-dark">▶ Play</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <Link to="/profile" title="My Profile">
                    <img src={profIcon} alt="Profile-Icon" />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;