# Panda CSS Theming

> This document contains all theming documentation for Panda CSS

## Table of Contents

- [Animation Styles](#animation-styles)
- [Conditions](#conditions)
- [Theme](#theme)
- [Custom Font](#custom-font)
- [JSON Spec](#json-spec)
- [Layer Styles](#layer-styles)
- [Minimal setup](#minimal-setup)
- [Multiple Themes](#multiple-themes)
- [Patterns](#patterns)
- [Plugins](#plugins)
- [Presets](#presets)
- [Studio](#studio)
- [Text Styles](#text-styles)
- [Default Theme](#default-theme)
- [Token Categories](#token-categories)
- [Tokens](#tokens)
- [Typography](#typography)
- [Utilities](#utilities)

---


## Animation Styles

Define reusable animation css properties.

Animation styles focus solely on animations, allowing you to orchestrate animation properties.

## Defining Animation Styles

Animation styles are defined in the `animationStyles` property of the theme.

Here's an example of an animation style:

```js filename="animation-styles.ts"
import { defineAnimationStyles } from '@pandacss/dev'

export const animationStyles = defineAnimationStyles({
  'slide-fade-in': {
    value: {
      transformOrigin: 'var(--transform-origin)',
      animationDuration: 'fast',
      '&[data-placement^=top]': {
        animationName: 'slide-from-top, fade-in'
      },
      '&[data-placement^=bottom]': {
        animationName: 'slide-from-bottom, fade-in'
      },
      '&[data-placement^=left]': {
        animationName: 'slide-from-left, fade-in'
      },
      '&[data-placement^=right]': {
        animationName: 'slide-from-right, fade-in'
      }
    }
  }
})
```

> **Good to know:** The `value` property maps to style objects that will be applied to the element.

## Update the Config

To use the animation styles, we need to update the `config` object in the `panda.config.ts` file.

```js filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { animationStyles } from './animation-styles'

export default defineConfig({
  theme: {
    extend: {
      animationStyles
    }
  }
})
```

This should automatically update the generated theme with the specified `animationStyles`. If this doesn't happen, you
can run the `panda codegen` command.

## Using Animation Styles

Now we can use the `animationStyle` property in our components.

```jsx
import { css } from '../styled-system/css'

function App() {
  return (
    <div className={css({ animationStyle: 'slide-fade-in' })}>
      This is an element with slide-fade-in animation style.
    </div>
  )
}
```

Take advantage of it in your conditions:

```ts
export const popoverSlotRecipe = defineSlotRecipe({
  slots: anatomy.keys(),
  base: {
    content: {
      _open: {
        animationStyle: 'scale-fade-in'
      },
      _closed: {
        animationStyle: 'scale-fade-out'
      }
    }
  }
})
```

## Nesting animation styles

Animation styles support nested structures with a special `DEFAULT` key. This allows you to create variants of an
animation style while having a default fallback.

When you define a `DEFAULT` key within a nested animation style, you can reference the parent key directly to use the
default value.

```js filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      animationStyles: {
        fade: {
          DEFAULT: {
            value: {
              animationName: 'fade-in',
              animationDuration: '300ms',
              animationTimingFunction: 'ease-in-out'
            }
          },
          slow: {
            value: {
              animationName: 'fade-in',
              animationDuration: '600ms',
              animationTimingFunction: 'ease-in-out'
            }
          },
          fast: {
            value: {
              animationName: 'fade-in',
              animationDuration: '150ms',
              animationTimingFunction: 'ease-in-out'
            }
          }
        }
      }
    }
  }
})
```

Now you can use the default fade animation or specific speed variants:

```jsx
import { css } from '../styled-system/css'

function App() {
  return (
    <div>
      <div className={css({ animationStyle: 'fade' })}>Default fade speed</div>
      <div className={css({ animationStyle: 'fade.slow' })}>Slow fade</div>
      <div className={css({ animationStyle: 'fade.fast' })}>Fast fade</div>
    </div>
  )
}
```

## Best Practices

### Avoid Overuse

To ensure the performance and readability of your design system, avoid overusing animations. Use them sparingly to
enhance user experience without overwhelming the user.

### Consistent Naming Conventions

We recommend using consistent naming conventions for animation styles. Here are common ideas on how to name animation
styles:

- Based on the type of animation (`slide`, `fade`, `bounce`)
- Based on the direction or trigger (`slide-from-top`, `fade-in`, `bounce-on-click`)
- Descriptive or functional names that explain the style's intended use (`modal-open`, `button-hover`, `alert-show`)

By following these guidelines, you can create a clear and maintainable animation system in your design.


---


## Conditions

Add your own named conditions, like _hover or dark, on top of Panda's built-in set.

A condition is a name you can use as a style key, `_hover`, `_dark`, `md`, that expands to a selector or at-rule.
This page is about defining your own, on top of the [built-in ones](/docs/styling/conditional-styles#reference).

## Creating a condition

Add a condition under `conditions.extend`. Here's a `groupHover` condition that styles a child when a parent with
`role="group"` is hovered:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  conditions: {
    extend: {
      groupHover: '[role=group]:where(:hover, [data-hover]) &'
    }
  }
})
```

The `&` is required. It's the placeholder for whatever selector the condition ends up applied to, and it has to sit
at the start or the end of the string.

Run codegen to generate the `_groupHover` key:

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm panda codegen
    ```
  </Tab>
  <Tab>
    ```bash
    npm panda codegen
    ```
  </Tab>
  <Tab>
    ```bash
    yarn panda codegen
    ```
  </Tab>
  <Tab>
    ```bash
    bun panda codegen
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

```jsx
import { css } from '../styled-system/css'

function App() {
  return (
    <div role="group">
      <span
        className={css({
          color: { base: 'blue.400', _groupHover: 'blue.600' }
        })}
      />
    </div>
  )
}
```

## Overriding a built-in condition

`conditions.extend` also lets you replace what a built-in condition does. Here's `dark` redefined to also match a
`data-theme` attribute, on top of the `.dark` class it already matches:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  conditions: {
    extend: {
      dark: '.dark &, [data-theme="dark"] &'
    }
  }
})
```

Run codegen again after any change here, built-in or custom, since the condition's expansion is baked into the
generated `styled-system` package.

## Referencing tokens

A condition's selector string can call `token()`, and it resolves the same way it would inside a style object:

```tsx
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  conditions: {
    extend: {
      mq: '@media (min-width: token(sizes.4xl))',
      size2: '&[data-size=token(spacing.2)]'
    }
  }
})
```

## Combining multiple rules under one name

Give a condition an object instead of a string. Each key nests inside the one above it, and `@slot` marks where the
styles go:

```tsx
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  conditions: {
    extend: {
      supportHover: {
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': '@slot'
        }
      }
    }
  }
})
```

```ts
import { css } from '../styled-system/css'

css({
  _supportHover: {
    color: 'red'
  }
})
```

generates:

```css
@media (hover: hover) and (pointer: fine) {
  .supportHover\:color_red:hover {
    color: red;
  }
}
```

## One condition, several independent blocks

The same object form can also emit separate CSS blocks, each with its own at-rule, not nested inside each other. A
common case is hover feedback on pointer devices and press feedback on touch devices, two different media queries, same
condition name.

Each path from the root down to an `@slot` becomes its own CSS block:

```tsx
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  conditions: {
    extend: {
      hoverActive: {
        '@media (hover: hover)': {
          '&:is(:hover, [data-hover])': '@slot'
        },
        '@media (hover: none)': {
          '&:is(:active, [data-active])': '@slot'
        }
      }
    }
  }
})
```

```ts
import { css } from '../styled-system/css'

css({
  _hoverActive: {
    bg: 'red'
  }
})
```

generates two independent blocks:

```css
@media (hover: hover) {
  .hoverActive\:bg_red:is(:hover, [data-hover]) {
    background: red;
  }
}
@media (hover: none) {
  .hoverActive\:bg_red:is(:active, [data-active]) {
    background: red;
  }
}
```


## Container queries

Type-safe container queries are their own topic. See
[container queries](/docs/styling/conditional-styles#container-queries).

## Starting from zero

Everything here assumes you're extending Panda's defaults with `conditions.extend`. For no built-in conditions at
all, see [minimal setup](/docs/theming/minimal-setup).


---


## Theme

Add to a preset's breakpoints, tokens, keyframes and recipes with extend, or replace them without it.

Everything under a Panda config's `theme` key can be customized. Put your changes under `theme.extend` and Panda merges
them into what a preset already defined. Write them directly under `theme` instead and yours replaces it.

## Adding to the defaults

Put a new value under `theme.extend.<key>` and Panda merges it in alongside whatever's already there.

**Breakpoints.** Add a `3xl` on top of the defaults (`sm`, `md`, `lg`, `xl`, `2xl`):

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      breakpoints: {
        '3xl': '1800px'
      }
    }
  }
})
```

**Tokens.** Add a `brand` color alongside every color Panda ships:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#EA8433' }
        }
      }
    }
  }
})
```

**Keyframes.** Add `fadein` alongside the defaults (`spin`, `ping`, `pulse`, `bounce`):

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      keyframes: {
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  }
})
```

**Recipes.** Register a new [config recipe](/docs/recipes/config-recipe) without touching any recipe a preset already
registered:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      recipes: {
        button: buttonRecipe
      }
    }
  }
})
```

Recipes aren't tokens, so there's no default list to show. A fresh config has none until you or a preset registers one.

See every other token category (spacing, radii, shadows, sizing, fonts, font sizes) on
[Default Theme](/docs/theming/theme).

## Overriding one value

The merge is per key, so you can replace a single entry and keep the rest of the category untouched.

**Breakpoints.** Redefine `md` from `768px` to `800px`. `sm`, `lg`, `xl`, and `2xl` stay exactly as they were:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      breakpoints: {
        md: '800px'
      }
    }
  }
})
```

**Tokens.** Redefine `blue.500`. Every other shade in the scale, `blue.50` through `blue.950`, stays:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          blue: {
            500: { value: '#2563eb' }
          }
        }
      }
    }
  }
})
```

**Keyframes.** Redefine `spin`. `ping`, `pulse`, and `bounce` stay:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      keyframes: {
        spin: {
          to: { transform: 'rotate(180deg)' }
        }
      }
    }
  }
})
```

**Recipes.** A preset's `button` recipe keeps its `variants`. Override just `className`, `base`, and `jsx`:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      recipes: {
        button: {
          className: 'btn',
          base: { rounded: 'full' },
          jsx: ['Button', 'LinkButton']
        }
      }
    }
  }
})
```

## Skipping extend

Skip `extend` and what you write replaces what a preset defined, rather than merging into it. You replace the thing you
name, and its siblings are untouched.

**One token scale.** The preset's colors are gone and only `brand` is left. `spacing`, `fonts` and every other scale
stay:

```ts
theme: {
  tokens: {
    colors: {
      brand: {
        value: '#EA8433'
      }
    }
  }
}
```

**One recipe.** Your `button` replaces the preset's, variants and all. Every other recipe it registered stays:

```ts
theme: {
  recipes: {
    button: buttonRecipe
  }
}
```

**One keyframe.** `fadein` replaces a preset keyframe of the same name. `spin`, `ping`, `pulse` and `bounce` stay:

```ts
theme: {
  keyframes: {
    fadein: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    }
  }
}
```

**Breakpoints are the exception**, because a breakpoint is a single value rather than a definition you could replace.
Write them without `extend` and the whole set goes, leaving only `3xl`:

```ts
theme: {
  breakpoints: {
    '3xl': '1800px'
  }
}
```

Add `extend` back to any of these and the preset's values return, alongside whatever you added.

## Starting from zero

Everything here assumes you're extending a preset's theme. For no default tokens, breakpoints, or keyframes at all, see
[Minimal setup](/docs/theming/minimal-setup).

## See also

- [Default Theme](/docs/theming/theme)
- [Token Categories](/docs/theming/token-categories)
- [Animation Styles](/docs/theming/animation-styles)
- [Config recipes](/docs/recipes/config-recipe)
- [Presets](/docs/theming/presets)
- [Minimal setup](/docs/theming/minimal-setup)


---


## Custom Font

How to use custom fonts in your project.

Adding custom fonts to your application or website is a typical requirement for projects. Panda recommends using custom
fonts through CSS variables for consistency.

## Setup

### Next.js

Next.js provides a built-in automatic self-hosting for any font file by using the `next/font` module. It allows you to
conveniently use all Google Fonts and any local font with performance and privacy in mind.

Here's an example of how to load a local "Mona Sans" font and a Google Font "Fira Code" in your Next.js project.

```js filename="styles/font.ts"
import { Fira_Code } from 'next/font/google'
import localFont from 'next/font/local'

export const MonaSans = localFont({
  src: '../fonts/Mona-Sans.woff2',
  display: 'swap',
  variable: '--font-mona-sans'
})

export const FiraCode = Fira_Code({
  weight: ['400', '500', '700'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-fira-code'
})
```

> Ideally, you should load the font in the layout file.

Next, you need to add the font variables to your HTML document. You can do this using either the App Router or the Pages
Router.

#### App Router

```jsx filename="app/layout.tsx"
import { FiraCode, MonaSans } from '../styles/font'

export default function Layout(props) {
  const { children } = props
  return (
    <html className={`${MonaSans.variable} ${FiraCode.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

> **Note 🚨:** By default, Next.js attaches the className for the fonts to the `<body>` element, for panda to
> appropriately load fonts, update the code to attach the `className` to the `<html>` element.

#### Pages Router

```jsx filename="pages/_app.tsx"
import { FiraCode, MonaSans } from '../styles/font'

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-mona-sans: ${MonaSans.style.fontFamily};
            --font-fira-code: ${FiraCode.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  )
}
```

### Fontsource

[Fontsource](https://fontsource.org/) streamlines the process of integrating fonts into your web application.

To begin, install your desired font package:

```bash
pnpm add @fontsource-variable/fira-code
```

Next, import the font into your project:

```jsx
import '@fontsource-variable/fira-code'
```

Lastly, create a variable to use it as a token in the panda config

```css filename="styles/font.css"
:root {
  --font-fira-code: 'Fira Code Variable', monospace;
}
```

### Vanilla CSS

You can leverage the native font-face CSS property to load custom fonts in your project.

```css
@font-face {
  font-family: 'Mona Sans';
  src: url('../fonts/Mona-Sans.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Then alias the font names to css variables.

```css
:root {
  --font-mona-sans: 'Mona Sans', sans-serif;
}
```

### Global Font Face

You can also define global font face in your panda config.

```js
export default defineConfig({
  globalFontface: {
    Fira: {
      src: 'url(/fonts/fira.woff2) format("woff2")',
      fontWeight: 400,
      fontStyle: 'normal',
      fontDisplay: 'swap'
    }
  }
})
```

You can also define multiple font sources for the same weight.

```js
export default defineConfig({
  globalFontface: {
    Fira: {
      src: ['url(/fonts/fira.woff2) format("woff2")', 'url(/fonts/fira.woff) format("woff")'],
      fontWeight: 400,
      fontStyle: 'normal',
      fontDisplay: 'swap'
    }
  }
})
```

You can also define multiple font weights.

```js
export default defineConfig({
  globalFontface: {
    Fira: [
      {
        src: 'url(/fonts/fira.woff2) format("woff2")',
        fontWeight: 400,
        fontStyle: 'normal',
        fontDisplay: 'swap'
      },
      {
        src: 'url(/fonts/fira-bold.woff2) format("woff2")',
        fontWeight: 700,
        fontStyle: 'normal',
        fontDisplay: 'swap'
      }
    ]
  }
})
```

Then expose the font names to css variables.

```css
:root {
  --font-fira-code: 'Fira Code Variable', monospace;
}
```

You can also use [globalVars](/docs/styling/writing-styles#global-vars) in your panda config to define the variables.

```js
export default defineConfig({
  globalVars: {
    '--font-fira-code': 'Fira Code Variable, monospace'
  }
})
```

## Update Panda Config

```js
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fonts: {
          fira: { value: 'var(--font-fira-code), Menlo, monospace' },
          mona: { value: 'var(--font-mona-sans), sans-serif' }
        }
      }
    }
  }
})
```

## Use the custom fonts

```jsx
import { css } from '../styled-system/css'

function Page() {
  return (
    <div>
      <h1 className={css({ fontFamily: 'mona' })}>Mona Sans</h1>
      <code className={css({ fontFamily: 'fira' })}>Fira Code</code>
    </div>
  )
}
```


---


## JSON Spec

Read your design system as JSON to render tokens in your own docs site or Storybook.

`panda codegen --spec` writes `styled-system/specs/design-system.json` — every token, condition and theme in one file.
It's there so you can render your own palette, spacing scale and type without reaching into `styled-system` internals.

Your CSS doesn't need the file, so it's opt-in:

```sh
panda codegen --spec            # styled-system/specs/design-system.json
panda codegen --spec=meta.json  # or wherever you want it
```

`panda build --spec` writes it as part of a full build.

The file is generated. Edit your tokens in `panda.config.ts`, not here.

## Read the spec

It's a normalized index rather than a list of tokens, so don't walk it by hand. `@pandacss/compiler-shared` ships the
reader:

```ts
import { parseDesignSystem, indexDesignSystem } from '@pandacss/compiler-shared'
import spec from 'styled-system/specs/design-system.json'

const parsed = parseDesignSystem(spec)
if (!parsed.ok) throw new Error(parsed.error)

const ds = indexDesignSystem(parsed.value)
```

`parseDesignSystem` takes the imported object or a raw string. It's what turns a schema change into a sentence rather
than an `undefined` three components deep:

```
Document is schemaVersion 99; this build reads 1. Upgrade @pandacss/compiler-shared.
```

`ds.categories()` lists what's there. `ds.view(category)` returns render-ready rows:

```ts
ds.view('colors')
// [{ path: 'colors.red.500', name: 'red.500', value: 'oklch(63.7% 0.237 25.331)', cssVar: '--colors-red-500' }]
```

`path` is what the other methods take. `name` is what you type in `css({ ... })`.

`spec.tokens[path].originalValue` carries the base token's value before reference expansion or derivation, when Panda
retains it. For example, a token referencing `{colors.red.500}` keeps that string while its resolved value is a color.
The field is omitted when no original value was retained; it does not vary with the selected condition or theme.

## Render a category

```tsx
import { grid } from 'styled-system/patterns'

export function Colors({ ds }) {
  return (
    <div className={grid({ columns: 3, gap: '4', padding: '6' })}>
      {ds.view('colors').map(token => (
        <div key={token.path}>
          <div style={{ background: token.value, height: 64, borderRadius: 8 }} />
          <p>{token.name}</p>
          <p>{token.value}</p>
        </div>
      ))}
    </div>
  )
}
```

Swap `'colors'` for any category `ds.categories()` reports. Every row has the same shape, so one component renders them
all.

## Theme-aware tokens

A semantic token carries one value per condition. `ds.states(path)` returns them, base first. A token that doesn't vary
returns a single row, so you can render every token the same way:

```ts
ds.states('colors.fg')
// [{ token: 'colors.fg', value: '#ef4444' },
//  { token: 'colors.fg', condition: '_dark', value: '#2563eb' }]
```

```tsx
export function SemanticColors({ ds }) {
  return (
    <div>
      {ds.view('colors').map(token => (
        <div key={token.path}>
          <p>{token.name}</p>
          {ds.states(token.path).map(state => (
            <div key={state.condition ?? 'base'} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: state.value, width: 24, height: 24, borderRadius: 6 }} />
              <span>{state.condition ?? 'base'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

`ds.variants()` reports which theme and condition combinations actually carry overrides, so you can build a switcher
without guessing. To resolve a whole category under one of them, pass it to `view`:

```ts
ds.view('colors', { condition: '_dark' })
```

## Recipes, patterns and composition styles

The same file lists the rest of the system, each as a table keyed by name. A table the system doesn't use is left out.

```ts
ds.recipes().button
// { className: 'btn', variants: { size: { values: ['md', 'sm'], allowsBoolean: false } }, defaultVariants: { size: 'md' } }

ds.patterns().stack.properties.gap
// { kind: 'token', category: 'spacing', description: 'Space between' }

ds.composition('textStyles')
// { body: { description: 'Paragraph copy' }, 'heading.lg': {} }
```

`slotRecipes()`, `keyframes()` and `colorPalettes()` read the same way. A pattern property's `kind` is what typegen
resolved for it: `enum` with its values, `token` with its category, `property` with the CSS property, or a `primitive`.

## Where a token came from

The spec carries a `sources` section: every preset and config that contributed, and which one defined each token.

```ts
const owner = (path: string) => spec.sources.entries[spec.tokens[path].source]

owner('colors.bg.neutral') // { kind: 'preset', name: '@acme/foundations' }
owner('colors.accent') // { kind: 'config', file: 'panda.config.ts' }
```

Each token carries a `source` index into `sources.entries`, the same way a value points at a condition. A token Panda
can't place has no `source`. Themes carry theirs too; conditions have no row of their own, so they sit in
`sources.conditions`.

## Ship it with a library

`panda lib --spec` writes the spec beside `preset.mjs` rather than into an app's `styled-system`:

```sh
panda lib --spec
# dist/panda/design-system.json
```

`panda/lib.json` records it as `spec`, so tooling that reads the manifest can tell whether a package shipped one. Keep
it inside what you publish: a path `"files"` would drop is left out of the manifest with a warning.

Ship it when you want consumers to render your tokens without running Panda themselves. It's large next to the rest of
`panda lib` output, and anyone who installs your preset can generate their own from `preset.mjs`, so it stays a choice.

## See also

- [Studio](/docs/theming/studio) renders the same file with no setup
- [Tokens](/docs/theming/tokens) for the token format itself


---


## Layer Styles

Define reusable container styles properties.

Layer styles provide a way to create consistent and visually appealing elements.

- Color or text color
- Background color
- Border width and border color
- Box shadow
- Opacity

## Defining layer styles

Layer styles are defined in the `layerStyles` property of the theme.

Here's an example of a layer style:

```js filename="layer-styles.ts"
import { defineLayerStyles } from '@pandacss/dev'

const layerStyles = defineLayerStyles({
  container: {
    description: 'container styles',
    value: {
      background: 'gray.50',
      border: '2px solid',
      borderColor: 'gray.500'
    }
  }
})
```

> **Good to know:** The `value` property maps to style objects that will be applied to the element.

## Update the config

To use the layer styles, we need to update the `config` object in the `panda.config.ts` file.

```js filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { layerStyles } from './layer-styles'

export default defineConfig({
  theme: {
    extend: {
      layerStyles
    }
  }
})
```

This should automatically update the generated theme the specified `layerStyles`. If this doesn't happen, you can run
the `panda codegen` command.

## Using layer styles

Now we can use `layerStyle` property in our components.

```jsx
import { css } from '../styled-system/css'

function App() {
  return <div className={css({ layerStyle: 'container' })}>This is inside a container style</div>
}
```

## Nesting layer styles

Layer styles support nested structures with a special `DEFAULT` key. This allows you to create variants of a layer style
while having a default fallback.

When you define a `DEFAULT` key within a nested layer style, you can reference the parent key directly to use the
default value.

```js filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      layerStyles: {
        card: {
          DEFAULT: {
            value: {
              background: 'white',
              border: '1px solid',
              borderColor: 'gray.200',
              borderRadius: 'md',
              boxShadow: 'sm'
            }
          },
          elevated: {
            value: {
              background: 'white',
              border: 'none',
              borderRadius: 'lg',
              boxShadow: 'lg'
            }
          },
          outlined: {
            value: {
              background: 'transparent',
              border: '2px solid',
              borderColor: 'gray.300',
              borderRadius: 'md',
              boxShadow: 'none'
            }
          }
        }
      }
    }
  }
})
```

Now you can use the default card style or specific variants:

```jsx
import { css } from '../styled-system/css'

function App() {
  return (
    <div>
      <div className={css({ layerStyle: 'card' })}>Default card style</div>
      <div className={css({ layerStyle: 'card.elevated' })}>Elevated card</div>
      <div className={css({ layerStyle: 'card.outlined' })}>Outlined card</div>
    </div>
  )
}
```


---


## Minimal setup

Start with zero tokens and zero utilities, and add back only what you need.

`panda init` scaffolds `presets: ['@pandacss/preset-base', '@pandacss/preset-panda']` by default, so a fresh project
already has a full token set and every built-in utility. This page is for the opposite case: you want to define your
own tokens and only the utilities you actually use, nothing pulled in for you.

## Start from zero

Run `panda init --skip-presets` instead of a plain `panda init`, and your config comes out with an empty `presets`
array. If you already ran `panda init`, get the same result by hand:

```ts
export default defineConfig({
  // ...
  presets: []
})
```

Panda doesn't add `@pandacss/preset-base` or `@pandacss/preset-panda` on its own, ever. `presets: []` (or
`--skip-presets`) just skips the two `panda init` would have added for you.

## Add your own tokens

With no preset, `theme.tokens` isn't extending anything, so you write your full token set directly (no `extend` key
needed):

```ts
export default defineConfig({
  // ...
  presets: [],
  theme: {
    tokens: {
      colors: {
        primary: { value: '#ff0000' }
      }
    }
  }
})
```

## Wire a token to a CSS property

A token by itself isn't usable in `css()` yet. `@pandacss/preset-base` is what maps a CSS property like `color` to a
token category like `colors`, so without it, you have to tell Panda that mapping yourself:

```ts
export default defineConfig({
  // ...
  presets: [],
  utilities: {
    color: {
      values: 'colors'
    }
  },
  theme: {
    tokens: {
      colors: {
        primary: { value: '#ff0000' }
      }
    }
  }
})
```

That's what makes `css({ color: 'primary' })` resolve to your token instead of erroring or falling through to a raw
CSS value.

## Add a preset back selectively

You don't have to choose all-or-nothing. Add `@pandacss/preset-base` back once you want its utilities without its
opinions, and skip `@pandacss/preset-panda` (the token set) entirely if you're only after your own colors and
spacing:

```ts
export default defineConfig({
  // ...
  presets: ['@pandacss/preset-base']
})
```

`@pandacss/preset-panda` is the other direction: an opinionated token set, no strong utility choices of its own.
Install and list whichever ones you actually want:

```ts
export default defineConfig({
  // ...
  presets: ['@pandacss/preset-panda']
})
```


---


## Multiple Themes

Ship several complete looks, each with light and dark, from one set of tokens.

A product rarely ships with one look. Dark mode comes first, then a customer's brand, a high-contrast variant, a
seasonal skin. Each is the same request: the same components, different values.

Components read roles like `bg: 'surface'`; a theme is what those roles resolve to, and a
mode is the shade inside it. One attribute picks the theme, one class picks the mode, and no component knows either
exists.

Let's build two themes on a neutral default, each with its own light and dark mode:

- `matcha`: green accent, rounder controls. Two tokens change.
- `gothic`: purple accent on a darker canvas, square corners, serif type. Four tokens change.

Then ship them: all in one stylesheet, or loaded on demand.

## Semantic tokens

Name tokens after their role, and give every value both modes. With the base preset, `_dark` means "inside an element
with the `dark` class".

```ts filename="panda.config.ts"
semanticTokens: {
  colors: {
    canvas: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.900}' } },
    surface: { value: { base: '{colors.white}', _dark: '{colors.gray.800}' } },
    fg: { value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' } },
    accent: { value: { base: '{colors.blue.600}', _dark: '{colors.blue.300}' } }
  },
  radii: { control: { value: '{radii.sm}' } },
  fonts: { body: { value: '{fonts.sans}' } }
}
```

```tsx
<div className={css({ bg: 'surface', color: 'fg', borderRadius: 'control', fontFamily: 'body' })}>
  <button className={css({ bg: 'accent' })}>Buy</button>
</div>
```

```html
<html class="dark"></html>
```

Toggle the class and the card flips. Nothing in the component knows about dark mode.

## Themes

`themes` holds alternative token values behind one attribute. Override only what differs from the default.

```ts filename="panda.config.ts"
themes: {
  matcha: {
    semanticTokens: {
      colors: { accent: { value: { base: '{colors.green.700}', _dark: '{colors.green.300}' } } },
      radii: { control: { value: '{radii.xl}' } }
    }
  },
  gothic: {
    semanticTokens: {
      colors: {
        canvas: { value: { base: '{colors.gray.100}', _dark: '{colors.black}' } },
        accent: { value: { base: '{colors.purple.700}', _dark: '{colors.purple.300}' } }
      },
      radii: { control: { value: '{radii.none}' } },
      fonts: { body: { value: '{fonts.serif}' } }
    }
  }
}
```

```html
<html data-panda-theme="gothic"></html>
```

Same card, same button: now purple, square corners, serif type. Swap the attribute to `matcha` for green and round.

## Ship the CSS

Panda emits nothing for `themes` until you say how to ship them. Pick one.

### In the main stylesheet

List the themes in `staticCss.themes`. Each becomes a block of variables in the `tokens` layer, holding only what it
overrides.

```ts filename="panda.config.ts"
staticCss: {
  themes: ['matcha', 'gothic']
}
```

```css
@layer tokens {
  :where(:root, :host) {
    --colors-canvas: var(--colors-gray-50);
    --colors-accent: var(--colors-blue-600);
    --fonts-body: var(--fonts-sans);
    --radii-control: var(--radii-sm);
  }
  [data-panda-theme='gothic'] {
    --colors-canvas: var(--colors-gray-100);
    --colors-accent: var(--colors-purple-700);
    --fonts-body: var(--fonts-serif);
    --radii-control: var(--radii-none);
  }
  [data-panda-theme='matcha'] {
    --colors-accent: var(--colors-green-700);
    --radii-control: var(--radii-xl);
  }
}
```

No runtime, one request. You pay for every theme on every page.

### On demand

The generated `styled-system/themes` module has every theme as its own JSON file, fetched only when asked for.

```ts
import { getTheme, injectTheme } from '../styled-system/themes'

const theme = await getTheme('gothic')
//    ^? { name: 'gothic'; id: string; css: string }

injectTheme(document.documentElement, theme)
```

`injectTheme` sets `data-panda-theme` on the element and appends a `<style>` with the theme's variables. It returns that
style element.

Choose this when you have many themes or the user picks one at runtime. The two options are independent: the module
always exists, the static CSS only includes what you list.

## Theme attribute

A theme declares its values on the element that carries the attribute, and everything inside inherits them.

**The whole page.** Put it on `<html>`.

```html /data-panda-theme="gothic"/
<html data-panda-theme="gothic">
  <body>
    …
  </body>
</html>
```

**One subtree.** Put it on any element: a sidebar, a preview, an embedded widget. Only that subtree changes.

```html /data-panda-theme="matcha"/
<html>
  <body>
    <aside data-panda-theme="matcha">…</aside>
  </body>
</html>
```

**Nested themes.** The nearest one wins, in either direction.

```html /data-panda-theme="gothic"/ /data-panda-theme="matcha"/
<html data-panda-theme="gothic">
  <body>
    <aside data-panda-theme="matcha">…</aside>
  </body>
</html>
```

**With dark mode.** `class="dark"` can sit on the same element, above the theme, or inside it. Both compose.

```html /class="dark"/ /data-panda-theme="gothic"/ /data-panda-theme="matcha"/
<html class="dark" data-panda-theme="gothic">
  <body>
    <aside data-panda-theme="matcha">…</aside>
  </body>
</html>
```

```css
.dark [data-panda-theme='gothic'],
[data-panda-theme='gothic'].dark,
[data-panda-theme='gothic'] .dark {
  --colors-canvas: var(--colors-black);
  --colors-accent: var(--colors-purple-300);
}
```

Here the page is dark gothic and the aside is dark matcha: the theme picked the palette, dark mode picked the shade.
Tokens a theme doesn't touch, like `surface`, keep the default's light and dark values.

## Theme condition

Every theme also gets a condition, `_theme` plus the capitalized name. Use it when a theme needs a structural change
rather than a different token value.

```tsx /_themeGothic/
const title = css({
  fontFamily: 'body',
  _themeGothic: {
    textTransform: 'uppercase'
  }
})
```

The condition matches the theme root and everything inside it:

```css
.themeGothic\:text-transform_uppercase:where([data-panda-theme='gothic'], [data-panda-theme='gothic'] *) {
  text-transform: uppercase;
}
```

Reach for tokens first. A theme that is only token overrides stays swappable, and components stay unaware of it.

## Server rendering

Read the choice on the server, inline the theme CSS, and set the attribute before the first paint.

```tsx filename="app/layout.tsx"
import { cookies } from 'next/headers'
import { getTheme, type ThemeName } from '../styled-system/themes'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const name = cookies().get('theme')?.value as ThemeName | undefined
  const theme = name ? await getTheme(name) : undefined

  return (
    <html lang="en" data-panda-theme={name}>
      <head>{theme && <style id={theme.id} dangerouslySetInnerHTML={{ __html: theme.css }} />}</head>
      <body>{children}</body>
    </html>
  )
}
```

On the client, switching is the same two calls plus storing the choice.

```tsx
const next = current === 'gothic' ? 'matcha' : 'gothic'
injectTheme(document.documentElement, await getTheme(next))
document.cookie = `theme=${next}; path=/`
```

## Theme contract

A theme that forgets a token silently falls back to the default. `defineThemeContract` turns that into a type error.

```ts filename="panda.config.ts"
import { defineConfig, defineThemeContract } from '@pandacss/dev'

const defineTheme = defineThemeContract({
  semanticTokens: { colors: { accent: { value: '' } } }
})

export default defineConfig({
  themes: {
    matcha: defineTheme({ semanticTokens: { colors: { accent: { value: '{colors.green.700}' } } } }),
    gothic: defineTheme({ semanticTokens: { colors: {} } })
    //                                     ^ Property 'accent' is missing
  }
})
```


---


## Patterns

Change what the built-in layout patterns do, or turn the layouts your app repeats into patterns of its own.

The built-in [layout patterns](/docs/styling/patterns) cover what every app needs. Your app has layouts of its own
that they don't cover: a scrollable region, a two-pane view with a fixed sidebar, a sticky header that clears the
nav. Today those live as copied style objects, and they drift.

A custom pattern gives such a layout a name, a small set of typed props, and one place to change it. After codegen
it behaves exactly like a built-in: a function, a JSX component, responsive props, and build-time extraction.

Everything on this page goes under `patterns.extend` in the config, and takes effect after `panda codegen`.

## Change a default

Start small. Built-ins carry defaults, and `defaultValues` overrides them. The base preset gives `stack` a gap of
eight pixels; most design systems want a spacing token there instead.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  patterns: {
    extend: {
      stack: {
        defaultValues: { gap: '4' }
      }
    }
  }
})
```

A `gap` at the call site still wins. `hstack` and `vstack` are separate patterns with their own defaults, so change
each one you use.

## Narrow a prop

`properties` describes what a pattern accepts. Overriding one entry under `extend` replaces that prop's definition
and leaves the rest alone. Here `flex` is limited to two directions:

```ts filename="panda.config.ts"
export default defineConfig({
  patterns: {
    extend: {
      flex: {
        properties: {
          direction: { type: 'enum', value: ['row', 'column'] }
        }
      }
    }
  }
})
```

## Write a pattern

A pattern is `properties` for its props and a `transform` that turns them into a style object. Keep each one in its
own file with `definePattern`, which types the props for you, then register it.

```ts filename="patterns/scroll-area.ts"
import { definePattern } from '@pandacss/dev'

export const scrollArea = definePattern({
  properties: {
    axis: { type: 'enum', value: ['x', 'y'] },
    hideScrollbar: { type: 'boolean' }
  },
  defaultValues: {
    axis: 'y',
    hideScrollbar: false
  },
  transform(props, { map }) {
    const { axis, hideScrollbar, ...rest } = props
    return {
      overflowX: map(axis, (v) => (v === 'x' ? 'auto' : 'hidden')),
      overflowY: map(axis, (v) => (v === 'y' ? 'auto' : 'hidden')),
      scrollbarWidth: hideScrollbar ? 'none' : undefined,
      '&::-webkit-scrollbar': { display: hideScrollbar ? 'none' : undefined },
      ...rest
    }
  }
})
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { scrollArea } from './patterns/scroll-area'

export default defineConfig({
  patterns: {
    extend: { scrollArea }
  }
})
```

```sh
panda codegen
```

Spread `rest` last so callers can still pass any style property. `map` is explained under
[Responsive props](#responsive-props). The generated pattern then has the same three forms as a built-in one:

```tsx
import { scrollArea } from '../styled-system/patterns'
import { ScrollArea } from '../styled-system/jsx'

scrollArea({ axis: 'x' })
scrollArea.raw({ axis: 'x' })
<ScrollArea axis="x" />
```

The function returns a class name. `raw` returns the style object, for composing into `css()` or a recipe. The
component renders a `div` with the props applied.

## Property types

The `type` of each property decides how the prop is typed and how its value resolves:

```ts
properties: {
  // Typed and resolved like that CSS property. Most props are this.
  align: { type: 'property', value: 'alignItems' },

  // A fixed set of strings.
  size: { type: 'enum', value: ['sm', 'md', 'lg'] },

  // A token from that category, resolved through the given CSS property,
  // so `thickness: '1'` becomes the `sizes.1` variable.
  thickness: { type: 'token', value: 'sizes', property: 'borderWidth' },

  // Plain values, handed to `transform` as they are.
  columns: { type: 'number' },
  inline: { type: 'boolean' },
  label: { type: 'string' },

  // `description` becomes the JSDoc on the generated prop.
  ratio: { type: 'number', description: 'Width divided by height' }
}
```

## Responsive props

Callers can pass any pattern prop as a breakpoint object, the same way they would a style property. A list that
scrolls sideways on phones and down on wider screens:

```tsx
<ScrollArea axis={{ base: 'x', md: 'y' }}>{items}</ScrollArea>
```

Inside `transform`, that prop arrives as the object, not a string, so a direct comparison like `axis === 'x'` is
never true. The `map` helper runs your function once per breakpoint value and builds the responsive result for you:

```ts
transform(props, { map }) {
  const { axis, ...rest } = props
  return {
    overflowX: map(axis, (v) => (v === 'x' ? 'auto' : 'hidden')),
    overflowY: map(axis, (v) => (v === 'y' ? 'auto' : 'hidden')),
    ...rest
  }
}
```

For the call above, `overflowX` becomes `{ base: 'auto', md: 'hidden' }`. Use `map` whenever the output depends on
the value. A prop passed straight through, like `gap` in `stack`, needs no helper.

## Dynamic defaults

`defaultValues` can be a function of the incoming props. The base preset's `grid` sets a default gap only when the
caller hasn't set a more specific one:

```ts
defaultValues(props) {
  return { gap: props.columnGap || props.rowGap ? undefined : '8px' }
}
```

## Value helpers

Alongside `map`, `transform` receives three checks for props that accept both tokens and raw CSS:

```ts
transform(props, { map, isCssUnit, isCssVar, isCssFunction }) {
  const { inline, ...rest } = props
  // '12px', '2rem', '50%'      → isCssUnit
  // 'var(--gutter)'            → isCssVar
  // 'calc(…)', 'clamp(…)'      → isCssFunction
  const resolve = (v: string) => (isCssUnit(v) || isCssVar(v) ? v : `token(spacing.${v}, ${v})`)
  return {
    '--bleed-x': map(inline, resolve),
    marginInline: 'calc(var(--bleed-x, 0) * -1)',
    ...rest
  }
}
```

This is how the base preset's `bleed` accepts `inline: '6'` and `inline: '2rem'` alike.

## Restrict props

By default a pattern accepts its own props plus every style property, so callers can add padding or a background to
a `scrollArea` without a wrapper. Two options tighten that at the type level.

`strict` keeps only the props in `properties`. Use it for a pattern that shouldn't double as a styling escape hatch:

```ts filename="patterns/scroll-area.ts"
export const scrollArea = definePattern({
  strict: true,
  // ...
})
```

```tsx
scrollArea({ axis: 'x', p: '4' })
//                     ^ Object literal may only specify known properties, and 'p' does not exist
```

`blocklist` allows everything except the listed properties. Use it when the pattern owns a property and a caller
overriding it would break the layout:

```ts filename="patterns/scroll-area.ts"
export const scrollArea = definePattern({
  blocklist: ['overflow', 'overflowX', 'overflowY'],
  // ...
})
```

```tsx
scrollArea({ axis: 'x', p: '4', overflow: 'visible' })
//                              ^ Object literal may only specify known properties, and 'overflow' does not exist
```

`blocklist` is marked experimental in the types.

## JSX hints

With `jsxFramework` set, each pattern also becomes a component. Its name is the pattern name in PascalCase, so
`scrollArea` gives `ScrollArea`. Three options shape it:

```ts filename="patterns/scroll-area.ts"
export const scrollArea = definePattern({
  // Component name. Defaults to `ScrollArea` here.
  jsxName: 'ScrollArea',
  // Element it renders. Defaults to `div`.
  jsxElement: 'section',
  // Extra component names, or regexes, that count as usages of this pattern during extraction.
  jsx: ['ScrollArea', /ScrollArea$/],
  // ...
})
```

`jsxName` is about what codegen emits. `jsx` is about what extraction recognizes, and matters when you wrap the
generated component in one of your own, like a `PageScrollArea`. See
[Wrapping a pattern component](/docs/styling/patterns#wrapping-a-pattern-component).

## Common mistakes

**Missing `extend`.** Without it, your patterns replace every built-in one.

```ts
// ❌ stack, grid, center… are gone
patterns: { scrollArea }

// ✅
patterns: { extend: { scrollArea } }
```

**Skipping codegen.** The function, the component, and their types exist only after `panda codegen`. The CLI and
the bundler plugins run it for you when the config changes.

**Branching on a responsive prop without `map`.** `axis === 'x'` is never true when `axis` is
`{ base: 'x', md: 'y' }`. See [Responsive props](#responsive-props).

**Reaching for a pattern where a recipe fits.** Patterns are layout helpers with a handful of props. A component with
named visual variants belongs in a [recipe](/docs/recipes/atomic-recipe).

## Starting from zero

Everything above builds on the base preset's patterns. To ship none of them and define only your own, see
[Minimal setup](/docs/theming/minimal-setup).


---


## Plugins

Change the config, rewrite files before Panda reads them, or react to the output, from a plugin you can share.

A plugin is a named object with a `hooks` map. Each hook runs at one point in the build: after the config resolves,
before a file is parsed, after code or CSS is written. Add the plugin to `plugins` and Panda calls it.

```ts filename="panda.config.ts"
import { defineConfig, definePlugin } from '@pandacss/dev'

const removeStack = definePlugin({
  name: 'remove-stack',
  hooks: {
    'config:resolved': ({ config, utils }) => utils.omit(config, ['patterns.stack'])
  }
})

export default defineConfig({
  plugins: [removeStack]
})
```

`definePlugin` gives you autocomplete for hook names and arguments.

Six hooks are available, and they fall into three jobs:

- **Change the config** before Panda uses it: `config:resolved`, `preset:resolved`.
- **Rewrite a file** before Panda parses it: `parser:before`.
- **Touch or observe the output**: `codegen:prepare`, `codegen:done`, `cssgen:done`.

## Change the config

`config:resolved` runs after your presets and config merge. It receives the final config and a `utils` object with
`omit`, `pick`, and `traverse`. Return a new config to replace it, or nothing to leave it alone.

```ts
definePlugin({
  name: 'no-float',
  hooks: {
    'config:resolved': ({ config, utils }) => {
      return utils.omit(config, ['patterns.float', 'utilities.float'])
    }
  }
})
```

This is where most one-off changes go: dropping a pattern, renaming a utility, adding a token from an environment
variable.

## Trim a preset

`preset:resolved` runs once per preset, before the presets merge. It receives the preset's config and its `name`. Use it
to keep a third-party preset but not all of it, instead of forking it.

```ts
definePlugin({
  name: 'no-preset-colors',
  hooks: {
    'preset:resolved': ({ preset, name, utils }) => {
      if (name !== '@pandacss/preset-panda') return
      return utils.omit(preset, ['theme.tokens.colors', 'theme.semanticTokens.colors'])
    }
  }
})
```

## Rewrite a file

`parser:before` receives `{ filePath, content }` for every file Panda scans. Return a string and Panda parses that
instead. This is how you feed Panda a syntax it doesn't understand: strip or rewrite the parts its parser would choke
on.

```ts
definePlugin({
  name: 'strip-frontmatter',
  hooks: {
    'parser:before': ({ filePath, content }) => {
      if (!filePath.endsWith('.md')) return
      return content.replace(/^---[\s\S]*?---/, '')
    }
  }
})
```

Instead of checking the path yourself, scope any hook with `{ filter, handler }`. `filter.id` matches the file path and
`filter.code` matches its content. Each takes a glob, a regex, or an `{ include, exclude }` pair.

```ts
definePlugin({
  name: 'strip-frontmatter',
  hooks: {
    'parser:before': {
      filter: { id: '**/*.md' },
      handler: ({ content }) => content.replace(/^---[\s\S]*?---/, '')
    }
  }
})
```

Vue, Svelte, and Astro files need none of this. The compiler reads them directly.

## React to the output

Two hooks fire after Panda writes files. Both are for reporting and side effects. Whatever you return is ignored.

`codegen:done` runs after the `styled-system` folder is written, with the list of `files` and the `outdir`.

`cssgen:done` runs after the final CSS is produced by the CLI, the Vite plugin, or the PostCSS plugin. It receives the
`artifact` name, the CSS `content`, and the `path` when the CSS went to disk.

```ts
definePlugin({
  name: 'css-report',
  hooks: {
    'cssgen:done': ({ artifact, content, path }) => {
      if (artifact !== 'styles.css') return
      console.log(`Generated ${content.length} bytes at ${path}`)
    }
  }
})
```

To shrink the CSS, don't reach for a hook. Panda's own [optimizations](/docs/styling/optimization) remove unused tokens
and keyframes, and anything else belongs in a PostCSS step after Panda.

One hook does let you touch generated code. `codegen:prepare` runs before the `styled-system` files are written and
receives the `artifacts` about to be emitted. Return a modified list to add or edit files. Reach for it only when
`config:resolved` can't express the change.

## Share a plugin

A plugin is already a value, so sharing it means exporting it. Wrap it in a function when it takes options.

```ts filename="panda-plugin-report.ts"
import { definePlugin } from '@pandacss/dev'

export function report(options: { verbose?: boolean } = {}) {
  return definePlugin({
    name: 'report',
    hooks: {
      'cssgen:done': ({ artifact, content }) => {
        if (options.verbose || artifact === 'styles.css') console.log(artifact, content.length)
      }
    }
  })
}
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { report } from 'panda-plugin-report'

export default defineConfig({
  plugins: [report({ verbose: true })]
})
```

Plugins run in the order they appear in `plugins`. Unlike a preset, a plugin can't be extended by the config that uses
it. It runs as written.

Every hook's arguments and return value are listed in the [plugins reference](/docs/reference/plugins).


---


## Presets

A shareable config of tokens, recipes, and utilities that other projects can install.

A preset is a Panda config packaged for reuse. List one in `presets`, and Panda merges it into your config before your
own settings apply.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@acme/preset']
})
```

## Using a preset

Use a preset when tokens, recipes, or utilities need to exist in more than one place, and you are not shipping
components.

- **A design language.** Tokens, recipes, conditions. No components.
- **Multiple apps, one look.** The same colors and spacing, defined once.

Shipping components plus that language is a [design system](/docs/design-systems/overview). Apps that do not run Panda
need a [stylesheet](/docs/design-systems/consume-without-panda), not a preset.

### Importing a preset

A package name is enough. You can also import the object:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { acmePreset } from '@acme/preset'

export default defineConfig({
  presets: [acmePreset]
})
```

If the preset is a function, call it. A bare reference is not a preset:

```ts filename="panda.config.ts"
import myPreset from './my-preset'

export default defineConfig({
  presets: [myPreset()]
})
```

### Official presets

None are added for you. Panda includes exactly what's in your `presets` array. These are the ones we publish:

- `@pandacss/preset-base`: default utilities, conditions, and patterns
- `@pandacss/preset-panda`: default tokens, breakpoints, and text styles. See [Default Theme](/docs/theming/theme)
- `@pandacss/preset-typography`: a `prose` recipe. See [Typography](/docs/theming/typography)

`panda init` lists the first two for you. Add your own after:

```ts filename="panda.config.ts"
import basePreset from '@pandacss/preset-base'
import pandaPreset from '@pandacss/preset-panda'
import { acmePreset } from '@acme/preset'
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: [basePreset, pandaPreset, acmePreset]
})
```

For nothing at all, `presets: []`. See [Minimal setup](/docs/theming/minimal-setup).

## Extending a preset

Presets apply in the order you list them. Your config applies last, so it wins a conflict.

Without `extend`, what you write replaces the entry it names. Its siblings are untouched:

```ts filename="panda.config.ts"
export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  theme: {
    tokens: {
      colors: { brand: { value: '#EA8433' } }
    }
  }
})
// colors: brand. Every preset color is gone, other scales like spacing stay.
```

With `extend`, your values deep-merge on top:

```ts filename="panda.config.ts"
export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  theme: {
    extend: {
      tokens: {
        colors: { brand: { value: '#EA8433' } }
      }
    }
  }
})
// tokens: brand plus every preset color.
```

Same pattern on any section: `theme.extend`, `utilities.extend`, `conditions.extend`. Recipes live under `theme`.

### Adding to a preset

Anything you put under `extend` is added. A new utility keeps every built-in one:

```ts filename="panda.config.ts"
export default defineConfig({
  utilities: {
    extend: {
      br: {
        className: 'rounded',
        values: 'radii',
        transform: value => ({ borderRadius: value })
      }
    }
  }
})
```

### Overriding part of a preset

The merge is deep, so you can change one token in a scale and keep the rest. `blue.500` is yours. `blue.50` through
`blue.950` stay:

```ts filename="panda.config.ts"
export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  theme: {
    extend: {
      tokens: {
        colors: {
          blue: {
            500: { value: '#2563eb' }
          }
        }
      }
    }
  }
})
```

### Removing something from a preset

`extend` only adds, so removing takes a plugin. `config:resolved` runs after every preset has merged:

```ts filename="panda.config.ts"
import { defineConfig, definePlugin } from '@pandacss/dev'

