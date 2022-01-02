const document = (() => {
    try {
        return window.document
    } catch {
        return require('min-document')
    }
})()

const proxify = ({ name, data, handler, html }) => {

    (document.getElementsByName(name) || []).forEach((elem) => {
        ([...elem.attributes] || []).forEach((attr) => {
            if (attr.name.startsWith('bind:') && attr.value = prop) elem.setAttribute(attr.name.replace('bind:', ''), value)
        })
    })

    return new Proxy(data, {
        set: (target, prop, value) => {
            target[prop] = value

            (document.querySelectorAll(`[bind=${prop}]`) || []).forEach((elem) => {
                elem[html ? 'innerHTML' : 'textContent'] = value
                handler(elem)
            })

            (document.getElementsByName(name) || []).forEach((elem) => {
                ([...elem.attributes] || []).forEach((attr) => {
                    if (attr.name.startsWith('bind:') && attr.value = prop) elem.setAttribute(attr.name.replace('bind:', ''), value)
                })
            })

            return value
        }
    })
}

export { proxify }