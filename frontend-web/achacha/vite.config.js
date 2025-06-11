import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // 빌드 출력 디렉토리를 'build'로 설정
  },
  server: {
    proxy: {
      // API 요청을 백엔드 서버로 프록시
      '/api': {
        target: 'https://k12d205.p.ssafy.io/', // 백엔드 서버 주소
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