const removeStack = definePlugin({
  name: 'remove-stack',
  hooks: {
    'config:resolved': ({ config, utils }) => utils.omit(config, ['patterns.stack'])
  }
})

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  plugins: [removeStack]
})
```

For a whole section, drop the preset and spread back only the parts you want:

```ts filename="panda.config.ts"
import base from '@pandacss/preset-base'

const { stack, ...patterns } = base.patterns

export default defineConfig({
  presets: ['@pandacss/preset-panda'],
  patterns: { extend: patterns }
})
```

To start with nothing at all, see [Minimal setup](/docs/theming/minimal-setup).

### Common mistakes

**Forgetting `extend`.** The symptom is every preset token or utility disappearing at once.

```ts
// ❌ replaces every color
theme: {
  tokens: {
    colors: {
      brand: {
        value: '#EA8433'
      }
    }
  }
}

// ✅ adds brand to the palette
theme: {
  extend: {
    tokens: {
      colors: {
        brand: {
          value: '#EA8433'
        }
      }
    }
  }
}
```

**Skipping the category.** Tokens live under `tokens` or `semanticTokens`, not directly under `extend`.

```ts
// ❌ ignored
theme: {
  extend: {
    colors: {
      brand: {
        value: '#EA8433'
      }
    }
  }
}

