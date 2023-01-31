
import { useEffect, useRef } from "react"
import useWindow from "./useWindow";

export default function useEventListener(
    eventType: string,
    callback: (...args: any[]) => any,
    element?: any
): any {
    const window = useWindow();

    if (!element) {
        element = window;
    }

    useEffect(() => {
        if (!element) return
        const handler = (e: any) => callback(e)
        element.addEventListener(eventType, handler)

        return () => element.removeEventListener(eventType, handler)
    }, [eventType, element])
}