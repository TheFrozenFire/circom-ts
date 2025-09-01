import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: false,
  sourcemap: false,
  minify: false,
  target: 'es2022'
}); 