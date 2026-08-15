import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/UploadModal.css';

const UPLOAD_GENRES = ['pop', 'rock', 'edm', 'classical', 'blue', 'jazz', 'metal', 'hiphop', 'indie'];

export const UploadModal = ({ onClose, onSuccess }) => {
    const [info, setInfo] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const toggleGenre = (g) => {
        if (selectedGenres.includes(g)) {
            setSelectedGenres((prev) => prev.filter((item) => item !== g));
        } else {
            setSelectedGenres((prev) => [...prev, g]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!info.trim()) {
            setError('Please provide a track title or info.');
            return;
        }
        if (selectedGenres.length === 0) {
            setError('Please select at least one genre.');
            return;
        }
        if (!file) {
            setError('Please select an audio file to upload.');
            return;
        }

        // Check for Vercel 4.5MB serverless payload limit
        const maxVercelBytes = 4.2 * 1024 * 1024; // ~4.2 MB safe margin
        if (file.size > maxVercelBytes) {
            setError(
                `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 4.2 MB! Vercel serverless functions reject payloads over 4.5 MB with HTTP 413 (Content Too Large). Please choose a smaller audio file under 4 MB.`
            );
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('info', info.trim());
        formData.append('genre', JSON.stringify(selectedGenres));

        setUploading(true);
        try {
            const res = await axios.post('/auth/musics/upload', formData);
            setUploading(false);
            if (onSuccess) onSuccess(res.data);
            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            const isTooLarge = err.response?.status === 413 || err.message?.includes('Network Error');
            if (isTooLarge && file.size > 3.5 * 1024 * 1024) {
                setError('Upload rejected (HTTP 413 Content Too Large / CORS blocked by Vercel). Your file exceeds Vercel serverless function payload limits.');
            } else {
                setError(err.response?.data?.message || 'Failed to upload music. Please check your network connection and try again.');
            }
            setUploading(false);
        }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h3 className="modal-title-custom">🎵 Upload New Track</h3>
                    <button className="close-modal-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-info fw-bold">Track Title / Info *</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-light border-info border-opacity-50"
                            placeholder="e.g. Midnight Chill Beats"
                            value={info}
                            onChange={(e) => setInfo(e.target.value)}
                            disabled={uploading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-info fw-bold">Select Genres (at least 1) *</label>
                        <div className="genre-checkbox-grid">
                            {UPLOAD_GENRES.map((g) => {
                                const isSelected = selectedGenres.includes(g);
                                return (
                                    <span
                                        key={g}
                                        className={`genre-check-pill ${isSelected ? 'selected' : ''}`}
                                        onClick={() => !uploading && toggleGenre(g)}
                                    >
                                        {isSelected ? '✓ ' : '+ '}
                                        {g}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-info fw-bold">Audio File (MP3, WAV, etc.) *</label>
                        <label className={`file-drop-zone d-block ${file ? 'has-file' : ''}`}>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="d-none"
                                disabled={uploading}
                            />
                            {file ? (
                                <div>
                                    <h6 className="text-success mb-1">✓ {file.name}</h6>
                                    <small className="text-light text-opacity-75">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB - Click to change file
                                    </small>
                                </div>
                            ) : (
                                <div>
                                    <h5 className="text-info mb-1">📁 Choose Audio File</h5>
                                    <small className="text-light text-opacity-75">Click or drag and drop your track here</small>
                                </div>
                            )}
                        </label>
                    </div>

                    <button type="submit" className="submit-upload-btn" disabled={uploading}>
                        {uploading ? (
                            <span>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Uploading to Cloud...
                            </span>
                        ) : (
                            '🚀 Publish Music'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
