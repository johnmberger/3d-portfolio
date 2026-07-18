import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
  },
})
