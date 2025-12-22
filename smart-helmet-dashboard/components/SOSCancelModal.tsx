"use client";

import { useEffect, useState } from "react";

interface SOSCancelModalProps {
    onCancel: () => void;
    onTimeout: () => void;
}

export default function SOSCancelModal({ onCancel, onTimeout }: SOSCancelModalProps) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (countdown === 0) {
            onTimeout();
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, onTimeout]);

    return (
        <div className="sos-modal-overlay">
            <div className="sos-modal">
                <div className="sos-icon">🚨</div>
                <h2>ACCIDENT DETECTED!</h2>
                <p>Emergency services will be notified in:</p>

                <div className="countdown-circle">
                    <div className="countdown-number">{countdown}</div>
                    <svg className="countdown-ring" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="8"
                            strokeDasharray={`${(countdown / 10) * 283} 283`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                </div>

                <p className="sos-message">
                    Are you okay? Press the button below if this was a false alarm.
                </p>

                <button className="cancel-sos-btn" onClick={onCancel}>
                    ✓ I'M OKAY - CANCEL SOS
                </button>

                <p className="sos-warning">
                    If you don't respond, emergency contacts will be notified with your location.
                </p>
            </div>

            <style jsx>{`
                .sos-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .sos-modal {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border: 2px solid #ef4444;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .sos-icon {
                    font-size: 4rem;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .sos-modal h2 {
                    color: #ef4444;
                    font-size: 2rem;
                    margin: 20px 0 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .sos-modal p {
                    color: #cbd5e1;
                    font-size: 1.1rem;
                    margin: 10px 0;
                }

                .countdown-circle {
                    position: relative;
                    width: 150px;
                    height: 150px;
                    margin: 30px auto;
                }

                .countdown-number {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 4rem;
                    font-weight: 800;
                    color: #ef4444;
                    text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
                }

                .countdown-ring {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .sos-message {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #f8fafc;
                    margin: 20px 0;
                }

                .cancel-sos-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin: 20px 0;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .cancel-sos-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 30px rgba(16, 185, 129, 0.6);
                }

                .cancel-sos-btn:active {
                    transform: scale(0.98);
                }

                .sos-warning {
                    font-size: 0.9rem;
                    color: #94a3b8;
                    margin-top: 20px;
                }
            `}</style>
        </div>
    );
}
