/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['nodemailer', 'bcryptjs', 'pg'],
  },
};

export default nextConfig;

