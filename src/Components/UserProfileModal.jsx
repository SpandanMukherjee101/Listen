import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import '../Styles/UserProfileModal.css';

export const UserProfileModal = ({ userId, onClose, onUserClick }) => {
    const { currentUser } = useContext(MusicPlayerContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState(null); // 'followers' | 'following' | null

    const fetchProfileAndSocials = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Fetch user basic info
            const res = await axios.get(`/auth/follow/search/${userId}`);
            setProfile(res.data);

            // Fetch followers
            const followersRes = await axios.get(`/auth/follow/followers/${userId}`);
            const followersList = followersRes.data?.userList || [];
            setFollowers(followersList);
            if (currentUser && followersList.includes(currentUser.userid)) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }

            // Fetch following
            const followingRes = await axios.get(`/auth/follow/following/${userId}`);
            setFollowing(followingRes.data?.userList || []);
        } catch (err) {
            console.error('Failed to load user profile:', err);
            setProfile({ name: 'User Not Found', musics: [] });
        } finally {
            setLoading(false);
        }
    }, [userId, currentUser]);

    useEffect(() => {
        fetchProfileAndSocials();
    }, [fetchProfileAndSocials]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await axios.patch(`/auth/follow/unfollow/${userId}`);
                setIsFollowing(false);
                setFollowers((prev) => prev.filter((id) => id !== currentUser?.userid));
            } else {
                await axios.patch(`/auth/follow/follow/${userId}`);
                setIsFollowing(true);
                if (currentUser?.userid) {
                    setFollowers((prev) => [...prev, currentUser.userid]);
                }
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
            alert(err.response?.data?.message || 'Error updating follow status');
        }
    };

    const isSelf = currentUser && currentUser.userid === userId;

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="user-profile-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h4 className="modal-title-custom">👤 Artist Profile</h4>
                    <button className="close-modal-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="d-flex align-items-center gap-4 mb-3">
                            <div className="profile-avatar-placeholder">
                                {(userId || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="user-handle-title">@{profile?.userid || userId}</h2>
                                <h5 className="user-name-subtitle">{profile?.name || 'Music Artist'}</h5>
                                {!isSelf && (
                                    <button
                                        className={`follow-action-btn ${isFollowing ? 'is-following' : ''}`}
                                        onClick={handleFollowToggle}
                                    >
                                        {isFollowing ? '✖ Unfollow' : '+ Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="profile-stats-bar justify-content-around">
                            <div className="stat-item" onClick={() => setActiveTab(activeTab === 'followers' ? null : 'followers')}>
                                <span className="stat-number">{followers.length}</span>
                                <span className="stat-label">Followers {activeTab === 'followers' && '▼'}</span>
                            </div>
                            <div className="stat-item" onClick={() => setActiveTab(activeTab === 'following' ? null : 'following')}>
                                <span className="stat-number">{following.length}</span>
                                <span className="stat-label">Following {activeTab === 'following' && '▼'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{Array.isArray(profile?.musics) ? profile.musics.length : 0}</span>
                                <span className="stat-label">Tracks</span>
                            </div>
                        </div>

                        {/* Expandable Social Lists */}
                        {activeTab === 'followers' && (
                            <div className="user-list-modal mb-3">
                                <h6 className="text-info mb-2">Followers ({followers.length})</h6>
                                {followers.length === 0 ? (
                                    <small className="text-light text-opacity-50">No followers yet.</small>
                                ) : (
                                    followers.map((fId) => (
                                        <div
                                            key={fId}
                                            className="user-list-item"
                                            onClick={() => {
                                                if (onUserClick && fId !== userId) onUserClick(fId);
                                            }}
                                        >
                                            @{fId} {fId === currentUser?.userid && '(You)'}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'following' && (
                            <div className="user-list-modal mb-3">
                                <h6 className="text-info mb-2">Following ({following.length})</h6>
                                {following.length === 0 ? (
                                    <small className="text-light text-opacity-50">Not following anyone yet.</small>
                                ) : (
                                    following.map((fId) => (
                                        <div
                                            key={fId}
                                            className="user-list-item"
                                            onClick={() => {
                                                if (onUserClick && fId !== userId) onUserClick(fId);
                                            }}
                                        >
                                            @{fId} {fId === currentUser?.userid && '(You)'}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* User's Music List */}
                        <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                            <h5 className="text-info mb-3">🎧 Uploaded Track IDs</h5>
                            {Array.isArray(profile?.musics) && profile.musics.length > 0 ? (
                                <div className="d-flex flex-wrap gap-2">
                                    {profile.musics.map((mId, idx) => (
                                        <span key={idx} className="badge bg-dark border border-info text-light p-2">
                                            Track ID: {mId}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-light text-opacity-50">No tracks uploaded yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileModal;
