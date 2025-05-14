import globals, { defineConfig } from 'eslint/config'

import js from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

export default defineConfig([
  {
    // Ignore files and folders globally
    ignores: ['build/**/*', 'src/components/ui/**', '/src/hooks/*'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: { globals: globals.browser },
  },
  // globalIgnores(['build/**/*'], 'Ignore build directory', 'components/ui/**'),
  pluginReact.configs.flat.recommended,
])