// ✅
theme: {
  extend: {
    tokens: {
      colors: {
        brand: {
          value: '#EA8433'
        }
      }
    }
  }
}
```

**Putting `extend` at the root.** It belongs inside each section.

```ts
// ❌ not a config key
extend: {
  theme: {
    tokens: {
    }
  }
}

// ✅
theme: {
  extend: {
    tokens: {
    }
  }
}
```

**Expecting a later preset to merge on its own.** Presets apply in order and your config applies last, but a preset
without `extend` replaces the sections it defines, exactly like your config would. Author presets with `extend` when
they build on another preset.

## Creating a preset

A preset is a valid Panda config object with a unique `name`. Wrap it in `definePreset` for types.

```ts filename="my-preset.ts"
import { definePreset } from '@pandacss/dev'

export default definePreset({
  name: 'my-preset',
  theme: {
    tokens: {
      colors: {
        brand: { value: '#2563eb' }
      }
    }
  }
})
```

List it like any other preset:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import myPreset from './my-preset'

export default defineConfig({
  presets: [myPreset]
})
```

A preset can define any of these keys:

- [`conditions`](/docs/styling/conditional-styles)
- [`globalCss`](/docs/styling/writing-styles#global-styles)
- [`globalFontface`](/docs/theming/fonts#global-font-face)
- [`patterns`](/docs/styling/patterns)
- [`staticCss`](/docs/styling/static)
- [`theme`](/docs/theming/theme)
- [`utilities`](/docs/theming/utilities)

If this preset sits on top of another one, put shared values under `extend`. Without it, you replace that section for
every app that lists you:

```ts
export const acmePreset = definePreset({
  name: '@acme/preset',
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#2563eb' }
        }
      }
    }
  }
})
```

### Publishing a package

Export the preset from the package entry, then point `package.json` at the build:

```json filename="@acme/preset/package.json"
{
  "name": "@acme/preset",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

```bash
pnpm tsup src/index.ts --format esm,cjs --dts
pnpm publish
```

Apps install it and list it the same way as [using a preset](#using-a-preset).

### Using an async preset

Return a promise when you need to await something, like a design-tool API. Panda resolves it before merging:

```ts filename="my-preset.ts"
export default async function myPreset() {
  const roseColors = await getRoseColors()

  return definePreset({
    name: 'my-preset',
    theme: {
      tokens: {
        colors: {
          rose: roseColors
        }
      }
    }
  })
}
```

The app must call it:

```ts filename="panda.config.ts"
export default defineConfig({
  presets: [myPreset()]
})
```

A preset is config only. No components, no `styled-system`. If you ship both, that's a
[design system](/docs/design-systems/build-a-design-system).


---


## Studio

See your design system in the browser. No install, no account.

[Studio](https://studio.panda-css.com/) renders your design system: every token, theme and condition, laid out the way
each category deserves. Run `panda codegen --spec` to write `styled-system/specs/design-system.json`, then drop that
file in — or the whole `styled-system/` folder — and you're looking at it. Nothing leaves your browser.

## View your tokens

Every category paints in a layout that fits it. Colors and gradients as swatches, spacing and sizes as a sorted scale,
fonts as specimens, durations and easings as live chips, and everything else as a name/value table. Click any token to
copy its name.

Discovered themes and a light/dark switch let semantic tokens show their real values, so `colors.fg` reads as the color
it resolves to rather than a reference you have to chase.

## Analyze token usage

Drop your source files, or the whole repo folder, and Studio reports per category which tokens are used, unused, and
hot. There are two tiers, and what you drop picks one:

- **Include your `panda.config.ts`** and the real Panda compiler runs in your browser through `@pandacss/compiler-wasm`.
  Counts are exact, down to bare-numeric tokens like `spacing.4`.
- **Leave it out** and a name-match scan runs instead. Accurate for named tokens like `red.500`, approximate for numeric
  ones.

A badge on the report says which tier ran. Everything stays in the browser.

## Share a link

The Share button saves the current system and gives you a read-only link at `/s/<slug>` that anyone can open. Share from
Analyze and the usage report travels with it, at `/a/<slug>`.

No account, no ownership: make a spec, get a link, send it. Sharing is the one action that stores anything, so treat the
link as public.

## Build your own

Studio reads the same file you can. To render tokens in your own docs site or Storybook, see
[JSON Spec](/docs/theming/json-spec).

## Learn more

The [Studio announcement](/blog/see-your-design-system) walks through all three tracks.


---


## Text Styles

Define reusable typography css properties.

Text styles allows you to define textual css properties. The common properties are:

- The font family, weight, size
- Line height
- Letter spacing
- Text Decoration (strikethrough and underline)
- Text Transform (uppercase, lowercase, and capitalization)

## Defining text styles

Text styles are defined in the `textStyles` property of the theme.

Here's an example of a text style:

```js filename="text-styles.ts"
import { defineTextStyles } from '@pandacss/dev'

export const textStyles = defineTextStyles({
  body: {
    description: 'The body text style - used in paragraphs',
    value: {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '0',
      textDecoration: 'None',
      textTransform: 'None'
    }
  }
})
```

> **Good to know:** The `value` property maps to style objects that will be applied to the text.

## Update the config

To use the text styles, we need to update the `config` object in the `panda.config.ts` file.

```js filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { textStyles } from './text-styles'

export default defineConfig({
  theme: {
    extend: {
      textStyles
    }
  }
})
```

This should automatically update the generated theme the specified `textStyles`. If this doesn't happen, you can run the
`panda codegen` command.

## Using text styles

Now we can use `textStyle` property in our components.

```jsx
import { css } from '../styled-system/css'

function App() {
  return <p className={css({ textStyle: 'body' })}>This is a paragraph from Panda with the body text style.</p>
}
```

## Nesting text styles

Text styles support nested structures with a special `DEFAULT` key. This allows you to create variants of a text style
while having a default fallback.

When you define a `DEFAULT` key within a nested text style, you can reference the parent key directly to use the default
value.

```js filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      textStyles: {
        heading: {
          DEFAULT: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              lineHeight: '1.2'
            }
          },
          h1: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'bold',
              fontSize: '2.5rem',
              lineHeight: '1.1'
            }
          },
          h2: {
            value: {
              fontFamily: 'Inter',
              fontWeight: 'bold',
              fontSize: '2rem',
              lineHeight: '1.15'
            }
          }
        }
      }
    }
  }
})
```

Now you can use the default heading style or specific variants:

```jsx
import { css } from '../styled-system/css'

