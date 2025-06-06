'use client';

import { useState, useEffect } from 'react';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

type Authenticator = {
  id: number;
  credentialId: string;
  name: string;
  createdAt: string;
  lastUsedAt: string;
  deviceType: string;
  deviceName: string;
  transports: string[];
};

export default function Home() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [authenticators, setAuthenticators] = useState<Authenticator[]>([]);

  // 認証器の一覧を取得
  const fetchAuthenticators = async (username: string) => {
    if (!username.trim()) return;
    
    try {
      const resp = await fetch(`/api/webauthn/authenticators?username=${encodeURIComponent(username)}`);
      if (resp.ok) {
        const data = await resp.json();
        setAuthenticators(data.authenticators);
      }
    } catch (err) {
      console.error('Error fetching authenticators:', err);
    }
  };

  // ユーザー名が変更されたときに認証器の一覧を取得
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuthenticators(username);
    }, 500); // 入力が完了してから500ms後に取得

    return () => clearTimeout(timer);
  }, [username]);

  // 認証器の削除
  const handleDeleteAuthenticator = async (credentialId: string) => {
    try {
      const resp = await fetch('/api/webauthn/authenticators/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      });
      if (resp.ok) {
        setMessage('認証器を削除しました');
        fetchAuthenticators(username);
      } else {
        const error = await resp.json();
        setMessage(`認証器の削除に失敗しました: ${error.error}`);
      }
    } catch (err) {
      console.error('Error deleting authenticator:', err);
      setMessage(`エラー: ${String(err)}`);
    }
  };

  // 認証器の登録
  const handleRegister = async () => {
    if (!username.trim()) {
      setMessage('ユーザー名を入力してください');
      return;
    }

    setMessage('');

    try {
      // デバイス情報の取得
      const deviceType = getDeviceType();
      const deviceName = getDeviceName();

      const resp = await fetch('/api/webauthn/registration/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, deviceType, deviceName }),
      });

      if (!resp.ok) {
        throw new Error('登録に失敗しました');
      }

      const data = await resp.json();
      const attResp = await startRegistration(data);

      const verificationResp = await fetch('/api/webauthn/registration/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: username,
          ...attResp,
          deviceType,
          deviceName,
        }),
      });

      if (!verificationResp.ok) {
        throw new Error('認証器の検証に失敗しました');
      }

      setMessage('認証器の登録が完了しました');
      fetchAuthenticators(username);
    } catch (err) {
      console.error('Registration error:', err);
      setMessage(`エラー: ${String(err)}`);
    }
  };

  // デバイスの種類を取得
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(iPhone|iPad|iPod)/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown';
  };

  // デバイスの名前を取得
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    const deviceInfo = ua.match(/\((.*?)\)/);
    return deviceInfo ? deviceInfo[1] : 'Unknown Device';
  };

  const handleAuthenticate = async () => {
    if (!username.trim()) {
      setMessage('ユーザー名を入力してください');
      return;
    }

    setMessage('認証中...');

    try {
      // 認証オプションを取得
      const resp = await fetch('/api/webauthn/authentication/generate', {
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
      const verifyResp = await fetch('/api/webauthn/authentication/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...authResp,
          userName: username,
        }),
      });

      if (verifyResp.ok) {
        setMessage('認証成功！');
        fetchAuthenticators(username);
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

  // 認証器の一覧を表示
  const renderAuthenticators = () => {
    if (authenticators.length === 0) {
        return <p className="text-gray-500">登録済みの認証器はありません</p>;
    }

    return (
        <div className="space-y-2">
            {authenticators.map((auth) => (
                <div
                    key={auth.credentialId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow"
                >
                    <div>
                        <p className="font-medium">{auth.deviceName}</p>
                        <p className="text-sm text-gray-500">{auth.deviceType}</p>
                        <p className="text-sm text-gray-500">
                            認証器の種類: {auth.transports.includes('internal') ? 'プラットフォーム認証器' : 'ローミング認証器'}
                        </p>
                        <p className="text-sm text-gray-600">
                            登録日: {new Date(auth.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                            最終使用: {new Date(auth.lastUsedAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDeleteAuthenticator(auth.credentialId)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                        削除
                    </button>
                </div>
            ))}
        </div>
    );
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">WebAuthn デモ</h1>
      <input
        className="border w-full px-2 py-1"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="flex justify-center gap-2 my-4">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handleRegister}
        >
          登録
        </button>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={handleAuthenticate}
        >
          認証
        </button>
      </div>
      <p className="mt-4">{message}</p>

      {renderAuthenticators()}
    </main>
  );
}
