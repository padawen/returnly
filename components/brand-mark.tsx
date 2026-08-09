import Image from 'next/image'

export function BrandMark({
  className = '',
  iconOnly = false,
}: {
  className?: string
  iconOnly?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-bold tracking-tight text-primary ${className}`}
    >
      <Image
        src="/returnly-wine-icon-192.png"
        alt=""
        width={iconOnly ? 36 : 28}
        height={iconOnly ? 36 : 28}
        priority
        className="rounded-lg"
      />
      {!iconOnly && <span>Returnly</span>}
    </div>
  )
}
