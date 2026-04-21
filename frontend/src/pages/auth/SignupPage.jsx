import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components';
import { validateEmail } from '../../utils/helpers';

/**
 * Signup Page
 * User registration form
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    const result = await signup(formData.email, formData.password, formData.fullName);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormErrors({ form: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-sm font-headline font-bold text-on-surface mb-2">
            Join the Movement
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Track golf, win prizes, support charity
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <Input
              type="text"
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={formErrors.fullName}
              fullWidth
              icon="person"
            />

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

            {/* Confirm Password Input */}
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-low text-on-surface-variant">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link to="/login">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
              >
                Sign In
              </Button>
            </Link>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-label-sm text-on-surface-variant mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
