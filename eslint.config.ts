import type { Linter } from 'eslint'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config: Linter.Config[] = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', '.npm-cache/**', '.pnpm-store/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
