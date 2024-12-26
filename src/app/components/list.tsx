'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from "./card";
import TickerRow from './TickerRow';
import { getAllTickers } from '@/api/tickers';
import type { Ticker } from '@/types/api';

const getCoinIcon = (symbol: string) => {
    try {
        const coinSymbol = symbol.split('-')[0].toLowerCase();
        return `https://www.okx.com/cdn/oksupport/asset/currency/icon/${coinSymbol}.png`;
    } catch {
        return '/default-coin.svg';
    }
};

const calculateChangePercent = (last: string, open24h: string) => {
    try {
        const lastPrice = parseFloat(last);
        const openPrice = parseFloat(open24h);
        if (lastPrice && openPrice) {
            return ((lastPrice - openPrice) / openPrice * 100).toFixed(2);
        }
        return '0.00';
    } catch {
        return '0.00';
    }
};

export default function List() {
    const [sortField, setSortField] = useState<keyof Ticker>('volCcy24h');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleTickerUpdate = useCallback((ticker: Ticker) => {
        setTickers(prevTickers => {
            const index = prevTickers.findIndex(t => t.instId === ticker.instId);
            if (index === -1) return prevTickers;

            const oldTicker = prevTickers[index];
            if (oldTicker.last === ticker.last &&
                oldTicker.open24h === ticker.open24h &&
                oldTicker.volCcy24h === ticker.volCcy24h) {
                return prevTickers;
            }

            const newTickers = [...prevTickers];
            newTickers[index] = ticker;
            return newTickers;
        });
    }, []);

    const sortedData = useMemo(() => {
        return [...tickers].sort((a, b) => {
            let compareResult = 0;

            if (sortField === 'chg24h') {
                const changeA = parseFloat(calculateChangePercent(a.last, a.open24h));
                const changeB = parseFloat(calculateChangePercent(b.last, b.open24h));
                compareResult = changeB - changeA;
            } else if (sortField === 'instId') {
                compareResult = a.instId.localeCompare(b.instId);
            } else {
                compareResult = Number(b[sortField]) - Number(a[sortField]);
            }

            return sortDirection === 'desc' ? compareResult : -compareResult;
        });
    }, [tickers, sortField, sortDirection]);

    const handleSort = useCallback((field: keyof Ticker) => {
        setSortField(field);
        setSortDirection(prev => {
            if (sortField === field) {
                return prev === 'desc' ? 'asc' : 'desc';
            }
            return 'desc';
        });
    }, [sortField]);

    useEffect(() => {
        let ws: WebSocket;
        let wsReconnectTimer: NodeJS.Timeout;

        const initialize = async () => {
            try {
                const tickersResponse = await getAllTickers('SPOT');
                if (tickersResponse.data && Array.isArray(tickersResponse.data)) {
                    const usdtTickers = (tickersResponse.data as Ticker[])
                        .filter(ticker => ticker.instId.includes('USDT') && !ticker.instId.includes('TRY'))
                        .sort((a, b) => Number(b.volCcy24h) - Number(a.volCcy24h))
                        .slice(0, 50);

                    setTickers(usdtTickers);
                    setupWebSocket(usdtTickers.map(ticker => ticker.instId));
                }
            } catch (error) {
                console.error('初始化失败:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const setupWebSocket = (instIds: string[]) => {
            if (ws?.readyState === WebSocket.OPEN) ws.close();

            ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

            ws.onopen = () => {
                const subscribeMsg = {
                    "op": "subscribe",
                    "args": instIds.map(instId => ({
                        "channel": "tickers",
                        "instId": instId
                    }))
                };
                ws.send(JSON.stringify(subscribeMsg));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.data?.[0] && data.arg?.channel === 'tickers') {
                        handleTickerUpdate(data.data[0]);
                    }
                } catch (error) {
                    console.error('处理WebSocket消息失败:', error);
                }
            };

            ws.onclose = () => {
                wsReconnectTimer = setTimeout(() => setupWebSocket(instIds), 5000);
            };
        };

        initialize();

        return () => {
            if (ws?.readyState === WebSocket.OPEN) ws.close();
            if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
        };
    }, [handleTickerUpdate]);

    return (
        <div className='mt-4'>
            <Card>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-center border-b sticky top-0 bg-white">
                                    <th className="p-4">图标</th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('instId')}>
                                        <div className="flex items-center justify-center gap-1">
                                            交易对
                                            {sortField === 'instId' && (
                                                <span className="text-gray-500">
                                                    {sortDirection === 'desc' ? '↓' : '↑'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('last')}>
                                        <div className="flex items-center justify-center gap-1">
                                            最新价格
                                            {sortField === 'last' && (
                                                <span className="text-gray-500">
                                                    {sortDirection === 'desc' ? '↓' : '↑'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('chg24h')}>
                                        <div className="flex items-center justify-center gap-1">
                                            24h涨跌
                                            {sortField === 'chg24h' && (
                                                <span className="text-gray-500">
                                                    {sortDirection === 'desc' ? '↓' : '↑'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('volCcy24h')}>
                                        <div className="flex items-center justify-center gap-1">
                                            24h成交额(USDT)
                                            {sortField === 'volCcy24h' && (
                                                <span className="text-gray-500">
                                                    {sortDirection === 'desc' ? '↓' : '↑'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="relative">
                                {sortedData.map(item => (
                                    <TickerRow
                                        key={item.instId}
                                        item={item}
                                        calculateChangePercent={calculateChangePercent}
                                        getCoinIcon={getCoinIcon}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
}


