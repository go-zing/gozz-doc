export default ({router}) => {
    if (typeof process === 'undefined' || process.env.VUE_ENV !== 'server') {
        router.onReady(() => {
            const h = decodeURIComponent(window.location.hash.substring(1))
            if (h) {
                setTimeout(() => {
                    document.getElementById(h)?.getElementsByClassName("header-anchor")[0]?.click()
                }, 200)
            }
        })
    }
};