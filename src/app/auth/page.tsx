'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleAuthenticate = async () => {
    if (!username.trim()) {
      setMessage('ユーザー名を入力してください');
      return;
    }

    setMessage('認証中...');

    try {
      // 認証オプションを取得
      const resp = await fetch('/api/webauthn/generate-authentication-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const options = await resp.json();
      console.log('Received authentication options:', options);

      // 認証を開始
      const authResp = await startAuthentication(options);
      console.log('Authentication response:', authResp);

      // 認証を検証
      const verifyResp = await fetch('/api/webauthn/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...authResp,
          userName: username,
        }),
      });

      if (verifyResp.ok) {
        setMessage('認証成功！');
      } else {
        const error = await verifyResp.json();
        console.error('Authentication verification failed:', error);
        setMessage(`認証失敗: ${error.error}`);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setMessage(`エラー: ${String(err)}`);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">WebAuthn 認証</h1>
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
        onClick={handleAuthenticate}
        disabled={!username.trim()}
      >
        認証
      </button>
      <p className="mt-4">{message}</p>
    </main>
  );
} 