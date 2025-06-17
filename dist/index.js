import { useEffect, useState } from "react";
const useZoom = () => {
    const [zoom, setZoom] = useState(+window.devicePixelRatio.toFixed(2));
    useEffect(() => {
        const handleZoomChange = () => {
            setZoom(+window.devicePixelRatio.toFixed(2));
        };
        window.addEventListener("resize", handleZoomChange);
        const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleZoomChange);
        }
        else {
            mediaQuery.addListener(handleZoomChange);
        }
        return () => {
            window.removeEventListener("resize", handleZoomChange);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", handleZoomChange);
            }
            else {
                mediaQuery.removeListener(handleZoomChange);
            }
        };
    }, []);
    return zoom;
};
export default useZoom;
