export const api = {
  async getData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async saveData(data: any) {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save data');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async createStripeSession(paymentData: { amount: number, description: string, studentName: string, paymentId: string }) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment session');
      }
      return await response.json();
    } catch (error) {
      console.error('Stripe API Error:', error);
      throw error;
    }
  }
};
