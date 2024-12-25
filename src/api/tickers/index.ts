import { createSign } from '@/utils';
import type { RequestConfig, ApiResponse } from '@/types/api';

const baseUrl = 'https://www.okx.com/api/v5';

export async function getAllTickers(type:string) {
    const params = new URLSearchParams({
        instType: type || 'SPOT'
    });
    // 添加错误处理
    try {
        const response = await fetch(`${baseUrl}/market/tickers?${params}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tickers:', error);
        throw error;
    }
}