function App() {
  return (
    <div>
      <h1 className={css({ textStyle: 'heading.h1' })}>Main Title</h1>
      <h2 className={css({ textStyle: 'heading.h2' })}>Subtitle</h2>
      <h3 className={css({ textStyle: 'heading' })}>Uses DEFAULT variant</h3>
    </div>
  )
}
```

## Best Practices

### Avoid layout properties

To ensure the consistency of your design system, avoid applying layout properties (like margin, padding, etc.) or color
properties (background, colors, etc.) to the text styles.

### Naming conventions

We recommend using the same text style names used by designers on your team. Here are common ideas on how to name text
styles:

- Sized-based naming system (`xs`, `sm`, `md`, `lg`, `xl`)
- Semantic naming system that corresponds to respective html tags in production (`caption`, `paragraph`, `h1`, `h2`)
- Descriptive or functional naming system that explains the style's intended use (`alert`, `modal-header`,
  `button-label`)


---


## Default Theme

The breakpoints, tokens, and keyframes Panda ships with, and how to change them.

Panda comes with a default theme that is used to generate the utilities for your project. It's provided by the
[Panda preset](/docs/theming/presets), and you can customize any part of it to match your design requirements. Put your
changes under `extend` so the defaults stay. See [Extending a preset](/docs/theming/presets#extending-a-preset).

## Breakpoints

Panda ships with the following breakpoints by default:

<TokenDocs type="breakpoints" />

## Tokens

A token is a named value. For example, `brand` instead of a generic hex color code, `#EA8433`. Panda groups tokens into
categories like colors, spacing, and radii, each shown below with its defaults. See [Tokens](/docs/theming/tokens) for
the full token format.

