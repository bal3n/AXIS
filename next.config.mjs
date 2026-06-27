/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_OUTPUT_EXPORT === 'true';
const basePath = isExport ? (process.env.NEXT_PUBLIC_BASE_PATH || '/AXIS') : '';

const nextConfig = {
  output: isExport ? 'export' : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;
