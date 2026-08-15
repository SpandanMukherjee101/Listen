import React, { useState } from 'react';
import { Navbar } from '../Components/Navbar.jsx';
import { Feed } from '../Components/Feed.jsx';
import { UploadModal } from '../Components/UploadModal.jsx';
import { CommentsModal } from '../Components/CommentsModal.jsx';
import { UserProfileModal } from '../Components/UserProfileModal.jsx';

export const Home = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeCommentTrack, setActiveCommentTrack] = useState(null); // { id, title }
    const [activeUserId, setActiveUserId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleOpenComments = (trackId, trackTitle) => {
        setActiveCommentTrack({ id: trackId, title: trackTitle });
    };

    const handleUserClick = (uid) => {
        if (uid) setActiveUserId(uid);
    };

    return (
        <div className="overflow-x-hidden min-vh-100 bg-dark">
            <Navbar onUserClick={handleUserClick} />

            <main>
                <Feed
                    onOpenUpload={() => setShowUploadModal(true)}
                    onUserClick={handleUserClick}
                    onCommentClick={handleOpenComments}
                    refreshTrigger={refreshTrigger}
                />
            </main>

            {/* Modals */}
            {showUploadModal && (
                <UploadModal onClose={() => setShowUploadModal(false)} onSuccess={handleUploadSuccess} />
            )}

            {activeCommentTrack && (
                <CommentsModal
                    musicId={activeCommentTrack.id}
                    musicTitle={activeCommentTrack.title}
                    onClose={() => setActiveCommentTrack(null)}
                    onUserClick={handleUserClick}
                />
            )}

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

export default Home;