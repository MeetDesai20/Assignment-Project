import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../../components';
import { Header } from '../../components';
import apiClient from '../../utils/apiClient';
import { useAuth } from '../../context/AuthContext';
import { notifyError, notifyInfo, notifySuccess } from '../../utils/toast';

/**
 * Subscription Purchase Page
 * Required before using score, draw, and charity features
 */
export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const plans = [
    {
      id: 'monthly',
      title: 'Monthly',
      amount: 4999,
      displayAmount: '49.99',
      description: 'Perfect to start and participate every month.',
    },
    {
      id: 'yearly',
      title: 'Yearly',
      amount: 49999,
      displayAmount: '499.99',
      description: 'Best value for committed players and donors.',
    },
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await apiClient.get('/subscriptions/current');
      setCurrentSubscription(response.data?.data ?? null);
    } catch (err) {
      setCurrentSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const startCheckout = async (planType) => {
    setProcessingPlan(planType);
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/subscriptions/checkout', { planType });
      const payload = response.data?.data ?? {};

      if (payload.mock) {
        setMessage('Subscription activated successfully. You can now access all user activities.');
        notifySuccess('Subscription activated successfully');
        await fetchCurrentSubscription();
        navigate('/dashboard', { replace: true });
        return;
      }

      if (payload.shortUrl) {
        notifyInfo('Redirecting to Razorpay checkout');
        window.location.href = payload.shortUrl;
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout');
      }

      const options = {
        key: payload.keyId,
        subscription_id: payload.subscriptionId,
        name: 'Ethereal Ledger',
        description: `${planType === 'monthly' ? 'Monthly' : 'Yearly'} subscription purchase`,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async (responseData) => {
          try {
            await apiClient.post('/subscriptions/verify', {
              razorpayPaymentId: responseData.razorpay_payment_id,
              razorpaySubscriptionId: responseData.razorpay_subscription_id,
              razorpaySignature: responseData.razorpay_signature,
            });
            setMessage('Subscription activated successfully. You can now access all user activities.');
            notifySuccess('Subscription activated successfully');
            await fetchCurrentSubscription();
            navigate('/dashboard', { replace: true });
          } catch (verificationError) {
            const message = verificationError.response?.data?.message || 'Payment was captured, but verification failed';
            setError(message);
            notifyError(message);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(''),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        notifyError('Payment failed. Please try again.');
      });
      razorpay.open();

      setMessage('Checkout created. Complete payment to activate your subscription.');
      notifyInfo('Checkout created. Complete payment to activate your subscription.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start subscription checkout';
      setError(message);
      notifyError(message);
    } finally {
      setProcessingPlan('');
    }
  };

  const hasActive = currentSubscription?.status === 'active';
  const currentPlanType = currentSubscription?.plan_type || null;
  const isMonthlyActive = hasActive && currentPlanType === 'monthly';
  const isYearlyActive = hasActive && currentPlanType === 'yearly';

  const handleCancelSubscription = async () => {
    setProcessingPlan('cancel');
    setMessage('');
    setError('');

    try {
      await apiClient.post('/subscriptions/cancel');
      setMessage('Subscription deactivated successfully.');
      notifySuccess('Subscription deactivated successfully');
      await fetchCurrentSubscription();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to deactivate subscription';
      setError(message);
      notifyError(message);
    } finally {
      setProcessingPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header
        title="Ethereal Ledger"
        actions={(
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        )}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-headline-lg font-headline font-bold text-on-surface mb-2">
            Subscription Required
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Purchase a subscription to add scores, view monthly draws, and choose your charity.
          </p>
        </div>

        {loading ? (
          <Card className="p-8">
            <p className="text-on-surface-variant">Checking current subscription...</p>
          </Card>
        ) : (
          <>
            {hasActive && (
              <Card glow className="p-6 mb-8">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">Current Plan</p>
                    <h2 className="text-headline-sm font-headline font-bold text-on-surface">
                      {(currentSubscription.plan_type || 'subscription').toUpperCase()} PLAN
                    </h2>
                    <p className="text-label-md text-on-surface-variant mt-2">
                      Renews on {new Date(currentSubscription.renewal_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge label="Active" variant="success" />
                </div>
                <div className="mt-6">
                  <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-headline-sm font-headline font-bold text-on-surface mb-2">
                        {plan.title}
                      </h3>
                      <p className="text-display-sm font-bold text-primary mb-2">₹{plan.displayAmount}</p>
                    </div>
                    {((plan.id === 'monthly' && isMonthlyActive) || (plan.id === 'yearly' && isYearlyActive)) && (
                      <Badge label="Active" variant="success" />
                    )}
                  </div>

                  <p className="text-body-sm text-on-surface-variant mb-6">{plan.description}</p>

                  {plan.id === 'monthly' && isYearlyActive ? (
                    <div className="space-y-3">
                      <p className="text-label-md text-on-surface-variant">
                        Your yearly plan is active. Monthly access is already covered by this subscription.
                      </p>
                      <Button variant="secondary" fullWidth disabled>
                        Included in Yearly Plan
                      </Button>
                    </div>
                  ) : plan.id === 'monthly' && isMonthlyActive ? (
                    <Button
                      variant="danger"
                      fullWidth
                      disabled={processingPlan === 'cancel'}
                      onClick={handleCancelSubscription}
                    >
                      {processingPlan === 'cancel' ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                  ) : plan.id === 'yearly' && isMonthlyActive ? (
                    <Button
                      variant="primary"
                      fullWidth
                      disabled={processingPlan === plan.id}
                      onClick={() => startCheckout(plan.id)}
                    >
                      {processingPlan === plan.id ? 'Processing...' : 'Upgrade to Yearly'}
                    </Button>
                  ) : plan.id === 'yearly' && isYearlyActive ? (
                    <Button
                      variant="danger"
                      fullWidth
                      disabled={processingPlan === 'cancel'}
                      onClick={handleCancelSubscription}
                    >
                      {processingPlan === 'cancel' ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      disabled={processingPlan === plan.id}
                      onClick={() => startCheckout(plan.id)}
                    >
                      {processingPlan === plan.id ? 'Processing...' : `Purchase ${plan.title}`}
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {message && (
              <Card className="p-4 mt-6 bg-tertiary/10 border border-tertiary/30">
                <p className="text-label-md text-on-surface">{message}</p>
              </Card>
            )}

            {error && (
              <Card className="p-4 mt-6 bg-error/10 border border-error/30">
                <p className="text-label-md text-error">{error}</p>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
