export default ({router}) => {
    router.onReady(() => {
        if (typeof window !== 'undefined') {
            const {hash} = document.location;
            const h = decodeURIComponent(hash.substring(1))
            if (h) {
                setTimeout(() => {
                    const el = document.getElementById(h);
                    if (el) {
                        el.scrollIntoView()
                    }
                }, 200)
            }
        }
    });
};