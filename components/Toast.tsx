'use client';
import { useEffect, useState } from 'react';

export default function Toast({ msg, type }: { msg: string; type: 'success'|'error' }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); return () => setVisible(false); }, []);
  return (
    <div className={`toast toast-${type} ${visible?'show':''}`}>{msg}</div>
  );
}
