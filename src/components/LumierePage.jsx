import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Maison", "Collections", "Atelier", "Bijoux", "Sur Mesure", "Monde"];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export default function LumierePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [taglineRef, taglineInView] = useInView();
  const [cardsRef, cardsInView] = useInView();
  const [bannerRef, bannerInView] = useInView();
  const [quoteRef, quoteInView] = useInView();

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const collections = [
    { title: "Azur", sub: "SS 2026", desc: "Where sea meets sky — fluid silhouettes in deep cerulean and ivory." },
    { title: "Mercure", sub: "Capsule", desc: "Liquid silver metallics reimagined for the modern couture wardrobe." },
    { title: "Éclat", sub: "Haute", desc: "The purest expression of light, woven into every stitch and fold." },
  ];

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#050d1a", color: "#e8edf5", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050d1a; }
        ::-webkit-scrollbar-thumb { background: #2a6b8a; border-radius: 2px; }

        .nav-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #a8c4d8;
          text-decoration: none;
          transition: color 0.4s ease;
          cursor: pointer;
        }
        .nav-link:hover { color: #c8e8f8; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineExpand {
          from { width: 0; }
          to   { width: 120px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0px 0px rgba(80,180,220,0); }
          50% { box-shadow: 0 0 24px 4px rgba(80,180,220,0.18); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-30px) scale(1.05); }
          66% { transform: translate(-30px,20px) scale(0.97); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-1%,-1%); }
          30% { transform: translate(1%,1%); }
          50% { transform: translate(-0.5%,0.5%); }
          70% { transform: translate(0.5%,-0.5%); }
          90% { transform: translate(-1%,1%); }
        }

        .hero-title {
          font-size: clamp(52px, 9vw, 120px);
          font-weight: 300;
          letter-spacing: 0.25em;
          line-height: 1;
          background: linear-gradient(100deg, #7ec8e3 0%, #d0eaf8 35%, #ffffff 50%, #b0d8f0 65%, #5aabcc 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .hero-sub {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(10px, 1.2vw, 13px);
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: #5aabcc;
        }

        .cta-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #050d1a;
          background: linear-gradient(135deg, #7ec8e3, #b0e0f5);
          border: none;
          padding: 16px 44px;
          cursor: pointer;
          transition: all 0.45s ease;
          position: relative;
          overflow: hidden;
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .cta-btn:hover {
          background: linear-gradient(135deg, #b0e0f5, #e0f4ff);
          transform: translateY(-2px);
          letter-spacing: 0.28em;
        }

        .card {
          background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(90,171,204,0.07));
          border: 1px solid rgba(90,171,204,0.18);
          padding: 44px 36px;
          transition: all 0.55s cubic-bezier(0.23,1,0.32,1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(90,171,204,0.1), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .card:hover::before { opacity: 1; }
        .card:hover {
          border-color: rgba(90,171,204,0.5);
          transform: translateY(-8px);
          box-shadow: 0 24px 60px rgba(10,60,90,0.4);
        }

        .section-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1);
        }
        .section-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .section-reveal.delay-1 { transition-delay: 0.15s; }
        .section-reveal.delay-2 { transition-delay: 0.3s; }
        .section-reveal.delay-3 { transition-delay: 0.45s; }

        .divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, #3a8aaa, transparent);
          align-self: stretch;
        }
      `}</style>

      {/* Ambient background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,90,140,0.22) 0%, transparent 70%)", animation: "orb-drift 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,70,110,0.18) 0%, transparent 70%)", animation: "orb-drift 22s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(80,170,210,0.06) 0%, transparent 65%)" }} />
        {/* Grain overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.5, animation: "grain 0.5s steps(1) infinite" }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 48px",
        height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,13,26,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(90,171,204,0.1)" : "none",
        transition: "all 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, border: "1px solid #5aabcc", transform: "rotate(45deg)", opacity: 0.7 }} />
            <div style={{ position: "absolute", inset: 5, background: "#5aabcc", transform: "rotate(45deg)", opacity: 0.5 }} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, letterSpacing: "0.35em", color: "#d0eaf8", marginLeft: 6 }}>LUMIÈRE</span>
        </div>

        <div style={{ display: "flex", gap: 36 }}>
          {NAV_LINKS.map(l => <span key={l} className="nav-link">{l}</span>)}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["🔍","♡","◻"].map((icon, i) => (
            <span key={i} style={{ fontSize: 14, color: "#7ec8e3", cursor: "pointer", transition: "color 0.3s", opacity: 0.8 }}>{icon}</span>
          ))}
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "#5aabcc", border: "1px solid rgba(90,171,204,0.4)", padding: "6px 14px", cursor: "pointer", transition: "all 0.35s ease" }}>EN</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px" }}>

        {/* Top accent */}
        <div style={{ opacity: heroReady ? 1 : 0, transition: "opacity 1s ease 0.2s", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <div style={{ width: 60, height: 1, background: "linear-gradient(to right, transparent, #5aabcc)" }} />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.5em", color: "#5aabcc", textTransform: "uppercase" }}>Maison de Couture · Paris</span>
            <div style={{ width: 60, height: 1, background: "linear-gradient(to left, transparent, #5aabcc)" }} />
          </div>
        </div>

        {/* Diamond ornament */}
        <div style={{
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "scale(1) rotate(45deg)" : "scale(0.5) rotate(45deg)",
          transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 0.3s",
          width: 48, height: 48, border: "1px solid rgba(90,171,204,0.6)",
          position: "relative", marginBottom: 40,
        }}>
          <div style={{ position: "absolute", inset: 6, background: "rgba(90,171,204,0.15)", border: "1px solid rgba(90,171,204,0.3)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 8, height: 8, background: "#7ec8e3", transform: "translate(-50%,-50%)", borderRadius: "50%" }} />
        </div>

        {/* Main title */}
        <h1 className="hero-title" style={{
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "translateY(0)" : "translateY(50px)",
          transition: "all 1.2s cubic-bezier(0.23,1,0.32,1) 0.5s",
          marginBottom: 8,
        }}>
          LUMIÈRE
        </h1>

        <div style={{
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.85s",
          marginBottom: 28,
        }}>
          <p className="hero-sub">The House of Radiant Luxury</p>
        </div>

        {/* Animated line */}
        <div style={{
          height: 1,
          background: "linear-gradient(to right, transparent, #7ec8e3, transparent)",
          marginBottom: 36,
          opacity: heroReady ? 1 : 0,
          width: heroReady ? 200 : 0,
          transition: "width 1.4s cubic-bezier(0.23,1,0.32,1) 1.1s, opacity 0.5s ease 1.1s",
        }} />

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(16px, 2vw, 20px)",
          color: "rgba(200,225,240,0.7)",
          fontWeight: 300,
          letterSpacing: "0.04em",
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: 52,
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.23,1,0.32,1) 1.3s",
        }}>
          Where light becomes fabric, and fabric becomes legend.
        </p>

        <div style={{
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.23,1,0.32,1) 1.6s",
          display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center",
        }}>
          <button className="cta-btn">Discover Collection</button>
          <button style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7ec8e3",
            background: "transparent",
            border: "1px solid rgba(90,171,204,0.45)",
            padding: "16px 44px",
            cursor: "pointer",
            transition: "all 0.45s ease",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(90,171,204,0.9)"; e.target.style.color = "#c0e4f5"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(90,171,204,0.45)"; e.target.style.color = "#7ec8e3"; }}
          >
            Our Atelier
          </button>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          opacity: heroReady ? 0.6 : 0, transition: "opacity 1s ease 2.2s",
        }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#5aabcc", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 50, background: "linear-gradient(to bottom, #5aabcc, transparent)", animation: "floatUp 2s ease-in-out infinite alternate" }} />
        </div>
      </section>

      {/* Tagline band */}
      <section ref={taglineRef} style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(90,171,204,0.12)", borderBottom: "1px solid rgba(90,171,204,0.12)", padding: "40px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 80, animation: "shimmer 18s linear infinite", whiteSpace: "nowrap", justifyContent: "center", flexWrap: "wrap" }}>
          {["Savoir-Faire", "·", "Excellence", "·", "Lumière", "·", "Élégance", "·", "Paris", "·", "Atelier"].map((t, i) => (
            <span key={i} style={{ fontFamily: t === "·" ? "serif" : "'Cormorant Garamond', serif", fontSize: t === "·" ? 20 : 13, fontWeight: 300, letterSpacing: "0.35em", color: t === "·" ? "#3a8aaa" : "rgba(160,210,235,0.6)", textTransform: "uppercase" }}>{t}</span>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 48px" }}>
        <div ref={cardsRef} style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className={`section-reveal ${cardsInView ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 70 }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.5em", color: "#5aabcc", textTransform: "uppercase", marginBottom: 18 }}>Saison 2026</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 300, letterSpacing: "0.15em", color: "#d0eaf8" }}>The Collections</h2>
            <div style={{ width: 80, height: 1, background: "linear-gradient(to right, transparent, #7ec8e3, transparent)", margin: "24px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {collections.map((c, i) => (
              <div key={c.title} className={`card section-reveal delay-${i + 1} ${cardsInView ? "visible" : ""}`}>
                {/* Visual placeholder */}
                <div style={{
                  height: 220,
                  background: `linear-gradient(135deg, rgba(${20 + i * 15},${70 + i * 20},${110 + i * 10},0.6), rgba(10,40,70,0.8))`,
                  marginBottom: 28,
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(90,171,204,0.1)",
                }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 60, height: 60, border: "1px solid rgba(90,171,204,0.4)", transform: "rotate(45deg)" }} />
                    <div style={{ position: "absolute", width: 30, height: 30, background: "rgba(90,171,204,0.15)", border: "1px solid rgba(90,171,204,0.3)", transform: "rotate(45deg)" }} />
                  </div>
                  <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#5aabcc", textTransform: "uppercase" }}>{c.sub}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, letterSpacing: "0.2em", color: "#d0eaf8", marginBottom: 14 }}>{c.title}</h3>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: "rgba(160,210,235,0.65)", lineHeight: 1.7, fontWeight: 300 }}>{c.desc}</p>
                <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: "0.35em", color: "#7ec8e3", textTransform: "uppercase", cursor: "pointer" }}>Explore</span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(90,171,204,0.5), transparent)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section ref={bannerRef} style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(135deg, rgba(15,45,80,0.95) 0%, rgba(5,20,40,0.98) 100%)",
        borderTop: "1px solid rgba(90,171,204,0.15)",
        borderBottom: "1px solid rgba(90,171,204,0.15)",
        padding: "100px 48px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,120,170,0.15) 0%, transparent 60%)", transform: "translate(-50%,-50%)" }} />
        <div className={`section-reveal ${bannerInView ? "visible" : ""}`} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.5em", color: "#5aabcc", textTransform: "uppercase", marginBottom: 24 }}>New Arrival</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, letterSpacing: "0.15em", lineHeight: 1.1, marginBottom: 28 }}>
            <span style={{ display: "block", color: "#d0eaf8" }}>The Art of</span>
            <span style={{ display: "block", background: "linear-gradient(90deg, #7ec8e3, #c0e8f8, #7ec8e3)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>Refined Light</span>
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "rgba(200,225,240,0.6)", maxWidth: 500, margin: "0 auto 44px", lineHeight: 1.8 }}>
            Each garment a prism — catching light, casting dreams.
          </p>
          <button className="cta-btn">Voir la Collection</button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ position: "relative", zIndex: 1, padding: "90px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "stretch", gap: 0, flexWrap: "wrap" }}>
          {[["1921", "Founded in Paris"], ["47", "Haute Couture Pieces"], ["12", "Countries"], ["∞", "Pursuit of Perfection"]].map(([num, label], i) => (
            <div key={i} style={{ flex: "1 1 180px", textAlign: "center", padding: "32px 24px", borderRight: i < 3 ? "1px solid rgba(90,171,204,0.15)" : "none" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 300, color: "#7ec8e3", letterSpacing: "0.05em", lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.3em", color: "rgba(160,210,235,0.5)", textTransform: "uppercase", marginTop: 12 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section ref={quoteRef} style={{ position: "relative", zIndex: 1, padding: "80px 48px 120px", textAlign: "center" }}>
        <div className={`section-reveal ${quoteInView ? "visible" : ""}`}>
          <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, #5aabcc)", margin: "0 auto 40px" }} />
          <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 300, color: "rgba(200,230,245,0.8)", maxWidth: 700, margin: "0 auto 28px", lineHeight: 1.6, letterSpacing: "0.02em" }}>
            "To wear Lumière is to carry a fragment of heaven."
          </blockquote>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.4em", color: "#5aabcc", textTransform: "uppercase" }}>— Isabelle Fontaine, Directrice Artistique</span>
          <div style={{ width: 1, height: 60, background: "linear-gradient(to top, transparent, #5aabcc)", margin: "40px auto 0" }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(90,171,204,0.12)", padding: "52px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 20, height: 20, border: "1px solid #5aabcc", transform: "rotate(45deg)", opacity: 0.7, position: "relative" }}>
            <div style={{ position: "absolute", inset: 4, background: "rgba(90,171,204,0.3)" }} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, letterSpacing: "0.3em", color: "#a0cede" }}>LUMIÈRE</span>
        </div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(100,160,190,0.5)", textAlign: "center" }}>© 2026 Maison Lumière · Paris · All rights reserved</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Instagram", "Pinterest", "Contact"].map(l => (
            <span key={l} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(100,160,190,0.6)", textTransform: "uppercase", cursor: "pointer", transition: "color 0.3s" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