### Colors

Use the `colors` key in the `token` section of your Panda config file to customize the default color values.

> We recommend using numeric ranges from `50` to `900`

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#EA8433' }
        }
      }
    }
  }
})
```

Panda ships the Tailwind color palette, with eleven shades per hue. Click a swatch to copy its token name.

<TokenDocs type="colors" />

### Spacing

Use the `spacing` key in the theme section of your Panda config file to customize the default spacing values.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        spacing: {
          gutter: { value: '32px' }
        }
      }
    }
  }
})
```

Panda ships with the following spacing tokens by default:

<TokenDocs type="spacing" />

### Border Radius

Use the `radii` key in the theme section of your Panda config file to customize the default border radius values.

<TokenDocs type="radii" />

### Shadows

Use the `shadows` key in the theme section of your Panda config file to customize the default box shadows values.

Panda ships with the following shadows by default:

<TokenDocs type="shadows" />

### Sizing

Use the `sizes` key in the theme section of your Panda config file to customize the default sizing values.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        sizes: {
          icon: { value: '24px' }
        }
      }
    }
  }
})
```

Panda ships with the following sizing tokens by default, in addition with the values from the default Panda
[spacing](#spacing) tokens:

<TokenDocs type="sizing" />

### Fonts

Use the `fonts` key in the theme object to customize the default font families.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fonts: {
          marketing: { value: 'Inter Variable' }
        }
      }
    }
  }
})
```

