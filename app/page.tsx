import { ReturnlyApp } from '@/components/returnly-app'

export default function Page() {
  const configured = Boolean(process.env.DATABASE_URL && process.env.NEON_AUTH_BASE_URL && (process.env.NEON_AUTH_COOKIE_SECRET?.length ?? 0) >= 32)
  return <ReturnlyApp configured={configured} />
}
