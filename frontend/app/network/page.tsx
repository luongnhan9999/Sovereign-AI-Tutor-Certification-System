"use client";
import React, { useState, useEffect } from 'react';

export default function NetworkStatusPage() {
  const [latency, setLatency] = useState(15);
  const [uptime, setUptime] = useState(99.99);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, prev + (Math.random() * 6 - 3)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '120px 5% 40px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}>Network Telemetry</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Real-time status of the Ritual TEE (Trusted Execution Environment) nodes and consensus layer.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Status Box 1 */}
        <div className="vip-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Global Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-lime)', boxShadow: '0 0 10px var(--accent-lime)' }}></span>
              <span style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>Operational</span>
            </div>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Uptime (30d)</span>
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>{uptime}%</span>
          </div>
        </div>

        {/* Status Box 2 */}
        <div className="vip-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Ritual TEE Nodes</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>12 / 12 Active</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Average Latency</span>
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>{latency.toFixed(1)} ms</span>
          </div>
        </div>

        {/* Map / Visualization Placeholder */}
        <div className="vip-card" style={{ gridColumn: '1 / -1', padding: '3rem 2rem', textAlign: 'center', position: 'relative' }}>
           <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
           <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>Node Topography</h3>
           <p style={{ color: 'var(--text-secondary)' }}>All decentralized nodes are synchronized and validating transactions securely.</p>
           
           <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
             {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  width: '15px', height: '15px', borderRadius: '50%', 
                  background: 'var(--accent-cyan)', 
                  boxShadow: '0 0 15px var(--accent-cyan)',
                  animation: `pulse ${1.5 + Math.random()}s infinite alternate`
                }}></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
