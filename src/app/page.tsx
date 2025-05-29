'use client';

import { useState } from 'react';
import {
  startRegistration,
} from '@simplewebauthn/browser';

export default function Home() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    if (!username.trim()) {
      setMessage('ユーザー名を入力してください');
      return;
    }

    setMessage('開始中…');

    const resp = await fetch('/api/webauthn/generate-registration-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    const options = await resp.json();

    try {
      const attResp = await startRegistration(options);

      const verifyResp = await fetch('/api/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      if (verifyResp.ok) {
        setMessage('登録成功！');
      } else {
        const error = await verifyResp.json();
        setMessage(`登録失敗: ${error.error}`);
      }
    } catch (err) {
      setMessage(`エラー: ${String(err)}`);
    }
  };

  return (
      <main className="p-8">
        <h1 className="text-2xl mb-4">WebAuthn 登録</h1>
        <input
            className="border px-2 py-1 mr-2"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <button
            className={`px-4 py-2 rounded ${
              username.trim() 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleRegister}
            disabled={!username.trim()}
        >
          登録
        </button>
        <p className="mt-4">{message}</p>
      </main>
  );
}
