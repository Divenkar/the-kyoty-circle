'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRTicketProps {
    qrData: string;
    eventTitle: string;
    userName: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
}

export function QRTicket({ qrData, eventTitle, userName, eventDate, eventTime, location }: QRTicketProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        QRCode.toCanvas(canvasRef.current, qrData, {
            width: 220,
            margin: 2,
            color: { dark: '#1a1a2e', light: '#ffffff' },
        });
    }, [qrData]);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-md border border-neutral-200">
                <canvas ref={canvasRef} className="rounded-xl" />
            </div>
            <p className="text-xs text-neutral-400 text-center">
                Show this QR code at the event for check-in
            </p>
        </div>
    );
}
