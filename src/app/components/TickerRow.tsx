import { memo } from 'react';
import Image from 'next/image';
import type { Ticker } from './types';

const TickerRow = memo(({ item, calculateChangePercent, getCoinIcon }: {
    item: Ticker;
    calculateChangePercent: (last: string, open24h: string) => string;
    getCoinIcon: (symbol: string) => string;
}) => {
    const changePercent = calculateChangePercent(item.last, item.open24h);

    return (
        <tr className="border-b hover:bg-gray-50 text-center">
            <td className="p-4">
                <div className="flex justify-center items-center">
                    <Image
                        src={getCoinIcon(item.instId)}
                        alt={item.instId}
                        width={24}
                        height={24}
                        className="rounded-full"
                        onError={(e: any) => {
                            e.target.src = '/default-coin.svg';
                        }}
                    />
                </div>
            </td>
            <td className="p-4">{item.instId}</td>
            <td className="p-4">{Number(item.last).toFixed(4)}</td>
            <td className={`p-4 ${Number(changePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {changePercent}%
            </td>
            <td className="p-4">{Number(item.volCcy24h).toLocaleString()}</td>
        </tr>
    );
}, (prevProps, nextProps) => {
    // 只有当关键数据变化时才重新渲染
    return prevProps.item.last === nextProps.item.last &&
        prevProps.item.open24h === nextProps.item.open24h &&
        prevProps.item.volCcy24h === nextProps.item.volCcy24h;
});

export default TickerRow; 