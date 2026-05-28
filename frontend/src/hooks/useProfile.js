import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import useRequireAuth from '@/hooks/useRequireAuth';
import { toast } from 'sonner';
import useAuth from '@/contexts/AuthContext';
import { normalizeUser } from '@/utils/userProfile';

const hasProfileChanged = (currentUser, nextUser) => {
  const current = normalizeUser(currentUser) || {};
  const next = normalizeUser(nextUser) || {};
  const fields = [
    'id',
    'displayName',
    'username',
    'email',
    'avatarUrl',
    'bio',
    'updatedAt',
    'avatarVersion',
  ];

  return fields.some((field) => current[field] !== next[field]);
};

export const useProfile = () => {
  const { ensureAuth, isAuthenticated, requireAuth } = useRequireAuth();
  const { user: authUser, updateAuthUser } = useAuth();

  const [user, setUser] = useState(() => normalizeUser(authUser));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated) {
        requireAuth();
        setLoading(false);
        return;
      }

      try {
        ensureAuth();
        const data = normalizeUser(await userService.getCurrentUser(), authUser);
        setUser(data);
        if (hasProfileChanged(authUser, data)) {
          updateAuthUser(data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [ensureAuth, isAuthenticated, requireAuth]);

  // Cập nhật profile
  const updateProfile = async (newData) => {
    setSaving(true);
    try {
      ensureAuth();
      const updatedUser = normalizeUser(
        {
          ...(await userService.updateProfile(newData)),
          avatarVersion: Date.now(),
        },
        authUser,
      );

      setUser(updatedUser);
      updateAuthUser(updatedUser);
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      toast.success('Cập nhật profile thành công!');
      return updatedUser;
    } catch {
      setMessage({ type: 'error', text: 'Cập nhật thất bại!' });
      toast.error('Cập nhật profile thất bại!');
      throw new Error('Cập nhật profile thất bại!');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return {
    user,
    loading,
    saving,
    message,
    updateProfile
  };
};
