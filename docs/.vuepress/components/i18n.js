const i18n = {
    render(h) {
        if (this.$attrs.lang === this.$lang) {
            return h("span", this.$slots.default)
        }
    }
}

export function render(h) {
    return h(i18n, {attrs: {lang: this.lang}}, this.$slots.default)
}