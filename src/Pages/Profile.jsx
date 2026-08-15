import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from '../Components/Navbar.jsx';
import { UserProfileModal } from '../Components/UserProfileModal.jsx';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import '../Styles/Profile.css';

export const Profile = () => {
    const { refreshProfile } = useContext(MusicPlayerContext);
    const [profData, setProfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'likes' | 'settings'
    const [activeUserId, setActiveUserId] = useState(null);

    // Password change state
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });
    const [updatingPass, setUpdatingPass] = useState(false);

    const fetchMyProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/auth/prof');
            setProfData(res.data);
            if (refreshProfile) refreshProfile();
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    }, [refreshProfile]);

    useEffect(() => {
        fetchMyProfile();
    }, [fetchMyProfile]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPassMsg({ type: '', text: '' });

        if (!oldPass || !newPass) {
            setPassMsg({ type: 'danger', text: 'Please fill in both password fields.' });
            return;
        }
        if (newPass.length < 8) {
            setPassMsg({ type: 'danger', text: 'New password must be at least 8 characters long.' });
            return;
        }

        setUpdatingPass(true);
        try {
            await axios.patch('/auth/up', { oldpass: oldPass, newpass: newPass });
            setPassMsg({ type: 'success', text: 'Password updated successfully!' });
            setOldPass('');
            setNewPass('');
        } catch (err) {
            console.error('Update password error:', err);
            setPassMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to update password. Check old password.',
            });
        } finally {
            setUpdatingPass(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirm1 = window.confirm('WARNING: Are you sure you want to delete your account? This action is permanent!');
        if (!confirm1) return;
        const confirm2 = window.confirm('Please confirm again: Delete account and all associated data?');
        if (!confirm2) return;

        try {
            await axios.delete('/auth/del');
            alert('Your account has been deleted.');
            handleLogout();
        } catch (err) {
            console.error('Delete account error:', err);
            alert(err.response?.data?.message || 'Failed to delete account.');
        }
    };

    return (
        <div className="overflow-x-hidden min-vh-100 bg-dark">
            <Navbar onUserClick={(uid) => setActiveUserId(uid)} />

            <div className="profile-page-container">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : !profData ? (
                    <div className="alert alert-danger text-center my-5">Failed to load profile details.</div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <div className="profile-header-card">
                            <div className="profile-big-avatar">
                                {(profData.userid || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="fw-bold mb-1 text-info">@{profData.userid}</h1>
                                <h4 className="text-light text-opacity-85 mb-2">{profData.name}</h4>
                                <p className="text-light text-opacity-50 mb-0">📧 {profData.email}</p>
                            </div>
                            <button className="logout-header-btn" onClick={handleLogout}>
                                ➔ Logout
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="profile-tab-nav">
                            <button
                                className={`profile-tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
                                onClick={() => setActiveTab('uploads')}
                            >
                                🎵 My Uploads ({Array.isArray(profData.musics) ? profData.musics.length : 0})
                            </button>
                            <button
                                className={`profile-tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('likes')}
                            >
                                ❤️ Liked Tracks ({Array.isArray(profData.likes) ? profData.likes.length : 0})
                            </button>
                            <button
                                className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Account Settings
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'uploads' && (
                            <div>
                                <h4 className="text-info mb-3">My Uploaded Music IDs</h4>
                                {Array.isArray(profData.musics) && profData.musics.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3">
                                        {profData.musics.map((mId, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-dark border border-info border-opacity-50 rounded-3 d-flex align-items-center justify-content-between"
                                                style={{ minWidth: '250px' }}
                                            >
                                                <div>
                                                    <span className="badge bg-info text-dark mb-1">Track #{idx + 1}</span>
                                                    <h6 className="mb-0 text-light font-monospace" style={{ fontSize: '0.85rem' }}>
                                                        ID: {mId}
                                                    </h6>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 bg-dark rounded-3 border border-secondary border-opacity-25">
                                        <h5>No tracks uploaded yet</h5>
                                        <p className="text-light text-opacity-50">Go to Home page and hit "Upload Track"!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div>
                                <h4 className="text-info mb-3">My Liked Track IDs</h4>
                                {Array.isArray(profData.likes) && profData.likes.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3">
                                        {profData.likes.map((mId, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-dark border border-danger border-opacity-50 rounded-3 d-flex align-items-center justify-content-between"
                                                style={{ minWidth: '250px' }}
                                            >
                                                <div>
                                                    <span className="badge bg-danger text-light mb-1">❤️ Liked</span>
                                                    <h6 className="mb-0 text-light font-monospace" style={{ fontSize: '0.85rem' }}>
                                                        ID: {mId}
                                                    </h6>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 bg-dark rounded-3 border border-secondary border-opacity-25">
                                        <h5>No liked tracks yet</h5>
                                        <p className="text-light text-opacity-50">Explore the Feed and click the heart on songs you love!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div>
                                {/* Password Change Form */}
                                <div className="settings-card">
                                    <h4 className="text-info mb-3">🔒 Change Password</h4>
                                    {passMsg.text && (
                                        <div className={`alert alert-${passMsg.type} py-2`} role="alert">
                                            {passMsg.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleUpdatePassword}>
                                        <div className="mb-3">
                                            <label className="form-label text-light">Current Password</label>
                                            <input
                                                type="password"
                                                className="form-control bg-dark text-light border-info border-opacity-50"
                                                placeholder="Enter old password"
                                                value={oldPass}
                                                onChange={(e) => setOldPass(e.target.value)}
                                                disabled={updatingPass}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label text-light">New Password (min 8 chars)</label>
                                            <input
                                                type="password"
                                                className="form-control bg-dark text-light border-info border-opacity-50"
                                                placeholder="Enter new password"
                                                value={newPass}
                                                onChange={(e) => setNewPass(e.target.value)}
                                                disabled={updatingPass}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-info fw-bold px-4" disabled={updatingPass}>
                                            {updatingPass ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>

                                {/* Danger Zone */}
                                <div className="danger-zone-card">
                                    <h4 className="text-danger mb-2">⚠️ Danger Zone</h4>
                                    <p className="text-light text-opacity-75 mb-3">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <button className="delete-account-btn" onClick={handleDeleteAccount}>
                                        🗑️ Delete Account Permanently
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeUserId && (
                <UserProfileModal
                    userId={activeUserId}
                    onClose={() => setActiveUserId(null)}
                    onUserClick={(uid) => setActiveUserId(uid)}
                />
            )}
        </div>
    );
};

export default Profile;