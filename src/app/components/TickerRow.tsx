import { memo } from 'react';
import Image from 'next/image';
import type { Ticker } from '@/types/api';

interface TickerRowProps {
    item: Ticker;
    calculateChangePercent: (last: string, open24h: string) => string;
    getCoinIcon: (symbol: string) => string;
}

const TickerRow = memo(function TickerRow({ item, calculateChangePercent, getCoinIcon }: TickerRowProps) {
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
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/default-coin.svg';
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
});

TickerRow.displayName = 'TickerRow';
export default TickerRow; 