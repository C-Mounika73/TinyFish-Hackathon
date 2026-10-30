import type React from 'react'
import { ArrowUpRight, Check, CircleAlert, Clock3, Info, MapPin } from 'lucide-react'
import type { DonationStatus } from '../lib/types'

const statusClass: Record<DonationStatus | 'Verified' | 'Pending' | 'Rejected' | 'Discovered – Pending Verification', string> = {
  Available: 'status-green', Requested: 'status-blue', Accepted: 'status-blue', 'Pickup Assigned': 'status-orange', 'Picked Up': 'status-blue', Delivered: 'status-green', Completed: 'status-green', Cancelled: 'status-muted', Expired: 'status-red', Verified: 'status-green', Pending: 'status-orange', Rejected: 'status-red', 'Discovered – Pending Verification': 'status-orange',
}

export function StatusBadge({ status }: { status: DonationStatus | 'Verified' | 'Pending' | 'Rejected' | 'Discovered – Pending Verification' }) { return <span className={`status-badge ${statusClass[status] || 'status-muted'}`}><span className="status-dot" />{status}</span> }
export function MetricCard({ label, value, meta, icon, accent = 'green' }: { label: string; value: string | number; meta?: string; icon: React.ReactNode; accent?: 'green' | 'orange' | 'blue' | 'cream' }) { return <div className={`metric-card metric-${accent}`}><div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon">{icon}</span></div><strong className="metric-value">{value}</strong>{meta && <span className="metric-meta">{meta}</span>}</div> }
export function SectionLabel({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div> }
export function Alert({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) { const Icon = tone === 'warning' ? CircleAlert : tone === 'success' ? Check : Info; return <div className={`inline-alert alert-${tone}`}><Icon size={17} strokeWidth={2.4} /><span>{children}</span></div> }
export function DonationLocation({ address }: { address: string }) { return <span className="location-line"><MapPin size={14} />{address}</span> }
export function Deadline({ value }: { value: string }) { return <span className="deadline-line"><Clock3 size={14} />{value}</span> }
export function ViewLink({ children = 'View details' }: { children?: React.ReactNode }) { return <span className="view-link">{children}<ArrowUpRight size={14} /></span> }
