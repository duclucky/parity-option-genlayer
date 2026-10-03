import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { rpcHandler } from './api/rpc.ts';
export default defineConfig({ plugins: [react(),{name:'studio-rpc',configureServer(server){
  server.middlewares.use('/api/ic-rpc',rpcHandler('ic'));
  server.middlewares.use('/api/wallet-rpc',rpcHandler('wallet'));
}}], test: { environment: 'jsdom', restoreMocks: true } });
