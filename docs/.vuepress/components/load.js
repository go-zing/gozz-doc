export function load(src, callback) {
    if (!document) {
        return
    }
    let head = document.getElementsByTagName('head')[0];
    for (let node of head.childNodes) {
        if (node.src === src) {
            callback()
            return
        }
    }
    // load script
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    head.appendChild(script);
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            script.onload = script.onreadystatechange = null;
            callback()
        }
    };
}