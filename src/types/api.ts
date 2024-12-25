export interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: any;
    timestamp?: string;
}

export interface ApiResponse<T = any> {
    code: string;
    msg: string;
    data: T;
}

// 可以继续添加其他接口定义
export interface Balance {
    ccy: string;
    bal: string;
    frozenBal: string;
    availBal: string;
} 