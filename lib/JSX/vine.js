import { renderNode } from './render-node.js'
import { createNode } from './create-node.js'
// import { proxify } from '../Helpers/vine-dom'
let globalID = 0
let globalParent = null
let globalCache = new Map()

const defaultOptions = {
    keepHTML: false, // if false, innerHTML is cleared
    updateCache: false // if false, cache is cleared
}

// Serializer and Parser

// =============== Hooks =============== //

function useState(initValue) {
    const localID = globalID++
    const localParent = globalParent
    const { cache, children } = globalCache.get(localParent)

    if (!cache[localID]) {
        cache[localID] = initValue
    }

    const state = cache[localID]
    function setState(newValue) {
        cache[localID] = typeof newValue === 'function' ? newValue(state) : newValue
        render(children, localParent, { keepHTML: false, updateCache: true })
    }
    return [ state, setState ]
}

function useEffect(callback, dependencies) {
    const localID = globalID++
    const localParent = globalParent
    const { cache, children } = globalCache.get(localParent)

    if (cache[localID] == null) {
        cache[localID] = { dependencies: undefined }
    }

    const change = dependencies == null || dependencies.some((dependency, i) => {
        return cache[localID].dependencies == null || cache[localID].dependencies[i] !== dependency
    })

    if (change) {
        if (cache[localID].cleanup) cache[localID].cleanup()
        cache[localID].cleanup = callback()
        cache[localID].dependencies = dependencies
    }
}

function useMemo(callback, dependencies) {
    const localID = globalID++
    const localParent = globalParent
    const { cache, children } = globalCache.get(localParent)

    if (cache[localID] == null) {
        cache[localID] = { dependencies: undefined }
    }

    const change = dependencies == null || dependencies.some((dependency, i) => {
        return cache[localID].dependencies == null || cache[localID].dependencies[i] !== dependency
    })

    if (change) {
        cache[localID].value = callback()
        cache[localID].dependencies = dependencies
    }

    return cache[localID].value
}

function useRunner(callback, ...args) {
    const localID = globalID++
    const localParent = globalParent
    const { cache, children } = globalCache.get(localParent)
    
    if (cache[localID] == null) cache[localID] = 0
    cache[localID] += 1
    const finalCallback = callback()
    cache[localID] -= 1

    if (cache[localID] === 0) {
        if (typeof finalCallback === 'function') finalCallback(...args)
    }
}

// ================ Component Class ================ //

class Component {
    constructor(props, state) {
        const localParent = globalParent
        const localID = globalID++
        const { cache, children } = globalCache.get(localParent)

        if (cache[localID] == null) {
            cache[localID] = state
        }

        this.state = cache[localID]
        this.props = props

        this.setState = (newState) => {
            cache[localID] = typeof state === 'function' ? newState() : newState
            render(children, localParent, { keepHTML: false, updateCache: true })
        }

    }
}

// ================ Render Function and Exports ================ //

function render(element, root, opts = defaultOptions) {
    globalParent = root
    globalID = 0

    if (opts.updateCache) {
        globalCache.set(root, {
            children: element,
            ...(globalCache.get(root) || { cache: [] }) 
        })
    } else {
        globalCache.set(root, {
            children: element,
            cache: []
        })
    }

    const $node = renderNode(element)

    if (!opts.keepHTML) root.innerHTML = ''
    if ($node.childNodes || Array.isArray($node)) {
        ($node.childNodes || $node || []).forEach(child => {
            render(child, root, { keepHTML: true, updateCache: true })
        })
    } else {
        root.appendChild($node.node)
    }
    
    return $node
}

const Vine = {
    createNode,
    render,
    useState,
    useEffect,
    useMemo,
    useRunner,
    Component
}

export { Vine }