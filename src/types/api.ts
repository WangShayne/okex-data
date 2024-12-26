export interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: string;
    timestamp?: string;
}

export interface ApiResponse<T = unknown> {
    code: string;
    msg: string;
    data: T[];
}

export interface Ticker {
    instId: string;
    last: string;
    vol24h: string;
    volCcy24h: string;
    open24h: string;
    chg24h?: string;
} 