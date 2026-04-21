import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../components';
import { Header } from '../../components';
import apiClient from '../../utils/apiClient';
import { notifyError, notifySuccess, notifyWarning } from '../../utils/toast';

/**
 * Change Password Page
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      notifyWarning('All fields are required');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      notifyWarning('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password must match');
      notifyWarning('New password and confirm password must match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess('Password changed successfully');
      notifySuccess('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header title="Ethereal Ledger" />

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">Change Password</h1>
          <p className="text-body-md text-on-surface-variant">Update your account password securely.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              fullWidth
              icon="lock"
            />

            <Input
              type="password"
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              fullWidth
              icon="lock"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              icon="lock"
            />

            {error && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-label-md">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-lg">
                <p className="text-on-surface text-label-md">{success}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                Back
              </Button>
              <Button variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
