export default () => ({
    mongoDbUri: process.env.DB_CONNECTION,
        appPort: process.env.PORT || 3000,
        apiVersion: process.env.API_VERSION,
        
        tokenExpired: process.env.TOKEN_EXPIRED,
        refreshTokenExpired:
        process.env.REFRESH_TOKEN_EXPIRED,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  });