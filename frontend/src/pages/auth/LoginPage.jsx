import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components';
import { validateEmail } from '../../utils/helpers';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin';

/**
 * Login Page
 * Minimalist authentication form with design system styling
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      const destination = isAdminRole(result.user?.role) ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setFormErrors({ form: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-sm font-headline font-bold text-on-surface mb-2">
            Welcome Back
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Sign in to your Ethereal Ledger account
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              fullWidth
              icon="mail"
            />

            {/* Password Input */}
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              fullWidth
              icon="lock"
            />

            {/* Form Error */}
            {formErrors.form && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-label-md">{formErrors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-low text-on-surface-variant">
                  New to Ethereal Ledger?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <Link to="/signup">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
              >
                Create Account
              </Button>
            </Link>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-label-sm text-on-surface-variant mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
