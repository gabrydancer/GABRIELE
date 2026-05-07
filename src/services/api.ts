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
  }
};
