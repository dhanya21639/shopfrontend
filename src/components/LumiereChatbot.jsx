import { useState, useRef, useEffect } from "react";

const getBotReply = (msg) => {
  const text = msg.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|namaste|hii|helo|good morning|good evening|good afternoon|hai)/.test(text))
    return "Bonjour! 👋 Welcome to Maison Lumière!\n\nI'm your personal style concierge. I can assist you with our collections, orders, shipping, returns, and much more!\n\nHow may I assist you today? ✨";

  // How are you
  if (/how are you|how r you|wassup|what's up/.test(text))
    return "Magnifique, merci! 😊 I'm here to make your Lumière experience truly exceptional. How can I assist you?";

  // Bye
  if (/bye|goodbye|see you|take care|cya/.test(text))
    return "Au revoir! 🙏 Thank you for visiting Maison Lumière. Until we meet again! 👋✨";

  // Thank you
  if (/thank|thanks|thx|ty/.test(text))
    return "Avec plaisir! 😊 It's our pleasure to serve you. Is there anything else I can help you with?";

  // Watches
  if (/watch|watches|rolex|omega|hublot|breitling|iwc|panerai|vacheron|tag heuer|audemars/.test(text))
    return "⌚ Our Lumière Luxury Timepiece Collection:\n\n• Rolex Submariner — ₹8,50,000\n• Omega Speedmaster — ₹6,20,000\n• Tag Heuer Carrera — ₹2,45,000\n• Breitling Navitimer — ₹3,95,000\n• Hublot Big Bang — ₹8,95,000\n• IWC Portugieser — ₹4,25,000\n• Panerai Luminor — ₹3,75,000\n• Vacheron Constantin — ₹18,50,000\n• Audemars Piguet Royal Oak — ₹28,50,000\n\nVisit Men → Watches to explore our curated selection! 🕐";

  // Men's fashion
  if (/men|suit|blazer|tuxedo|formal|shirt|trouser|chino|cargo/.test(text))
    return "👔 Our Men's Lumière Collection:\n\n• Tailored Suits & Blazers — ₹12,999 to ₹32,999\n• Formal Shirts — ₹2,499 to ₹3,499\n• Premium T-Shirts — ₹999 to ₹1,599\n• Designer Jeans — ₹2,999 to ₹3,999\n• Trousers — ₹2,999 to ₹4,499\n\nAvailable in Slim, Regular, Athletic & Tailored fits!";

  // T-shirts
  if (/t.?shirt|tee|crew neck|polo|v.?neck|graphic/.test(text))
    return "👕 Lumière T-Shirts start from ₹999!\n\n• Premium Cotton Crew Neck — ₹1,299\n• V-Neck Polo T-Shirt — ₹1,599\n• Graphic Printed T-Shirt — ₹999\n• Athletic Fit T-Shirt — ₹1,499\n\nSizes XS to 4XL available!";

  // Jeans
  if (/jean|denim|skinny|bootcut|stretch/.test(text))
    return "👖 Our Denim Collection:\n\n• Slim Fit Stretch Jeans — ₹3,499\n• Regular Fit Classic Jeans — ₹2,999\n• Distressed Skinny Jeans — ₹3,999\n• Bootcut Jeans — ₹3,299\n• Black Stretch Jeans — ₹3,799\n\nSizes 28 to 40 available!";

  // Women
  if (/women|woman|ladies|female|girl|saree|kurta|lehenga|dress/.test(text))
    return "👗 Our Women's Lumière Collection is arriving très bientôt! Stay tuned for an extraordinary experience. 💎\n\nSubscribe to our newsletter to be the first to know! 💃";

  // Kids
  if (/kid|kids|child|children|baby|toddler/.test(text))
    return "👦👧 Lumière has a delightful Kids collection with clothing and accessories!\n\nVisit the Kids section from our main menu to explore.";

  // Accessories
  if (/accessor|bag|belt|wallet|sunglasses|cap|hat/.test(text))
    return "👜 Lumière Accessories:\n\n• Women's Accessories — Curated elegance\n• Kids Accessories — Playful & refined\n\nVisit the respective sections from our main menu!";

  // Pricing
  if (/price|cost|how much|rate|expensive|cheap|afford|budget/.test(text))
    return "💎 Lumière offers refined luxury for every connoisseur:\n\n• T-Shirts from ₹999\n• Shirts from ₹2,499\n• Jeans from ₹2,999\n• Suits from ₹12,999\n• Luxury Watches from ₹2,45,000\n\nAll pieces crafted with exceptional quality! ✨";

  // Orders
  if (/order|my order|track|tracking|where is|order status/.test(text))
    return "📦 To track your Lumière order:\n\n1. Click your Profile icon (top right)\n2. Go to 'My Orders'\n3. View real-time status of all orders\n\nOr visit the /orders page directly!";

  // Cart
  if (/cart|basket|add to cart|checkout|buy|purchase/.test(text))
    return "🛒 To place an order at Lumière:\n\n1. Browse any collection page\n2. Click 'Add to Cart'\n3. Review your cart (top right icon)\n4. Proceed to Checkout\n\nEMI available on orders above ₹5,000! 💳";

  // Shipping
  if (/ship|shipping|deliver|delivery|how long|days|arrive|dispatch/.test(text))
    return "🚚 Lumière Delivery:\n\n• Free shipping on orders above ₹999\n• Metro cities: 3–7 business days\n• Other areas: 5–10 business days\n\nA tracking link will be sent once your order is dispatched! 📬";

  // Returns
  if (/return|refund|exchange|replace|wrong|damage|defect/.test(text))
    return "↩️ Lumière Return Policy:\n\n• 30-day easy returns & exchanges\n• Damaged or wrong items — full refund\n• Complimentary return pickup from your door\n• Refund in 5–7 business days\n\nGo to My Orders → Select Order → Request Return!";

  // Payment
  if (/pay|payment|cod|cash|upi|card|net banking/.test(text))
    return "💳 Lumière Payment Options:\n\n• Cash on Delivery (COD) ✅\n• UPI (GPay, PhonePe, Paytm) ✅\n• Credit / Debit Cards ✅\n• Net Banking ✅\n\nAll payments are 100% secure & encrypted! 🔒";

  // Discount / Offers
  if (/discount|offer|coupon|promo|sale|deal|off/.test(text))
    return "✨ Current Lumière Offers:\n\n• Up to 30% OFF on Men's Collection\n• Up to 15% OFF on Luxury Timepieces\n• Free shipping above ₹999\n• Subscribe to newsletter for 10% OFF your first order! 🏷️";

  // Wishlist
  if (/wishlist|wish list|favourite|favorite|save/.test(text))
    return "💙 Your Lumière Wishlist:\n\n1. Click the ♡ heart icon on any piece\n2. View saved items at /wishlist\n3. Move items to cart anytime!\n\nYour wishlist is saved to your account. 💾";

  // Account / Login
  if (/account|login|register|sign up|signup|profile|password/.test(text))
    return "👤 Account Assistance:\n\n• New to Lumière? Click 'Register'\n• Returning? Click 'Login'\n• Forgot password? Use 'Forgot Password' on the login page\n• Update your details at Profile → Settings";

  // Sizes
  if (/size|sizing|fit|small|medium|large|xl|xxl|measurements/.test(text))
    return "📏 Lumière Size Guide:\n\n• T-Shirts & Shirts: XS, S, M, L, XL, XXL, 3XL, 4XL\n• Jeans & Trousers: Waist 28 to 40\n• Suits: S, M, L, XL, XXL\n\nFits: Slim, Regular, Athletic, Relaxed, Tailored\n\nDetailed size charts available on each product page! 📐";

  // Contact
  if (/contact|support|help|customer care|email|phone|call|complaint/.test(text))
    return "📞 Lumière Concierge Support:\n\n• Visit our Contact page from the menu\n• Email: concierge@lumiere.com\n• Available: Mon–Sat, 9 AM to 6 PM\n\nWe respond within 24 hours! 💬";

  // About
  if (/about|who are you|what is lumiere|lumière|company/.test(text))
    return "💎 About Maison Lumière:\n\nLumière is a premium luxury fashion house offering:\n\n• Men's Haute Collection\n• Luxury Timepieces (35+ brands)\n• Kids' Refined Collection\n• Curated Accessories\n\n10,000+ discerning clients · 4.8 ⭐ rating ✨";

  // Invoice
  if (/invoice|bill|receipt|gst/.test(text))
    return "🧾 To receive your Lumière Invoice:\n\n1. Go to My Orders\n2. Select your order\n3. Click 'Download Invoice'\n\nGST invoices are auto-generated for all orders! 📄";

  // Default
  return "✨ Allow me to guide you! Here's what I can assist with:\n\n• 💎 Collections (Men, Women, Kids, Watches)\n• 📦 Orders & Tracking\n• 🚚 Shipping & Delivery\n• ↩️ Returns & Refunds\n• 💳 Payment Options\n• 📏 Size Guide\n• 📞 Concierge Support\n\nJust ask me anything about Lumière!";
};

