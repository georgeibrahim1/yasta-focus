import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';

export const useRoomSession = (roomCode, communityId, isInRoom, userId) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [mySession, setMySession] = useState(null);

  useEffect(() => {
    if (!isInRoom || !roomCode || !communityId) return;

    // Listen for room state (initial data)
    const handleRoomState = ({ activeSessions: sessions }) => {
      setActiveSessions(sessions || []);
      const userSession = sessions?.find(s => s.user_id === userId);
      if (userSession) {
        setMySession(userSession);
      }
    };

    // Listen for session started
    const handleSessionStarted = (session) => {
      setActiveSessions((prev) => [...prev, session]);
      if (session.userId === userId) {
        setMySession(session);
      }
    };

    // Listen for session updates
    const handleSessionUpdated = ({ sessionName, userId: updatedUserId, elapsedTime }) => {
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.sessionName === sessionName ? { ...s, elapsedTime } : s
        )
      );
      if (updatedUserId === userId) {
        setMySession((prev) => prev ? { ...prev, elapsedTime } : null);
      }
    };

    // Listen for session paused
    const handleSessionPaused = ({ sessionName, userId: pausedUserId }) => {
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.sessionName === sessionName ? { ...s, status: 'paused' } : s
        )
      );
      if (pausedUserId === userId) {
        setMySession((prev) => prev ? { ...prev, status: 'paused' } : null);
      }
    };

    // Listen for session resumed
    const handleSessionResumed = ({ sessionName, userId: resumedUserId }) => {
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.sessionName === sessionName ? { ...s, status: 'active' } : s
        )
      );
      if (resumedUserId === userId) {
        setMySession((prev) => prev ? { ...prev, status: 'active' } : null);
      }
    };

    // Listen for session ended
    const handleSessionEnded = ({ sessionName, userId: endedUserId }) => {
      setActiveSessions((prev) =>
        prev.filter((s) => s.sessionName !== sessionName)
      );
      if (endedUserId === userId) {
        setMySession(null);
      }
    };

    socketService.on('room_state', handleRoomState);
    socketService.on('session_started', handleSessionStarted);
    socketService.on('session_updated', handleSessionUpdated);
    socketService.on('session_paused', handleSessionPaused);
    socketService.on('session_resumed', handleSessionResumed);
    socketService.on('session_ended', handleSessionEnded);

    return () => {
      socketService.off('room_state', handleRoomState);
      socketService.off('session_started', handleSessionStarted);
      socketService.off('session_updated', handleSessionUpdated);
      socketService.off('session_paused', handleSessionPaused);
      socketService.off('session_resumed', handleSessionResumed);
      socketService.off('session_ended', handleSessionEnded);
    };
  }, [roomCode, communityId, isInRoom, userId]);

  const startSession = useCallback((subjectName, taskTitle = null) => {
    socketService.startSession(parseInt(roomCode), communityId, subjectName, taskTitle);
  }, [roomCode, communityId]);

  const updateSession = useCallback((sessionName, elapsedTime) => {
    socketService.updateSession(sessionName, elapsedTime);
  }, []);

  const pauseSession = useCallback((sessionName) => {
    socketService.pauseSession(sessionName);
  }, []);

  const resumeSession = useCallback((sessionName) => {
    socketService.resumeSession(sessionName);
  }, []);

  const endSession = useCallback((sessionName, elapsedTime) => {
    socketService.endSession(sessionName, elapsedTime);
    setMySession(null);
  }, []);

  return {
    activeSessions,
    mySession,
    startSession,
    updateSession,
    pauseSession,
    resumeSession,
    endSession
  };
};
