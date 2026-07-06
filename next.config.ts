import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\tkart\\.gemini\\antigravity-ide\\brain\\c1de24d6-855e-4387-9665-63c8e230fa72\\project_block_diagram_1783308106656.png';
const dest = path.join(process.cwd(), 'public', 'project_block_diagram.png');

try {
  if (fs.existsSync(src)) {
    // Ensure public folder exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log('[next.config] Copied block diagram to public directory');
  }
} catch (err) {
  console.error('[next.config] Copy failed:', err);
}

const nextConfig: NextConfig = {};

export default nextConfig;