const suggestedQuestions = [
  "What watches do you have?",
  "Men's collection prices?",
  "Return policy?",
  "Is COD available?",
  "Track my order",
  "Size guide",
  "Current offers?",
  "Shipping details",
];

export default function LumiereChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Bonjour! 👋 Welcome to Maison Lumière!\n\nI'm your personal style concierge. Ask me about our collections, orders, shipping, returns, and more!\n\nHow may I assist you today? ✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized)
      setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, isMinimized]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setShowSuggestions(false);
    setMessages(prev => [...prev, { from: "user", text: userText }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "bot", text: getBotReply(userText) }]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatText = (text) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');

        .lm-bubble {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          width: 62px; height: 62px; border-radius: 50%;
          background: linear-gradient(135deg, #5aabcc, #1a6080);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 28px rgba(90,171,204,0.55);
          transition: transform 0.3s ease;
          animation: lm-pulse 3s infinite;
        }
        .lm-bubble:hover { transform: scale(1.1); }

        @keyframes lm-pulse {
          0%,100% { box-shadow: 0 6px 28px rgba(90,171,204,0.55), 0 0 0 0 rgba(90,171,204,0.3); }
          50%      { box-shadow: 0 6px 28px rgba(90,171,204,0.55), 0 0 0 12px rgba(90,171,204,0); }
        }

        .lm-badge {
          position: absolute; top: -2px; right: -2px;
          width: 18px; height: 18px; background: #c0392b;
          border-radius: 50%; border: 2px solid #050d1a;
          font-size: 10px; font-weight: 700; color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Montserrat', sans-serif;
        }

        .lm-window {
          position: fixed; bottom: 104px; right: 28px; z-index: 9998;
          width: 375px;
          background: #050d1a;
          border: 1px solid rgba(90,171,204,0.2);
          border-radius: 20px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(90,171,204,0.1);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: 'Montserrat', sans-serif;
          animation: lm-slideIn 0.35s cubic-bezier(0.34,1.2,0.64,1);
        }
        .lm-window.minimized { height: 68px !important; overflow: hidden; }

        @keyframes lm-slideIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .lm-header {
          background: linear-gradient(135deg, #071525, #0d2236);
          border-bottom: 1px solid rgba(90,171,204,0.15);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; flex-shrink: 0;
        }

        .lm-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, #1a6080, #5aabcc);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          border: 1px solid rgba(90,171,204,0.4);
          box-shadow: 0 0 14px rgba(90,171,204,0.3);
        }

        .lm-header-info { flex: 1; }
        .lm-header-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-weight: 400;
          letter-spacing: 0.15em; color: #c8e8f8; line-height: 1.2;
        }
        .lm-header-status {
          font-size: 10px; color: #5aabcc;
          display: flex; align-items: center; gap: 5px;
          margin-top: 3px; letter-spacing: 0.1em;
        }

        .lm-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3dd68c; animation: lm-blink 2s infinite;
        }
        @keyframes lm-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .lm-header-btns { display: flex; gap: 6px; }
        .lm-hbtn {
          background: rgba(90,171,204,0.1); border: 1px solid rgba(90,171,204,0.2);
          border-radius: 7px; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(160,210,235,0.7);
          transition: all 0.2s; font-size: 13px;
          font-family: 'Montserrat', sans-serif;
        }
        .lm-hbtn:hover { background: rgba(90,171,204,0.2); color: #c8e8f8; }

        .lm-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 12px;
          height: 360px;
          background: linear-gradient(180deg, #060f1e 0%, #050d1a 100%);
        }
        .lm-messages::-webkit-scrollbar { width: 3px; }
        .lm-messages::-webkit-scrollbar-thumb { background: rgba(90,171,204,0.3); border-radius: 3px; }

        .lm-msg-row { display: flex; gap: 8px; align-items: flex-end; }
        .lm-msg-row.user { flex-direction: row-reverse; }

        .lm-msg-icon {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #1a6080, #5aabcc);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
          border: 1px solid rgba(90,171,204,0.3);
        }

        .lm-msg {
          max-width: 80%; padding: 11px 14px; border-radius: 16px;
          font-size: 13px; line-height: 1.6; font-weight: 300;
          animation: lm-msgIn 0.25s ease;
        }
        @keyframes lm-msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lm-msg.bot {
          background: rgba(255,255,255,0.04);
          color: #c8e8f8;
          border: 1px solid rgba(90,171,204,0.2);
          border-bottom-left-radius: 4px;
        }
        .lm-msg.user {
          background: linear-gradient(135deg, #1a6080, #0d3a52);
          color: #e8f5fc;
          border: 1px solid rgba(90,171,204,0.3);
          border-bottom-right-radius: 4px;
        }

        .lm-typing {
          display: flex; gap: 5px; align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(90,171,204,0.2);
          border-radius: 16px; border-bottom-left-radius: 4px;
          width: fit-content;
        }
        .lm-tdot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #5aabcc; animation: lm-bounce 1.2s infinite;
        }
        .lm-tdot:nth-child(2) { animation-delay: 0.2s; }
        .lm-tdot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes lm-bounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.35; }
          30%          { transform: translateY(-5px); opacity: 1; }
        }

        .lm-suggestions {
          padding: 0 14px 10px;
          background: #060f1e;
          border-top: 1px solid rgba(90,171,204,0.08);
          display: flex; flex-wrap: wrap; gap: 6px;
          padding-top: 10px;
        }
        .lm-chip {
          background: rgba(90,171,204,0.06);
          border: 1px solid rgba(90,171,204,0.25);
          color: #7ec8e3; padding: 6px 12px; border-radius: 20px;
          font-size: 11px; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          letter-spacing: 0.05em;
          transition: all 0.25s; white-space: nowrap;
        }
        .lm-chip:hover {
          background: rgba(90,171,204,0.15);
          border-color: rgba(90,171,204,0.6);
          color: #c8e8f8;
        }

        .lm-input-area {
          padding: 12px 14px;
          background: #071525;
          border-top: 1px solid rgba(90,171,204,0.15);
          display: flex; gap: 8px; align-items: center; flex-shrink: 0;
        }
        .lm-input {
          flex: 1; border: 1px solid rgba(90,171,204,0.25); border-radius: 12px;
          padding: 10px 13px; font-size: 13px;
          font-family: 'Montserrat', sans-serif; font-weight: 300;
          outline: none;
          background: rgba(90,171,204,0.05);
          color: #c8e8f8;
          transition: border-color 0.25s, background 0.25s;
        }
        .lm-input:focus {
          border-color: rgba(90,171,204,0.6);
          background: rgba(90,171,204,0.08);
        }
        .lm-input::placeholder { color: rgba(90,171,204,0.4); }

        .lm-send {
          width: 40px; height: 40px; border-radius: 11px;
          background: linear-gradient(135deg, #5aabcc, #1a6080);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 0.2s;
          box-shadow: 0 4px 14px rgba(90,171,204,0.35);
        }
        .lm-send:hover:not(:disabled) { transform: scale(1.07); }
        .lm-send:disabled { opacity: 0.4; cursor: not-allowed; }

        .lm-footer {
          padding: 8px; background: #071525;
          border-top: 1px solid rgba(90,171,204,0.08);
          text-align: center; font-size: 10px;
          color: rgba(90,171,204,0.35);
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.12em;
        }

        @media (max-width: 480px) {
          .lm-window { width: calc(100vw - 20px); right: 10px; bottom: 88px; }
          .lm-bubble { right: 14px; bottom: 14px; }
        }
      `}</style>

      {/* Floating Bubble */}
      <button
        className="lm-bubble"
        onClick={() => { setIsOpen(o => !o); setIsMinimized(false); }}
        aria-label="Open Lumière chat"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div className="lm-badge">1</div>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`lm-window ${isMinimized ? "minimized" : ""}`}>

          {/* Header */}
          <div className="lm-header" onClick={() => setIsMinimized(m => !m)}>
            <div className="lm-avatar">💎</div>
            <div className="lm-header-info">
              <div className="lm-header-name">LUMIÈRE Concierge</div>
              <div className="lm-header-status">
                <div className="lm-dot"/> Online · À votre service
              </div>
            </div>
            <div className="lm-header-btns" onClick={e => e.stopPropagation()}>
              <button className="lm-hbtn" onClick={() => setIsMinimized(m => !m)}>—</button>
              <button className="lm-hbtn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="lm-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`lm-msg-row ${msg.from}`}>
                    {msg.from === "bot" && <div className="lm-msg-icon">💎</div>}
                    <div className={`lm-msg ${msg.from}`}>{formatText(msg.text)}</div>
                  </div>
                ))}
                {isTyping && (
                  <div className="lm-msg-row bot">
                    <div className="lm-msg-icon">💎</div>
                    <div className="lm-typing">
                      <div className="lm-tdot"/><div className="lm-tdot"/><div className="lm-tdot"/>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="lm-suggestions">
                  {suggestedQuestions.map((q, i) => (
                    <button key={i} className="lm-chip" onClick={() => sendMessage(q)}>{q}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="lm-input-area">
                <input
                  ref={inputRef}
                  className="lm-input"
                  placeholder="Ask your concierge..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="lm-send" onClick={() => sendMessage()} disabled={!input.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>

              <div className="lm-footer">MAISON LUMIÈRE · PARIS · 2026 ✨</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
