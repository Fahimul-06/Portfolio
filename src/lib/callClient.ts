import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export type IceServer = RTCIceServer;

export type RingConfig = {
  enabled: boolean;
  volume: number;
  frequency: number;
  intervalMs: number;
  beepMs: number;
  vibrationEnabled: boolean;
};

export type CallConfig = {
  enabled: boolean;
  iceServers: IceServer[];
  ring?: RingConfig;
  adminApp?: {
    autoOpenIncomingPage?: boolean;
    pwaEnabled?: boolean;
  };
};

export type LiveCall = {
  callId: string;
  customerName: string;
  customerEmail?: string;
  status: 'ringing' | 'accepted';
  createdAt: string;
  acceptedAt?: string | null;
};

export async function getCallConfig(): Promise<CallConfig> {
  const response = await fetch(`${API_BASE}/call/config`);
  if (!response.ok) {
    throw new Error('Failed to load call configuration.');
  }
  return response.json();
}

export function getAdminToken(): string {
  return localStorage.getItem('admin_token') || '';
}


export type SendSmsResponse = {
  ok: boolean;
  number: string;
  callUrl?: string | null;
  message: string;
  providerResponse?: string;
  providerCode?: string | null;
  providerMessage?: string;
};

export async function getAdminCallUrl(phone = ''): Promise<string> {
  const params = new URLSearchParams();
  if (phone.trim()) params.set('phone', phone.trim());
  const response = await fetch(`${API_BASE}/call/url${params.toString() ? `?${params.toString()}` : ''}`, {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || 'Could not generate call URL.');
  return payload.callUrl;
}

export async function sendCallLinkSms(phone: string, message?: string): Promise<SendSmsResponse> {
  const response = await fetch(`${API_BASE}/call/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: JSON.stringify({ phone, message }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || 'Could not send call SMS.');
  return payload;
}


export async function sendAdminSms(phone: string, message: string, includeCallUrl = false): Promise<SendSmsResponse> {
  const response = await fetch(`${API_BASE}/sms/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: JSON.stringify({ phone, message, includeCallUrl }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || 'Could not send SMS.');
  return payload;
}

export function createCustomerSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { role: 'customer' },
  });
}

export function createAdminSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { role: 'admin', token: getAdminToken() },
  });
}