Panda ships with the following font families tokens by default:

<TokenDocs type="fonts" />

### Font Sizes

Use the `fontSizes` key in the theme object to customize the default font sizes.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fontSizes: {
          big: { value: '80px' }
        }
      }
    }
  }
})
```

Panda ships with the following font size tokens by default:

<TokenDocs type="fontSizes" />

## Keyframes

Use the `keyframes` key in the `theme` section of your Panda config file to customize the default keyframes.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      keyframes: {
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeout: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      }
    }
  }
})
```

Panda ships with the following keyframes by default:

<TokenDocs type="keyframes" />

To start from nothing instead of the default theme, see [Minimal setup](/docs/theming/minimal-setup).


---


## Token Categories

Every token category Panda supports, the properties each one feeds, and the value shape it expects.

Every token belongs to a category. The category decides which style properties accept the token by name and what
shape its value takes. Each section below shows the properties, how to define the token, and how to use it.

## Colors

**Used by:** `color`, `background`, `borderColor`, `outlineColor`, `fill`, `stroke`, `caretColor`, `accentColor`,
`textDecorationColor`, `boxShadowColor`, and every side and logical border color.

A string, or a reference to another color token.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          red: { 100: { value: '#fff1f0' }, 500: { value: '#ef4444' } },
          brand: { value: '{colors.red.500}' }
        }
      }
    }
  }
})
```

```tsx
css({ color: 'brand', bg: 'red.100' })
```

## Gradients

**Used by:** `backgroundGradient`, `backgroundLinear`, `backgroundRadial`, `textGradient`.

A CSS gradient string, or an object with `type`, `placement`, and `stops`. `placement` is a keyword like `to right`
or a number read as degrees. A stop is a color, or `{ color, position }` with `position` as a percentage.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        gradients: {
          simple: { value: 'linear-gradient(to right, red, blue)' },
          primary: { value: { type: 'linear', placement: 'to right', stops: ['red', 'blue'] } },
          angled: {
            value: {
              type: 'linear',
              placement: 45,
              stops: [
                { color: 'red', position: 0 },
                { color: 'blue', position: 100 }
              ]
            }
          }
        }
      }
    }
  }
})
```

