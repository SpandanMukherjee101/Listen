import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { MusicPlayerContext } from '../Context/MusicPlayerContext.jsx';
import '../Styles/CommentsModal.css';

export const CommentsModal = ({ musicId, musicTitle, onClose, onUserClick }) => {
    const { currentUser } = useContext(MusicPlayerContext);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [likedComments, setLikedComments] = useState(new Set());

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/auth/comments/get/${musicId}/${page}`);
            if (Array.isArray(res.data)) {
                setComments(res.data);
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                setComments(res.data.data);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [musicId, page]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const res = await axios.post('/auth/comments/create', {
                info: newComment.trim(),
                m_id: musicId,
            });
            setNewComment('');
            if (res.data?.comment) {
                setComments((prev) => [res.data.comment, ...prev]);
            } else {
                fetchComments();
            }
        } catch (err) {
            console.error('Create comment error:', err);
            alert(err.response?.data?.message || 'Failed to post comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (comment) => {
        setEditingId(comment._id);
        setEditText(comment.info || '');
    };

    const handleUpdate = async (id) => {
        if (!editText.trim()) return;
        try {
            await axios.patch('/auth/comments/edit', { id, info: editText.trim() });
            setComments((prev) => prev.map((c) => (c._id === id ? { ...c, info: editText.trim() } : c)));
            setEditingId(null);
        } catch (err) {
            console.error('Update comment error:', err);
            alert(err.response?.data?.message || 'Failed to edit comment.');
        }
    };

    const handleDelete = async (cid) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await axios.delete('/auth/comments/delete', { data: { cid } });
            setComments((prev) => prev.filter((c) => c._id !== cid));
        } catch (err) {
            console.error('Delete comment error:', err);
            alert(err.response?.data?.message || 'Failed to delete comment.');
        }
    };

    const toggleLikeComment = async (comment) => {
        const cid = comment._id;
        const isLiked = likedComments.has(cid) || (Array.isArray(comment.likes) && comment.likes.includes(currentUser?.userid));
        try {
            if (isLiked) {
                await axios.patch('/auth/comments/unlike', { cid });
                setLikedComments((prev) => {
                    const next = new Set(prev);
                    next.delete(cid);
                    return next;
                });
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === cid
                            ? { ...c, likes: Array.isArray(c.likes) ? c.likes.filter((u) => u !== currentUser?.userid && u !== currentUser?._id) : [] }
                            : c
                    )
                );
            } else {
                await axios.patch('/auth/comments/like', { cid });
                setLikedComments((prev) => {
                    const next = new Set(prev);
                    next.add(cid);
                    return next;
                });
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === cid
                            ? { ...c, likes: Array.isArray(c.likes) ? [...c.likes, currentUser?._id] : [currentUser?._id] }
                            : c
                    )
                );
            }
        } catch (err) {
            console.error('Toggle like comment error:', err);
        }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="comments-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <div>
                        <h4 className="modal-title-custom">💬 Comments</h4>
                        <small className="text-light text-opacity-75">For track: "{musicTitle || 'Unknown'}"</small>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="comments-list-container">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-info" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-5 text-light text-opacity-50">
                            <h5>No comments yet</h5>
                            <p>Be the first to share your thoughts on this track!</p>
                        </div>
                    ) : (
                        comments.map((c) => {
                            const isOwner = currentUser && (currentUser.userid === c.user || currentUser._id === c.user);
                            const likesCount = Array.isArray(c.likes) ? c.likes.length : typeof c.likes === 'number' ? c.likes : 0;
                            const isLiked = likedComments.has(c._id) || (Array.isArray(c.likes) && (c.likes.includes(currentUser?._id) || c.likes.includes(currentUser?.userid)));

                            return (
                                <div key={c._id} className="comment-item-card">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span
                                            className="comment-author-name"
                                            onClick={() => onUserClick && onUserClick(c.user)}
                                        >
                                            @{c.user || 'anonymous'}
                                        </span>
                                        <div className="comment-actions">
                                            <button
                                                className="comment-action-btn"
                                                onClick={() => toggleLikeComment(c)}
                                                title={isLiked ? 'Unlike' : 'Like'}
                                            >
                                                <span>{isLiked ? '❤️' : '🤍'}</span> {likesCount > 0 && likesCount}
                                            </button>

                                            {isOwner && (
                                                <>
                                                    <button
                                                        className="comment-action-btn"
                                                        onClick={() => startEdit(c)}
                                                        title="Edit comment"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="comment-action-btn delete-btn"
                                                        onClick={() => handleDelete(c._id)}
                                                        title="Delete comment"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {editingId === c._id ? (
                                        <div className="d-flex gap-2 mt-2">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm bg-dark text-light border-info"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                            />
                                            <button className="btn btn-sm btn-info" onClick={() => handleUpdate(c._id)}>
                                                Save
                                            </button>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="comment-text-body">{c.info}</p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination if needed */}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-25">
                    <button
                        className="btn btn-sm btn-outline-info"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        &larr; Prev Page
                    </button>
                    <span className="text-light text-opacity-75" style={{ fontSize: '0.85rem' }}>
                        Page {page}
                    </span>
                    <button className="btn btn-sm btn-outline-info" onClick={() => setPage((p) => p + 1)}>
                        Next Page &rarr;
                    </button>
                </div>

                {/* Post comment form */}
                <form className="comment-input-form" onSubmit={handleCreate}>
                    <input
                        type="text"
                        className="comment-input-field"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button type="submit" className="comment-submit-btn" disabled={submitting || !newComment.trim()}>
                        {submitting ? '...' : 'Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentsModal;
