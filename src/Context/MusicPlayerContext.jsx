import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config.js';

export const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(-1);
    
    // User profile and likes state
    const [currentUser, setCurrentUser] = useState(null);
    const [userLikedTracks, setUserLikedTracks] = useState(new Set());

    const audioRef = useRef(new Audio());

    // Fetch logged-in user profile and liked tracks on mount
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get('/auth/prof');
            setCurrentUser(res.data);
            if (res.data?.likes && Array.isArray(res.data.likes)) {
                setUserLikedTracks(new Set(res.data.likes));
            }
        } catch (err) {
            console.error('Failed to fetch user profile in context:', err);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Audio element event listeners
    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime || 0);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            // Automatically play next track if available
            if (queueIndex < queue.length - 1) {
                const nextIdx = queueIndex + 1;
                setQueueIndex(nextIdx);
                playTrackDirect(queue[nextIdx]);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [queue, queueIndex, volume]);

    const playTrackDirect = (track) => {
        if (!track) return;
        const token = localStorage.getItem('token') || '';
        const streamUrl = `${BACKEND_URL}/auth/musics/stream/${track._id}?token=${encodeURIComponent(token)}`;
        
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
            console.error('Playback error:', err);
            setIsPlaying(false);
        });
        setCurrentTrack(track);
        setIsPlaying(true);

        // Notify play endpoint to fetch details/record playback
        axios.get(`/auth/musics/play/${track._id}`).catch((err) => {
            console.error('Failed to notify play endpoint:', err);
        });
    };

    const playTrack = (track, newQueue = null) => {
        if (newQueue && Array.isArray(newQueue)) {
            setQueue(newQueue);
            const idx = newQueue.findIndex((item) => item._id === track._id);
            setQueueIndex(idx !== -1 ? idx : 0);
        } else if (!queue.some((item) => item._id === track._id)) {
            setQueue((prev) => [...prev, track]);
            setQueueIndex(queue.length);
        } else {
            const idx = queue.findIndex((item) => item._id === track._id);
            setQueueIndex(idx);
        }
        playTrackDirect(track);
    };

    const addToQueue = (track) => {
        if (!track) return;
        setQueue((prev) => {
            if (prev.some((item) => item._id === track._id)) return prev;
            return [...prev, track];
        });
        alert('Added to queue');
    };

    const togglePlay = () => {
        if (!currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((err) => console.error('Play error:', err));
        }
    };

    const seek = (time) => {
        if (!audioRef.current || isNaN(time)) return;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const setVolume = (vol) => {
        const clamped = Math.max(0, Math.min(1, vol));
        setVolumeState(clamped);
        if (audioRef.current) {
            audioRef.current.volume = clamped;
        }
    };

    const nextTrack = () => {
        if (queueIndex < queue.length - 1) {
            const nextIdx = queueIndex + 1;
            setQueueIndex(nextIdx);
            playTrackDirect(queue[nextIdx]);
        }
    };

    const prevTrack = () => {
        if (currentTime > 3) {
            seek(0);
        } else if (queueIndex > 0) {
            const prevIdx = queueIndex - 1;
            setQueueIndex(prevIdx);
            playTrackDirect(queue[prevIdx]);
        }
    };

    // Like and Unlike functionality
    const toggleLike = async (trackId, currentLikesCount, onCountChange) => {
        const isLiked = userLikedTracks.has(trackId);
        try {
            if (isLiked) {
                const res = await axios.patch('/auth/musics/unlike', { id: trackId });
                setUserLikedTracks((prev) => {
                    const next = new Set(prev);
                    next.delete(trackId);
                    return next;
                });
                if (onCountChange) onCountChange(res.data?.likes ?? Math.max(0, currentLikesCount - 1));
            } else {
                const res = await axios.patch('/auth/musics/like', { id: trackId });
                setUserLikedTracks((prev) => {
                    const next = new Set(prev);
                    next.add(trackId);
                    return next;
                });
                if (onCountChange) onCountChange(res.data?.likes ?? currentLikesCount + 1);
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);
            alert(err.response?.data?.message || 'Error updating like status');
        }
    };

    return (
        <MusicPlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                currentTime,
                duration,
                volume,
                queue,
                queueIndex,
                currentUser,
                userLikedTracks,
                playTrack,
                togglePlay,
                seek,
                setVolume,
                nextTrack,
                prevTrack,
                addToQueue,
                toggleLike,
                refreshProfile: fetchUserProfile,
            }}
        >
            {children}
        </MusicPlayerContext.Provider>
    );
};

export default MusicPlayerContext;
