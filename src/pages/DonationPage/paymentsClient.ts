export interface CheckPaymentResponse {
  found: boolean;
  txId?: string;
  reason?: string;
}

export async function checkPaymentByCode(
  code: string,
  opts: {
    baseUrl?: string;          // 'https://api.example.com', по умолчанию ''
    withCredentials?: boolean; // нужны ли куки (CORS)
    timeoutMs?: number;        // таймаут, 15 000 мс по умолч.
    signal?: AbortSignal;      // внешняя отмена
  } = {},
): Promise<CheckPaymentResponse> {

  const {
    baseUrl = import.meta.env.VITE_API_URL,
    withCredentials = false,
    timeoutMs = 15000,
    signal: outerSignal,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  outerSignal?.addEventListener('abort', () => controller.abort());

  try {
    const res  = await fetch(`${baseUrl}/api/payments/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: withCredentials ? 'include' : 'same-origin',
      signal: controller.signal,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.reason || `HTTP ${res.status}`);

    return data as CheckPaymentResponse;
  } finally {
    clearTimeout(timer);
  }
}
