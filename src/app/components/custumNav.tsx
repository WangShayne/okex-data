'use client'
import { useEffect, useRef } from 'react';
import Card from './card';
import gsap from 'gsap';
import rrrr from '../../../public/images/home/rrrr.png'

// 定义角色类
class Peep {
    image: HTMLImageElement;
    rect: number[];
    width: number;
    height: number;
    x: number = 0;
    y: number = 0;
    anchorY: number = 0;
    scaleX: number = 1;
    walk: gsap.core.Timeline | null = null;
    bubbleMessage: string | null = null;
    drawArgs: [HTMLImageElement, ...number[]];

    constructor({ image, rect }: { image: HTMLImageElement; rect: number[] }) {
        this.image = image;
        this.rect = rect;
        this.width = rect[2];
        this.height = rect[3];
        this.drawArgs = [this.image, ...rect, 0, 0, this.width, this.height];
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scaleX, 1);
        ctx.drawImage(this.image, this.rect[0], this.rect[1], this.rect[2], this.rect[3], 0, 0, this.width, this.height);
        ctx.restore();
    }

    drawBubble(ctx: CanvasRenderingContext2D) {
        if (!this.bubbleMessage) return;

        const padding = 2;
        const radius = 12;
        const text = this.bubbleMessage;
        ctx.font = '16px -apple-system, "PingFang SC", "Microsoft YaHei"';
        const textWidth = ctx.measureText(text).width + 2 * 6;
        const height = 20;
        const width = Math.max(this.width, textWidth);
        const bubbleHeight = height + 2 * padding;

        const x = this.x - (width - this.width) / 2;
        const y = this.y - bubbleHeight - padding + 22;

        // 绘制气泡
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + bubbleHeight - radius);
        ctx.arcTo(x + width, y + bubbleHeight, x + width - radius, y + bubbleHeight, radius);
        ctx.lineTo(x + radius, y + bubbleHeight);
        ctx.arcTo(x, y + bubbleHeight, x, y + bubbleHeight - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + bubbleHeight / 2);
    }
}


export default function CustomNav() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const peepsRef = useRef<Peep[]>([]);
    const availablePeepsRef = useRef<Peep[]>([]);
    const activePeepsRef = useRef<Peep[]>([]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 配置
        const config = {
            src: rrrr.src,
            rows: 14,
            cols: 5
        };

        // 设置画布尺寸
        const setCanvasSize = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            canvas.width = width * devicePixelRatio;
            canvas.height = height * devicePixelRatio;
            return { width, height };
        };

        // 初始化画布尺寸
        const stage = setCanvasSize();

        // 加载图片
        const img = new Image();
        img.onload = () => {
            initPeeps();
            startAnimation();
        };
        img.src = config.src;

        // 初始化角色
        const initPeeps = () => {
            const { rows, cols } = config;
            const total = rows * cols;
            const spriteWidth = img.naturalWidth / rows;
            const spriteHeight = img.naturalHeight / cols;

            for (let i = 0; i < total; i++) {
                const rect = [
                    (i % rows) * spriteWidth,
                    Math.floor(i / rows) * spriteHeight,
                    spriteWidth,
                    spriteHeight
                ];
                peepsRef.current.push(new Peep({ image: img, rect }));
            }
            availablePeepsRef.current = [...peepsRef.current];
        };

        // 生成随机位置和动画
        const getRandomPosition = (peep: Peep) => {
            const direction = Math.random() > 0.5 ? 1 : -1;
            const offsetY = 200 - 70 * gsap.parseEase('power2.in')(Math.random());
            const y = stage.height - peep.height - 50 + offsetY;

            let startX, endX;
            if (direction === 1) {
                startX = -peep.width - Math.random() * 200;
                endX = stage.width;
                peep.scaleX = 1;
            } else {
                startX = stage.width + peep.width + Math.random() * 200;
                endX = 0;
                peep.scaleX = -1;
            }

            peep.x = startX;
            peep.y = y;
            peep.anchorY = y;

            return { startX, startY: y, endX };
        };

        // 添加气泡消息数组
        const messages = [
            "早上好！",
            "狂暴大牛市来了!",
            "大的要来了",
            "空军必胜!!!",
            "梭哈!!!梭哈!!!梭哈!!!"
        ];

        // 修改创建动画的部分
        const createAnimation = (peep: Peep) => {
            const props = getRandomPosition(peep);
            const duration = 10;
            const tl = gsap.timeline();

            tl.timeScale(gsap.utils.random(1.0, 2.0));
            tl.to(peep, {
                duration,
                x: props.endX,
                ease: 'none',
                onStart: () => {
                    if (Math.random() < 0.3) {
                        peep.bubbleMessage = messages[Math.floor(Math.random() * messages.length)];
                        setTimeout(() => {
                            peep.bubbleMessage = null;
                        }, gsap.utils.random(4000, 8000));
                    }
                }
            }, 0);

            tl.to(peep, {
                duration: 0.2,
                repeat: duration / 0.2,
                yoyo: true,
                y: props.startY - 8,
            }, 0);

            return tl;
        };

        // 修改开始动画的部分
        const startAnimation = () => {
            render();
            // 分批添加角色，使进场更自然
            const addPeepsWithDelay = (count: number) => {
                for (let i = 0; i < count; i++) {
                    setTimeout(() => {
                        addPeep();
                    }, i * 300); // 每个角色间隔300ms进场
                }
            };

            // 先添加一批角色
            addPeepsWithDelay(10);

            // 1秒后添加第二批角色
            setTimeout(() => {
                addPeepsWithDelay(10);
            }, 1000);
        };

        // 修改渲染循环，确保气泡在角色之后绘制
        const render = () => {
            canvas.width = canvas.width;
            ctx.save();
            ctx.scale(devicePixelRatio, devicePixelRatio);

            // 先绘制所有角色
            activePeepsRef.current.forEach(peep => peep.render(ctx));

            // 再绘制所有气泡
            activePeepsRef.current.forEach(peep => peep.drawBubble(ctx));

            ctx.restore();
            requestAnimationFrame(render);
        };

        // 添加新角色
        const addPeep = () => {
            if (availablePeepsRef.current.length === 0) return;

            const peep = availablePeepsRef.current.splice(
                Math.floor(Math.random() * availablePeepsRef.current.length),
                1
            )[0];

            activePeepsRef.current.push(peep);

            const tl = createAnimation(peep);
            peep.walk = tl;

            tl.eventCallback('onComplete', () => {
                removePeep(peep);
                addPeep();
            });
        };

        // 移除角色
        const removePeep = (peep: Peep) => {
            activePeepsRef.current = activePeepsRef.current.filter(p => p !== peep);
            availablePeepsRef.current.push(peep);
        };

        // 监听窗口大小变化
        const handleResize = () => {
            const newStage = setCanvasSize();
            Object.assign(stage, newStage);
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            activePeepsRef.current.forEach(peep => {
                peep.walk?.kill();
            });
        };
    }, []);

    return (
        <div>
            <Card>
                <h1 className='text-5xl font-bold text-center relative top-[70px]'>加密货币市场信息</h1>
                <h3 className='text-2xl text-center text-gray-500 relative top-[120px]'>快速寻找最有价值的投资标的</h3>
                <canvas ref={canvasRef} id="nav_canvas" className='w-full h-[400px]'></canvas>
            </Card>
        </div>
    );
}
