import { useEffect, useState } from "react"
import useEventListener from '@/hooks/useEventListener'
import useWindow from '@/hooks/useWindow';

export default function useOnlineStatus() {

    const [isOnlineByNavigator, setStatusByNavigator] = useState<boolean>(true);

    useEventListener("online", () => setStatusByNavigator(navigator.onLine))
    useEventListener("offline", () => setStatusByNavigator(navigator.onLine))

    return isOnlineByNavigator;
}
