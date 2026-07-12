"use client";
import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  link?: string;
  onClick?: () => void;
}

export default function Card({ title, description, link, onClick }: CardProps) {
  const inner = (
    <div className="glass-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  if (link) {
    return (
      <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  }

  return inner;
}
