export const environment = {
  production: false,
  useMockData: true, // Use mock data in development
  apiUrls: {
    ergast: 'https://api.jolpi.ca/ergast/f1',
    openf1: 'https://api.openf1.org/v1'
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes
};