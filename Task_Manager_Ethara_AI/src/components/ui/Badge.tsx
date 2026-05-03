import React from 'react';

type BadgeVariant =
  | 'pending' | 'in_progress' | 'completed'
  | 'low' | 'medium' | 'high'
  | 'admin' | 'member'
  | 'overdue' | 'active' | 'archived' | 'default';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  pending:    { background: "#3a2a1a", color: "#fbbf24", border: "1px solid #5a4a2a" },
  in_progress:{ background: "#1a2a3a", color: "#60a5fa", border: "1px solid #3a5a7a" },
  completed:  { background: "#1a3a2a", color: "#4ade80", border: "1px solid #3a6a4a" },
  low:        { background: "#2a2a2a", color: "#4ade80", border: "1px solid #4a4a4a" },
  medium:     { background: "#3a2a1a", color: "#fbbf24", border: "1px solid #5a4a2a" },
  high:       { background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #5a2a2a" },
  admin:      { background: "#2a1a3a", color: "#a78bfa", border: "1px solid #4a3a5a" },
  member:     { background: "#1a2a3a", color: "#22d3ee", border: "1px solid #3a5a6a" },
  overdue:    { background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #5a2a2a" },
  active:     { background: "#1a3a2a", color: "#4ade80", border: "1px solid #3a6a4a" },
  archived:   { background: "#2a2a2a", color: "#767676", border: "1px solid #4a4a4a" },
  default:    { background: "#2a2a2a", color: "#a3a3a3", border: "1px solid #4a4a4a" },
};

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700,
      textTransform: "capitalize", whiteSpace: "nowrap",
      ...variantStyles[variant]
    }}>
      {children}
    </span>
  );
};

export default Badge;
