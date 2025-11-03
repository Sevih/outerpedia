// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'outerpedia',
      version: '0.0.0', // Will be replaced by deployment script
      script: 'npm',
      args: 'start',
      cwd: '/home/sevih/outerpedia',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://outerpedia.com/api',
        NEXT_PUBLIC_SITE_URL: 'https://outerpedia.com'
      }
    }
  ]
};
