import { Link } from 'react-router-dom'

export function Logo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="FoodLoop AI home">
    <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 42 42" fill="none"><path d="M9 24.5c7.2-.7 12.9-5.6 17.1-14.3 4.1 8.9 1.2 18.4-7.3 22.1-4.1 1.8-7.5-.1-9.8-2.5Z" fill="currentColor"/><path d="M10.4 33.1c5-6.4 10.4-11.7 18.5-17.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity=".45"/></svg></span>
    <span className="brand-copy"><strong>FoodLoop</strong><em>AI</em></span>
  </Link>
}
