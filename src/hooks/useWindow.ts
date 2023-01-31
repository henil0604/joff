type WindowProps = (Window & typeof globalThis) | any

/** verify the document and tell you if it's from the server or the real window object */
export default function useWindow(): WindowProps | null {
    let myWindow: WindowProps = null
    if (typeof window !== 'undefined') {
        myWindow = window
    }

    return myWindow
}
