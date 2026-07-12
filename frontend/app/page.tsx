"use client";
import Hero from '@/components/Hero';
import Card from '@/components/Card';

export default function Home() {
  const demoId = Math.random().toString(36).substring(2, 10);
  const handleDemo = () => {
    localStorage.setItem('demoUser', demoId);
    alert(`Demo user created: ${demoId}`);
  };
  return (
    <main className="main-container">
      <Hero />
      <section className="cards-section">
        <Card title="Dashboard" link="/dashboard" description="Go to the dashboard" />
        <Card title="Random Demo" onClick={handleDemo} description="Create a random demo user" />
      </section>
    </main>
  );
}