```tsx
css({ backgroundGradient: 'angled' })
// linear-gradient(45deg, red 0%, blue 100%)
```

## Sizes

**Used by:** `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `boxSize`, `flexBasis`, and their
logical variants like `inlineSize`.

A length string.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        sizes: {
          sm: { value: '12px' },
          container: { value: '64rem' }
        }
      }
    }
  }
})
```

```tsx
css({ width: 'sm', maxWidth: 'container' })
```

## Spacing

**Used by:** `padding`, `gap`, `top`, `right`, `bottom`, `left`, `inset`, `scrollMargin`, `scrollPadding`,
`textIndent`, `outlineOffset`, and their side and logical variants. Margin utilities accept them too, including
negative values.

A length string.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        spacing: {
          sm: { value: '12px' },
          gutter: { value: '2rem' }
        }
      }
    }
  }
})
```

```tsx
css({ p: 'sm', gap: 'gutter', mt: '-sm' })
```

## Fonts

**Used by:** `fontFamily`.

A font stack as a string, or an array of family names.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fonts: {
          body: { value: 'Inter, sans-serif' },
          mono: { value: ['Roboto Mono', 'monospace'] }
        }
      }
    }
  }
})
```

```tsx
css({ fontFamily: 'body' })
```

## Font Sizes

**Used by:** `fontSize`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fontSizes: {
          sm: { value: '0.875rem' }
        }
      }
    }
  }
})
```

```tsx
css({ fontSize: 'sm' })
```

## Font Weights

**Used by:** `fontWeight`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        fontWeights: {
          bold: { value: '700' }
        }
      }
    }
  }
})
```

```tsx
css({ fontWeight: 'bold' })
```

## Letter Spacings

**Used by:** `letterSpacing`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        letterSpacings: {
          wide: { value: '0.1em' }
        }
      }
    }
  }
})
```

```tsx
css({ letterSpacing: 'wide' })
```

## Line Heights

**Used by:** `lineHeight`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        lineHeights: {
          normal: { value: '1.5' }
        }
      }
    }
  }
})
```

```tsx
css({ lineHeight: 'normal' })
```

## Radii

**Used by:** `borderRadius` and every corner and side variant like `borderTopRadius`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        radii: {
          sm: { value: '4px' }
        }
      }
    }
  }
})
```

```tsx
css({ borderRadius: 'sm', borderTopRadius: 'sm' })
```

## Borders

**Used by:** `border`, `outline`, and every side and logical variant like `borderTop` and `borderInline`.

A border shorthand string, which may reference color tokens, or an object with `width`, `style`, and `color`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        borders: {
          subtle: { value: '1px solid {colors.gray.200}' },
          accent: { value: { width: '1px', style: 'solid', color: 'red' } }
        }
      }
    }
  }
})
```

```tsx
css({ border: 'subtle', borderBottom: 'accent' })
```

## Border Widths

**Used by:** `borderWidth`, `outlineWidth`, `strokeWidth`, `divideX`, `divideY`, and every side and logical width
variant.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        borderWidths: {
          thin: { value: '1px' },
          thick: { value: '2px' }
        }
      }
    }
  }
})
```

```tsx
css({ borderWidth: 'thin', outlineWidth: 'thick' })
```

## Shadows

**Used by:** `boxShadow`, `textShadow`.

A shadow string, an object with `offsetX`, `offsetY`, `blur`, `spread`, `color`, and optional `inset`, or an array of
either for layered shadows.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        shadows: {
          subtle: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
          accent: { value: { offsetX: 0, offsetY: 4, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.1)' } },
          layered: { value: ['0 1px 2px 0 rgba(0, 0, 0, 0.05)', '0 1px 4px 0 rgba(0, 0, 0, 0.1)'] }
        }
      }
    }
  }
})
```

```tsx
css({ boxShadow: 'layered' })
```

## Blurs

**Used by:** `blur`, `backdropBlur`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        blurs: {
          sm: { value: '4px' }
        }
      }
    }
  }
})
```

```tsx
css({ backdropBlur: 'sm' })
```

## Easings

**Used by:** `transitionTimingFunction`, `animationTimingFunction`.

A timing function string, or the four cubic-bezier numbers as an array.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        easings: {
          easeIn: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
          easeOut: { value: [0, 0, 0.2, 1] }
        }
      }
    }
  }
})
```

```tsx
css({ transitionTimingFunction: 'easeOut' })
```

## Durations

**Used by:** `transitionDuration`, `transitionDelay`, `animationDuration`, `animationDelay`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        durations: {
          fast: { value: '100ms' }
        }
      }
    }
  }
})
```

```tsx
css({ transitionDuration: 'fast' })
```

## Animations

**Used by:** `animation`.

An `animation` shorthand string. The keyframe name comes from `theme.keyframes`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        animations: {
          spin: { value: 'spin 1s linear infinite' }
        }
      }
    }
  }
})
```

```tsx
css({ animation: 'spin' })
```

## Opacity

**Used by:** `opacity`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        opacity: {
          50: { value: 0.5 }
        }
      }
    }
  }
})
```

```tsx
css({ opacity: '50' })
```

## Z-Index

**Used by:** `zIndex`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        zIndex: {
          modal: { value: 1000 }
        }
      }
    }
  }
})
```

```tsx
css({ zIndex: 'modal' })
```

## Aspect Ratios

**Used by:** `aspectRatio`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        aspectRatios: {
          square: { value: '1 / 1' },
          wide: { value: '16 / 9' }
        }
      }
    }
  }
})
```

```tsx
css({ aspectRatio: 'wide' })
```

## Cursor

**Used by:** `cursor`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        cursor: {
          click: { value: 'pointer' },
          disabled: { value: 'not-allowed' },
          custom: { value: 'url(cursor.svg), auto' }
        }
      }
    }
  }
})
```

```tsx
css({ cursor: 'click', _disabled: { cursor: 'disabled' } })
```

## Assets

**Used by:** `backgroundImage`, `listStyleImage`.

A URL string, or an object with `type` set to `url` or `svg` and the matching `value`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        assets: {
          logo: { value: { type: 'url', value: '/static/logo.png' } },
          check: { value: { type: 'svg', value: '<svg>...</svg>' } }
        }
      }
    }
  }
})
```

```tsx
css({ backgroundImage: 'logo', listStyleImage: 'check' })
```

## Container Names

**Used by:** `containerName`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        containerNames: {
          sidebar: { value: 'sidebar' }
        }
      }
    }
  }
})
```

```tsx
css({ containerName: 'sidebar', containerType: 'inline-size' })
```


---


## Tokens

Define design tokens, reference them from each other, and use them in your styles.

A design token is a named value: `brand` instead of `#EA8433`, `body` instead of a font stack. You define them once
in the config, and every style reads them by name. Panda's token format follows the
[W3C Design Tokens](https://tr.designtokens.org/format/) spec.

Each token is an object with a `value`, and optionally a `description`:

```ts
danger: {
  value: '#EE0F0F',
  description: 'Color for errors'
}
```

## Core tokens

Core tokens are raw values. They live under `theme.tokens`, grouped by [category](/docs/theming/token-categories):

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          red: { value: '#EE0F0F' },
          green: { value: '#0FEE0F' }
        },
        fonts: {
          body: { value: 'system-ui, sans-serif' }
        }
      }
    }
  }
})
```

Use them by name wherever a style property takes that category:

```tsx
css({ color: 'red', fontFamily: 'body' })
```

## Reference a token

A token value can point at another token with `{path.to.token}`. Panda resolves it to that token's CSS variable, so
the two stay in sync:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '{colors.red.500}' }
        },
        borders: {
          subtle: { value: '1px solid {colors.gray.200}' }
        }
      }
    }
  }
})
```

References work inside any token value, including composite ones like borders and shadows. Semantic tokens, next,
are built entirely on them.

## Semantic tokens

A semantic token names a role, and its value references a core token. Components use the role, so a redesign changes
one config line instead of every call site. They live under `theme.semanticTokens`:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          danger: { value: '{colors.red}' },
          success: { value: '{colors.green}' }
        }
      }
    }
  }
})
```

The value can change per [condition](/docs/styling/conditional-styles). This is how light and dark mode work:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          danger: { value: { base: '{colors.red}', _dark: '{colors.darkred}' } }
        }
      }
    }
  }
})
```

