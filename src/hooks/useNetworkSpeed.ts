import { useEffect, useState } from "react";
import useWindow from "./useWindow";
let networkInterval: any;
let lastNetworkDone = true;

export default function useNetworkSpeed() {

    const window = useWindow();
    const [isOnlineByServer, setStatusByServer] = useState<string>('idle');

    // useEffect(() => {
    if (!window) {
        return;
    }

    if (networkInterval) {
        clearInterval(networkInterval);
    }

    try {
        networkInterval = setInterval(async () => {
            console.log("Checking Network Status")

            if (!lastNetworkDone) {
                return;
            }

            let networkStatus;

            const data = {
                sentAt: Date.now(),
                receivedAt: null,
                recoveredAt: null,
                latency: null,
                data: null
            } as any;

            lastNetworkDone = false;
            try {
                networkStatus = await fetch('/api/networkSpeed', {
                    headers: {
                        'Keep-Alive': 'timeout=1, max=15'
                    }
                });
            } catch {
                lastNetworkDone = true;
                setStatusByServer('error');
                return;
            }
            lastNetworkDone = true;
            data.recoveredAt = Date.now()

            if (networkStatus?.status != 200) {
                setStatusByServer('error');
            }

            if (networkStatus?.status === 200) {
                data.data = await networkStatus.json();

                data.latency = data.recoveredAt - data.sentAt;

                if (data.latency > 10000) {
                    setStatusByServer('slow');
                    return;
                }

                if (data.latency > 5000) {
                    setStatusByServer('good');
                    return;
                }

                if (data.latency > 3000) {
                    setStatusByServer('fast');
                    return;
                }

                setStatusByServer('idle');

            }


        }, 5000);
    } catch {
        setStatusByServer('error');
    }

    // }, []);

    return isOnlineByServer;
}