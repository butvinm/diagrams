# Third-party material

## KaTeX (vendored, shipped)

The plugin bundles [KaTeX](https://katex.org/) to typeset LaTeX math in diagram
labels. Its distribution files — `katex.min.css`, `katex.min.js`,
`contrib/auto-render.min.js`, and the woff2 fonts — are vendored under
`diagrams/kit/vendor/katex/` so rendering works offline. KaTeX is distributed
under the MIT License.

> The MIT License (MIT)
>
> Copyright (c) 2013-2020 Khan Academy and other contributors
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software. ...

Source: https://github.com/KaTeX/KaTeX (LICENSE).

## Mermaid (test fixtures)

The `tests/cases/*/ref.mmd` files are example diagram _sources_ taken from the
Mermaid project — its [`demos/`](https://github.com/mermaid-js/mermaid/tree/develop/demos)
examples and its [docs](https://mermaid.js.org/syntax/sequenceDiagram.html) (e.g.
the sequence-diagram activation and `alt`/`opt` examples) — used as references for
visual comparison only (rendered by `tests/lib/render-mermaid.mjs`). Mermaid is
distributed under the MIT License.

> MIT License
>
> Copyright (c) 2014–2022 Knut Sveidqvist
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. ...

Source: https://github.com/mermaid-js/mermaid (LICENSE).
