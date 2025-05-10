import React from 'react';
import { Order } from '../../services/orderService';

interface BillPrintProps {
  order: Order;
  tableNumber: number;
}

const BillPrint: React.FC<BillPrintProps> = ({ order, tableNumber }) => {
  return (
    <div className="text-center" style={{ width: '280px', fontFamily: 'monospace' }}>
      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>HOTEL BAR SYSTEM</h1>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>123 Main Street</p>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>Tel: (123) 456-7890</p>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>GSTIN: 12ABCDE3456F7ZG</p>
      </div>

      <div style={{ textAlign: 'left', fontSize: '12px', marginBottom: '8px' }}>
        <p style={{ margin: '2px 0' }}>Bill #: {order.id}</p>
        <p style={{ margin: '2px 0' }}>Table: {tableNumber}</p>
        <p style={{ margin: '2px 0' }}>Date: {new Date().toLocaleString()}</p>
        <p style={{ margin: '2px 0' }}>Server: STAFF-001</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '8px 0' }}>
        {order.items.map((item, index) => (
          <div key={index} style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'left' }}>
            <div>{item.menuItem.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.quantity} x ₹{item.price.toFixed(2)}</span>
              <span>₹{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', textAlign: 'right', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Subtotal:</span>
          <span>₹{((order.total || 0) - (order.tax || 0) - (order.serviceCharge || 0)).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Service Charge:</span>
          <span>₹{(order.serviceCharge || 0).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>GST ({order.tax ? ((order.tax / order.total) * 100).toFixed(0) : 0}%):</span>
          <span>₹{(order.tax || 0).toFixed(2)}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px dashed #000',
          marginTop: '8px',
          paddingTop: '8px',
          fontWeight: 'bold'
        }}>
          <span>Total:</span>
          <span>₹{(order.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <div style={{ 
        marginTop: '16px', 
        fontSize: '12px',
        borderTop: '1px dashed #000',
        paddingTop: '8px'
      }}>
        <p style={{ margin: '2px 0' }}>Thank you for your visit!</p>
        <p style={{ margin: '2px 0' }}>Please visit again</p>
        <p style={{ fontSize: '10px', marginTop: '8px' }}>* This is a computer generated bill</p>
      </div>
    </div>
  );
};

export default BillPrint; 