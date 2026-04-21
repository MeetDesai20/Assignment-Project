import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '../utils/apiClient';

/**
 * User Context
 * Manages user-specific data and settings
 */
const UserContext = createContext();

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users/profile');
      const profile = unwrap(response);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/subscriptions/current');
      const currentSubscription = unwrap(response);
      setSubscription(currentSubscription);
      return currentSubscription;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/scores');
      const fetchedScores = unwrap(response) || [];
      setScores(fetchedScores);
      return fetchedScores;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addScore = useCallback(
    async (scoreData) => {
      try {
        const response = await apiClient.post('/scores', scoreData);
        const createdScore = unwrap(response);
        setScores([createdScore, ...scores].slice(0, 5));
        return createdScore;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [scores]
  );

  const updateScore = useCallback(
    async (scoreId, scoreData) => {
      try {
        const response = await apiClient.put(`/scores/${scoreId}`, scoreData);
        const updatedScore = unwrap(response);
        setScores(scores.map((s) => (s.id === scoreId ? updatedScore : s)));
        return updatedScore;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [scores]
  );

  const deleteScore = useCallback(
    async (scoreId) => {
      try {
        await apiClient.delete(`/scores/${scoreId}`);
        setScores(scores.filter((s) => s.id !== scoreId));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [scores]
  );

  const selectCharity = useCallback(async (charityId, percentage = 10) => {
    try {
      const response = await apiClient.post('/charities/select', {
        charityId,
        percentage,
      });
      const selectedCharity = unwrap(response);
      setCharity(selectedCharity?.charity || selectedCharity);
      return selectedCharity;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchCurrentCharity = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/charities/current');
      const selection = unwrap(response);
      const normalizedCharity = selection?.charity || null;
      setCharity(normalizedCharity);
      return normalizedCharity;
    } catch (err) {
      setError(err.message);
      setCharity(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    userProfile,
    subscription,
    scores,
    charity,
    loading,
    error,
    fetchUserProfile,
    fetchSubscription,
    fetchScores,
    fetchCurrentCharity,
    addScore,
    updateScore,
    deleteScore,
    selectCharity,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
