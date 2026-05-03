import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: "360px", md: "460px", lg: "620px" };

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)"
      }} />

      {/* Modal */}
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "relative", background: "#1a1a1a", borderRadius: "20px",
        width: "100%", maxWidth: sizeMap[size], maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #2d2d2d"
        }}>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#4ade80", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "#2d2d2d", border: "none", borderRadius: "8px", padding: "6px",
            cursor: "pointer", display: "flex", color: "#a3a3a3"
          }}>
            <X style={{ width: "17px", height: "17px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", color: "#d4d4d8" }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
