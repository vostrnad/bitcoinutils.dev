import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // @ts-expect-error field is not in type
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        '**/+*.ts',
        '**/*.d.ts',
        'src/lib/stores',
        'src/lib/utils/frontend',
      ],
    },
  },
})
