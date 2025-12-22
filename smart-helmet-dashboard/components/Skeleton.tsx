export default function Skeleton({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`skeleton ${className}`} style={style}>
            <style jsx>{`
        .skeleton {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; background: rgba(255, 255, 255, 0.1); }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
}