Only at-rule and parent-selector [conditions](/docs/styling/conditional-styles#reference) can be used here. For
whole alternative palettes, see [Multiple Themes](/docs/theming/multiple-themes).

## Nesting

Group related tokens under one key. `DEFAULT` gives the group itself a value:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: { value: '{colors.gray.50}' },
            muted: { value: '{colors.gray.100}' }
          }
        }
      }
    }
  }
})
```

```tsx
css({ bg: 'bg', color: 'bg.muted' })
```

## Generated CSS

Every token becomes a CSS variable, named from its path. Semantic tokens with conditions get one declaration per
condition:

```css
:where(:root, :host) {
  --colors-red: #ee0f0f;
  --colors-danger: var(--colors-red);
}
.dark {
  --colors-danger: var(--colors-darkred);
}
```

`cssVarRoot` in the config sets the selector the variables are declared on. The default is `:where(:root, :host)`.

## Use a token

### In styles

In a style property, by name:

```tsx /'danger'/ /'body'/
css({
  color: 'danger',
  fontFamily: 'body'
})
```

Inside a longer value, with the same `{path.to.token}` reference:

```tsx /{colors.danger}/ /{colors.gray.900}/
css({
  border: '1px solid {colors.danger}',
  boxShadow: '0 1px 2px {colors.gray.900}'
})
```

`token()` does the same and takes a fallback for when the token might not exist:

```tsx /token(colors.danger, crimson)/
css({
  border: '1px solid token(colors.danger, crimson)'
})
```

Both work in at-rules:

```tsx /{sizes.4xl}/
css({
  '@media (min-width: {sizes.4xl})': {
    color: 'danger'
  }
})
```

### From JavaScript

The generated helpers read tokens at runtime. `token()` returns the value and `token.var()` returns the CSS
variable:

```tsx /token('colors.danger')/ /token.var('colors.gray.200')/
import { token } from '../styled-system/tokens'

<div
  style={{
    background: token('colors.danger'),
    borderColor: token.var('colors.gray.200')
  }}
/>
```

Reach for these only when a style object can't express it, like an inline `style` or a third-party API that wants a
raw value. The forms above are extracted at build time and cost nothing at runtime. See
[`tokens/`](/docs/reference/tokens) for the helpers.

## See also

- [Token Categories](/docs/theming/token-categories) for every category and its value shape.
- [Config Functions](/docs/reference/config-functions#tokens) for typed `defineTokens` and
  `defineSemanticTokens` helpers.
- [globalVars](/docs/styling/writing-styles#global-vars) for CSS variables that aren't tokens.


---


## Typography

Prose styles for HTML you don't control. One recipe, five sizes, colors from your tokens.

Markdown, a CMS, an AI reply: content you render but didn't write, arriving as plain headings, paragraphs, lists, and
tables with no classes to hook onto. The typography preset styles all of it from one wrapper.

The article below is raw HTML. Nothing inside it carries a class. Switch the size to see the whole scale move together,
and toggle the site's theme to see it follow your dark mode. Every post on [the blog](/blog) is rendered the same way.

<ProseDemo />

## Install

```bash
pnpm add -D @pandacss/preset-typography
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import typographyPreset from '@pandacss/preset-typography'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda', typographyPreset()]
})
```

Run codegen and a `prose` recipe appears next to your other recipes.

## Wrap the content

### The wrapper

`prose()` returns a class name. Put it on the element that holds the content, and everything inside is styled:

```tsx
import { prose } from '../styled-system/recipes'

export function Article({ html }: { html: string }) {
  return <article className={prose()} dangerouslySetInnerHTML={{ __html: html }} />
}
```

It works the same on rendered Markdown or any other markup you didn't write. The children don't need classes.

### Sizes

The scale runs `sm`, `md`, `lg`, `xl`, and `2xl`, with `md` as the default. A size is one font size on the root, and
every heading, gap, and code block is a ratio of it, so the article keeps its proportions at any step:

```tsx
<article className={prose({ size: 'lg' })} />
```

### Follow the container

Because everything is a ratio, a `prose` can take its size from wherever it sits instead of from a variant. A
sidebar or a chat bubble that sets its own font size scales the whole article with it:

```tsx
<aside className={css({ fontSize: 'sm' })}>
  <article className={cx(prose(), css({ fontSize: 'inherit' }))} />
</aside>
```

### Lead paragraph

A paragraph with the `lead` class renders as an intro, larger and lighter than the body. It's the one class the
recipe looks for inside the content:

```html
<p class="lead">A short opening that sets up the rest of the article.</p>
<p>Body text continues at the normal size.</p>
```

## Change the colors

The recipe reads roles like `prose.link` and `prose.heading` from `semanticTokens`. Every semantic token has a light and a dark value. Override the ones you care about in your config:

```ts filename="panda.config.ts"
export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda', typographyPreset()],
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          prose: {
            link: { value: { base: '{colors.blue.700}', _dark: '{colors.blue.300}' } },
            heading: { value: '{colors.fg}' }
          }
        }
      }
    }
  }
})
```

The defaults come from one palette, `neutral` unless you say otherwise. To base them on another palette:

```ts
typographyPreset({ semanticTokens: { colorPalette: 'gray' } })
```

The full set of roles: `body`, `heading`, `lead`, `link`, `linkDecoration`, `bold`, `counter`, `bullet`, `hrBorder`,
`quote`, `quoteBorder`, `caption`, `kbd`, `code`, `codeBg`, `preCode`, `preBg`, `thBorder`, and `tdBorder`.

## Opt a component out

Content sometimes carries a component of your own, a callout or an embed with its own styles. Turn on `notProse` and
mark the component:

```ts
typographyPreset({ notProse: true })
```

```tsx
<article className={prose()}>
  {content}
  <div className="not-prose">
    <Callout>Styled by the callout, not the prose.</Callout>
  </div>
</article>
```

Pass a string instead of `true` to use your own class name.

## Tune the rhythm

Two custom properties on the root set the rhythm. `--prose-leading` is the line height, `1.625` by default, and
`--prose-flow` is the gap between blocks, `1.25em` of the root font size. Headings and larger blocks are multiples of
the flow, so changing it moves the whole article together:

```tsx
<article className={cx(prose(), css({ '--prose-leading': '1.5', '--prose-flow': '1em' }))} />
```

The property names follow the recipe's `name`, so a preset created with `name: 'article'` uses `--article-flow`.

## Override a style

Every rule the recipe emits is wrapped in `:where()`, so it has no specificity of its own. A plain style on the wrapper
or on an element inside wins without `!important`:

```tsx
<article className={cx(prose(), css({ maxW: '4xl', '& h2': { fontFamily: 'heading' } }))} />
```

The default width is the `sizes.prose` token, sixty characters. Override it the same way.

## Stream content

Spacing is applied from the top of each block only, and no rule depends on `:last-child`, `:has()`, or `:empty`. When
content arrives a block at a time, as it does from an AI model, a new block never restyles the ones already on screen.

## Options

```ts
typographyPreset({
  // Recipe name, class name, and token prefix. Default 'prose'.
  name: 'prose',
  // Class name when it must differ from the name.
  className: 'prose',
  // Sizes to generate. Default all five.
  sizes: ['sm', 'md', 'lg', 'xl', '2xl'],
  // Size when the call site passes none. Default 'md'.
  defaultSize: 'md',
  // Class that opts a subtree out. true means 'not-prose'. Default off.
  notProse: true,
  semanticTokens: {
    // Set false to define every role yourself.
    enabled: true,
    // Token prefix. Defaults to the name.
    prefix: 'prose',
    // Palette the defaults are built from.
    colorPalette: 'neutral'
  }
})
```


---


## Utilities

Add your own CSS properties, or remap existing ones to your tokens, with the utility API.

Panda ships a set of built-in utilities (`bg`, `px`, `rounded`, and the rest of what you already use in `css()`). The
utility API is how you add your own on top, or change what a built-in one does. Think of it as building your own
typed version of Tailwind's or Chakra's utility layer, except every value comes from your own config.

A utility takes these fields:

- `property`: the real CSS property this utility maps to (`borderRadius`, `backgroundColor`, and so on).
- `className`: the class name Panda generates for it. Defaults to the property name if you skip it.
- `shorthand`: one alias, or an array of aliases, for the property (`px` for `paddingInline`, say).
- `values`: what values the property accepts. A token category name (`'radii'`, `'colors'`), an array of literal
  strings, `{ type: 'boolean' }`, or an object mapping your own keys to raw values.
- `transform`: a function that takes the value and returns the CSS object to emit.

## Creating a custom utility

Say you want a `br` shorthand that applies a border radius:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  utilities: {
    extend: {
      br: {
        className: 'rounded', // css({ br: 'sm' }) → .rounded_sm
        values: 'radii', // pull values from the radii tokens
        transform(value) {
          return { borderRadius: value }
        }
      }
    }
  }
})
```

Run codegen so the new property shows up in your generated types:

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
    <Tab>
      ```bash
      pnpm panda codegen
      ```
    </Tab>
    <Tab>
      ```bash
      npm panda codegen
      ```
    </Tab>
    <Tab>
      ```bash
      yarn panda codegen
      ```
    </Tab>
    <Tab>
      ```bash
      bun panda codegen
      ```
    </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

`br` now works everywhere `css()` does:

```jsx
import { css } from '../styled-system/css'

function App() {
  return <div className={css({ br: 'sm' })} />
}
```

And as a JSX style prop:

```jsx
import { styled } from '../styled-system/jsx'

function App() {
  return <styled.div br="sm" />
}
```

### Enum values

Restrict a utility to a fixed set of raw values instead of a token category. Here, `borderX` only accepts three widths
and always sets the border color for you:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  utilities: {
    extend: {
      borderX: {
        values: ['1px', '2px', '4px'],
        shorthand: 'bx', // both `bx` and `borderX` work
        transform(value, { token }) {
          return {
            borderInlineWidth: value,
            borderColor: token('colors.red.200') // resolves to the CSS variable for red.200
          }
        }
      }
    }
  }
})
```

```jsx
import { css } from '../styled-system/css'

function App() {
  return <div className={css({ borderX: '2px' })} />
}
```

### Mapped values

Map your own keys to raw CSS values instead of a plain array:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  utilities: {
    extend: {
      borderX: {
        values: { small: '2px', medium: '5px' },
        shorthand: 'bx',
        transform(value, { token }) {
          return {
            borderTopWidth: value,
            borderTopColor: token('colors.gray.400')
          }
        }
      }
    }
  }
})
```

Now `borderX: 'small'` resolves to `2px`, not the literal string `'small'`.

### Boolean values

Set `values: { type: 'boolean' }` for a utility that's either on or off:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  utilities: {
    extend: {
      truncate: {
        className: 'truncate',
        values: { type: 'boolean' },
        transform(value) {
          if (!value) return {}
          return {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        }
      }
    }
  }
})
```

`css({ truncate: true })` now emits the three declarations above. `truncate: false` emits nothing.

## Starting from zero

Everything here assumes you're extending Panda's defaults with `utilities.extend`. If you want no built-in utilities
at all and full control from the start, see [minimal setup](/docs/theming/minimal-setup).


---

_This content is automatically generated from the official Panda CSS documentation._
