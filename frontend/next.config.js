/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
    SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:5000',
  },
}

module.exports = nextConfig