"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-icon">
            <Shield size={40} />
          </div>
          <h1>Smart Helmet</h1>
          <p>Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">


          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} />
              <input type="text" placeholder="Enter username" required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="Enter password" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background: rgba(30, 41, 59, 0.6);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary), #8b5cf6);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 8px;
        }

        .login-header p {
          color: #94a3b8;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .role-selector {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 8px;
        }

        .role-btn {
          flex: 1;
          padding: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-btn.active {
          background: var(--primary);
          color: white;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }

        .input-with-icon input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-with-icon input:focus {
          border-color: var(--primary);
        }

        .login-btn {
          width: 100%;
          margin-top: 12px;
          padding: 14px;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
