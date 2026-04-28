/**
 * ScrollToTop — resets the window scroll position to top
 * whenever the user navigates to a new route.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    // This component renders nothing — it's a pure side-effect component
    return null;
}
