const document = (() => {
    try {
        return window.document
    } catch {
        return require('min-document')
    }
})()

export function renderNode(elem) {
    if (elem == null) {
        return document.createTextNode('')
    } else if (
        typeof elem === 'string' ||
        typeof elem === 'number' ||
        typeof elem === 'boolean'
    ) {
        return document.createTextNode(elem)
    } else if (
        typeof elem.tag === 'function' &&
        elem.tag.toString().startsWith('class')
    ) {
        const { tag, props, children } = elem

        const obj = new elem.tag(props)
        Object.assign(obj, elem)

        if (obj.onMount) obj.onMount()
        return renderNode(obj.render(props, children))
    } else if (Array.isArray(elem)) {
        return elem.map(item => renderNode(item))
    }

    let { tag, props, children, defaultProps } = elem

    if (tag === 'fragment') {
        const childNodes = children.map(child => renderNode(child))
        return { childNodes }
    } else if (typeof tag === 'function') {
        return renderNode(tag(props, children))
    }

    props = { ...(defaultProps || {}), ...(props || {}) }
    const $node = document.createElement(tag)

    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on')) {
            const event = key.replace('on', '').toLowerCase()
            $node.addEventListener(event, value)
        } else if (key === 'style') {
            if (typeof value === 'object') {
                const styleString = Object.entries(value).map(([k, v]) => {
                    return k.replace(/[A-Z]/gm, l => '-' + l.toLowerCase()) + ': ' + v.toString()
                }).join(';')

                $node.setAttribute('style', styleString)
            } else {
                $node.setAttribute('style', value.toString)
            }
        } else if (key === 'className') {
            $node.className += value.toString()
        } else {
            $node.setAttribute(key, value)
        }
    }

    (children || []).forEach(child => {
        if (Array.isArray(child)) {
            child.forEach(nestedChild => {
                try {
                    $node.appendChild(renderNode(nestedChild).node)
                } catch {
                    $node.appendChild(renderNode(nestedChild))
                }
            })
        } else {
            try {
                $node.appendChild(renderNode(child).node)
            } catch {
                $node.appendChild(renderNode(child))
            }
        }
    })

    elem.node = $node
    return elem
}