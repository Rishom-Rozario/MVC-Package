# Vine-JSX: A JSX Library

Looking for a lightweight JSX library for your next project? Introducing Vine JSX. It comes with React-like hooks to make development easier and fun. Web components and SSR support are also on the way.

## Getting Started

To install Vine JSX, sumply run:
```bash
npm install vine-jsx -D
```
After that, create a file, import Vine JSX and create your `index.jsx` file.
```js
import { Vine } from 'vine-jsx'
import { content } from './content.js' // Let's assume it's just a string

const App = (props) => (
    <>
        <h1>{ props.title }</h1>
        <main>
            <article>{ props.content }</article>
        </main>
    </>
)

Vine.render(
    <App title='Hello World' content={ content } />,
    document.getElementById('root')
)
```

This is pretty basic stuff. You can also use hooks to make your site more interactive.

```js
const { useState, useEffect, useMemo } = Vine

const Component = () => {
    const [count, setCount] = useState(0)

    return (
        <button onClick={ () => setCount(count + 1) }>{ count }</button>
    )
}
```

Vine JSX currently has `useState`, `useEffect` and `useMemo` hooks. More hooks will be included soon. Class components are also available. However, since functional components are considered to be much cleaner and are used more frequently, class components would very likely not be improved any further. To create a class component:

```js
class MyComponent extends Vine.Component {
    render(props) {
        return (
            <>
                <h1>{ props.title }</h1>
                <main>
                    <article>{ props.content }</article>
                </main>
            </>
        )
    }
}
```

To compile it, you can use a build tool like webpack. If you are not familiar with such build tools, don't worry. Read our **Webpack Setup** section to setup webpack to compile your files.

## Webpack Setup

The first step is to install `webpack` and a couple other things:
```bash
npm install webpack webpack-cli babel-loader @babel/core @babel/plugin-transform-react-jsx -D
```
Now you can configure webpack by writing a `webpack.config.js` file. Copy this code and paste it in your `webpack.config.js` file.
```js
const path = require('path')

module.exports = {
    target: 'web',
    mode: 'development',
    entry: './index.jsx',
    output: {
        clean: true,
        filename: 'index.min.js',
        path: path.resolve('./dist')
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/gm,
                exclude: /node_modules/gm,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            [
                                '@babel/plugin-transform-react-jsx',
                                {
                                    pragma: 'Vine.createNode',
                                    pragmaFrag: "'fragment'"
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    }
}
```

Now to compile your `index.jsx` run the following command:

```bash
npx webpack --config ./webpack.config.js
```

The filename of the generated file will be `index.min.js`. This file can be added to your `index.html`. There are many other things that you can do with webpack. Be sure to check out all the different loaders that you can use.