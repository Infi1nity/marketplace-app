// frontend/src/components/OrderStatusBadge.jsx
import React from 'react';
import './OrderStatusBadge.css';

const statusConfig = {
  pending: { label: 'Ожидает обработки', color: '#f39c12', bg: '#fff3e0' },
  processing: { label: 'В обработке', color: '#3498db', bg: '#e8f4fd' },
  shipped: { label: 'Отправлен', color: '#2ecc71', bg: '#e8f8f0' },
  delivered: { label: 'Доставлен', color: '#27ae60', bg: '#e8f8f0' },
  cancelled: { label: 'Отменён', color: '#e74c3c', bg: '#fee' },
};

function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span 
      className="order-status-badge"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;