# Panda CSS Get Started

> This document contains all get-started documentation for Panda CSS

## Table of Contents

- [Agent Skills](#agent-skills)
- [Using Angular](#using-angular)
- [Using Astro](#using-astro)
- [Using Bun](#using-bun)
- [Migrating from Chakra UI](#migrating-from-chakra-ui)
- [Panda CLI](#panda-cli)
- [Using Ember](#using-ember)
- [Migrating from Emotion](#migrating-from-emotion)
- [FAQs](#faqs)
- [Framework Guides](#framework-guides)
- [Using Gatsby](#using-gatsby)
- [Linting](#linting)
- [LLMs.txt](#llms.txt)
- [MCP Server](#mcp-server)
- [Using Next.js](#using-next.js)
- [Using Nuxt](#using-nuxt)
- [Using PostCSS](#using-postcss)
- [Using Preact](#using-preact)
- [Using Qwik](#using-qwik)
- [Using React Router](#using-react-router)
- [Using Redwood](#using-redwood)
- [Using Remix](#using-remix)
- [Using Rsbuild](#using-rsbuild)
- [Using SolidJS](#using-solidjs)
- [Using Storybook](#using-storybook)
- [Migrating from Styled Components](#migrating-from-styled-components)
- [Migrating from StyleX](#migrating-from-stylex)
- [Using Svelte](#using-svelte)
- [Migrating from Tailwind CSS](#migrating-from-tailwind-css)
- [Thinking in Panda](#thinking-in-panda)
- [Upgrading to v2](#upgrading-to-v2)
- [Migrating from vanilla-extract](#migrating-from-vanilla-extract)
- [Using Vite](#using-vite)
- [Using Vue](#using-vue)
- [Why Panda](#why-panda)

---


## Agent Skills

Official skills that teach AI coding agents how to use Panda correctly.

Panda ships three official skills that teach AI coding agents how to write Panda: one for styling, one for theme and
recipe architecture, one for the v1 to v2 upgrade.

They exist because the usual failures are invisible. An agent writes `css({ color: brandColor })`, the class lands on
the element, and no CSS is emitted. Panda reads your source at build time, and a value it can't read produces nothing.

## Install

```bash
npx skills add chakra-ui/panda
```

That installs all three. Each loads on its own triggers, so you never have to name one.

Skills use the open [Agent Skills](https://skills.sh) format and work with any agent that supports it, including Claude
Code, Cursor, and VS Code.

## Available skills

### `panda-css`

Day-to-day styling in a project that already has Panda set up.

It reads your config and generated output before writing anything, so token names come from
`styled-system/types/tokens.d.ts` instead of from guesswork. It covers choosing between `css()`, a pattern, and a
recipe, and it covers the extraction rules that decide whether a style reaches the stylesheet at all.

Loads when you're building or changing components, when a style renders a class name but no CSS, or when styles don't
apply.

### `panda-css-theming`

The decisions that are hard to reverse once a codebase has a few hundred call sites.

Where a value belongs across primitives, semantic tokens, composite styles, and recipes. How to name things so a rebrand
touches the config instead of every component. Dark mode and [multiple themes](/docs/theming/multiple-themes). And when
a style graduates from a `css()` call to a `cva`, to a config recipe, to a slot recipe.

Loads when you're setting up theming, adding brand colors, wiring dark mode, shipping more than one theme, designing a
variant API, or cleaning up a theme that's drifted.

### `panda-css-migrate`

Upgrading v1 to v2, and debugging a project that worked on 1.x and breaks on 2.x.

An ordered checklist, then the old-to-new list: hooks moving onto plugins, `createStyleContext` splitting in two,
template literal styles going away, `panda ship` becoming `panda lib`. It links
[Upgrading to v2](/docs/get-started/upgrading-to-v2) rather than restating it.

Loads when you're upgrading to v2, when a build fails after upgrading, or when CSS output changes.

## LLMs.txt and MCP

Three surfaces, three questions:

- [LLMs.txt](/docs/get-started/llms-txt): what is this API?
- [MCP Server](/docs/get-started/mcp-server): what exists in this project right now?
- Agent Skills: how do I do this correctly?

Skills point at the other two rather than duplicating them.

## Wire up the linter

`@pandacss/eslint-plugin` catches unresolved tokens, nested selectors missing `&`, files outside `include`, deprecated
APIs, and hardcoded values that have tokens.

A rule that runs beats a rule an agent might read. Use both: the skills stop the mistake being written, the linter stops
it being merged. See [Linting](/docs/get-started/linting).

## Add your project's rules

Skills load on their own. A line in your repo's `AGENTS.md`, or whatever file your agent reads first, still helps it
orient before it starts:

```md
This project uses Panda CSS. Use the official Panda skills (`panda-css`, `panda-css-theming`). Prefer css(), patterns,
and recipes. Never invent token names or write Tailwind classes.
```

If your team has conventions the skills can't know, such as which recipes are off limits or which scales are frozen,
that file is where they go. The skills teach Panda. Only you can teach your project.


---


## Using Angular

Easily use Panda with Angular with our dedicated integration.

This guide shows you how to set up Panda CSS in an Angular project using PostCSS.

## Start a new project

<Steps>

### Create Angular project

To get started, we will need to create a new Angular project using the official
[scaffolding tool](https://angular.dev/tools/cli).

If you don't enter any parameter, the CLI will guide you through the process of creating a new Angular app.

```bash
ng new test-app
```

You will be asked a few questions, answer them as follows:

```bash
? Which stylesheet format would you like to use? CSS
? Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? No
```

### Install Panda

Install panda and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Configure PostCSS

Create a `postcss.config.json` file in the root of your project and add the following code:

```json filename="postcss.config.json"
{
  "plugins": {
    "@pandacss/dev/postcss": {}
  }
}
```

> You must use a JSON file for the PostCSS configuration, as the Angular CLI does not support JavaScript PostCSS
> configuration files.

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your Angular components are included in the `include` section of the
`panda.config.ts` file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/index.css` file and import it in the root component of your project.

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`src/app.component.ts` file.

```typescript filename="src/app.component.ts"
import { Component } from '@angular/core'
import { css } from '../styled-system/css'

@Component({
  selector: 'app-root',
  standalone: true,
  template: ` <div [class]="redBg"></div> `
})
export class App {
  redBg = css({ bg: 'red.400' })
}
```

</Steps>


---


## Using Astro

Easily use Panda with Astro with our dedicated integration.

This guide will show you how to set up Panda CSS in an Astro project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Astro project

To get started, create a new Astro project:

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm create astro@latest test-app
    cd test-app
    ```
  </Tab>
  <Tab>
    ```bash
    npm create astro@latest test-app
    cd test-app
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create astro test-app
    cd test-app
    ```
  </Tab>
  <Tab>
    ```bash
    bun create astro@latest test-app
    cd test-app
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Astro runs on Vite, so the plugin goes in the `vite` section of your Astro config. It generates the `styled-system`
folder, injects the CSS, and keeps both up to date on save. No separate watcher needed.

```js {1,7} filename="astro.config.mjs"
import pandacss from '@pandacss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [pandacss()]
  }
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure your `.astro` files and any framework components are included in the `include` section of the
`panda.config.ts` file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx,astro}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Create an `src/index.css` file with the layer order, and import it in your layout:

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

```astro {2} filename="src/layouts/Layout.astro"
---
import '../index.css'
---

<slot />
```

This file only sets the layer order. The plugin injects the generated CSS for you.

### Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Use the generated style utilities in your `.astro` files, and panda will extract them at build time.

```astro filename="src/pages/index.astro"
---
import { css } from '../../styled-system/css'
---

<div class={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```js filename="astro.config.mjs"
vite: {
  plugins: [pandacss({ transform: true })]
}
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Bun

Use Panda with Bun's bundler and runtime through the @pandacss/bun plugin.

This guide shows you how to set up Panda CSS in a Bun project using the `@pandacss/bun` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create a Bun app

```bash
bun init
```

### Install Panda

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

```bash
bun add -D @pandacss/dev @pandacss/bun
bun panda init
```

### Add the Bun plugin

The plugin generates the `styled-system` folder, appends the compiled CSS to the stylesheet that declares Panda's
layers, and keeps both up to date. No separate watcher needed.

For a fullstack app (`Bun.serve` with HTML imports), Bun loads bundler plugins from `bunfig.toml`:

```toml filename="bunfig.toml"
[serve.static]
plugins = ["@pandacss/bun"]
```

For `Bun.build`, pass the same plugin:

```ts {1,7} filename="build.ts"
import panda from '@pandacss/bun'

await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  plugins: [panda],
})
```

The `bun build` command line doesn't run plugins, so build through `Bun.build` for production.

To pass options, export a configured plugin from a file and point Bun at that file instead:

```ts filename="panda.plugin.ts"
import { pandacss } from '@pandacss/bun'

export default pandacss({ transform: true })
```

```toml filename="bunfig.toml"
[serve.static]
plugins = ["./panda.plugin.ts"]
```

For `bun run` and `bun test`, register the plugin from a preload file. Await it so codegen finishes before your entry
loads:

```ts filename="panda-preload.ts"
import { register } from '@pandacss/bun'

await register()
```

```toml filename="bunfig.toml"
preload = ["./panda-preload.ts"]

[test]
preload = ["./panda-preload.ts"]
```

If you don't need options, point both entries at the ready-made `@pandacss/bun/preload` instead.

Bun's runtime doesn't process CSS, so under `bun run` and `bun test` the plugin only runs codegen and the optional
source rewrite. The stylesheet injection applies to the dev server and `Bun.build`.

While the dev server runs, editing a component hot-reloads it with its new styles. Bun cannot re-run the CSS file for
a JavaScript change, so the plugin hands the reloaded module the current stylesheet instead, in a `<style>` tag the
page keeps across reloads. Production builds are untouched.

Add `transform: true` when you want `css()` calls rewritten to class strings. See
[Source Transforms](/docs/styling/source-transforms).

### Update package.json scripts

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "bun run src/index.ts",
    "build": "bun run build.ts"
  }
}
```

The plugin only runs when Bun loads it. The `"prepare"` script covers `tsc` and your editor, which read `styled-system`
before a build starts, and lets the folder stay gitignored.

### Configure the content

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Configure the entry CSS

Put Panda's layers in the stylesheet you already load. The plugin treats that file as the CSS root and appends the
generated rules after it.

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

Link it from your HTML, or import it from your entry:

```html filename="src/index.html"
<link rel="stylesheet" href="./index.css" />
```

```ts filename="src/index.ts"
import './index.css'
```

### Start using Panda

```tsx filename="src/App.tsx"
import { css } from '../styled-system/css'

export function App() {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼</div>
}
```

</Steps>


---


## Migrating from Chakra UI

Migrate your project from Chakra UI to Panda and see how style props, theme, and variants map across.

Chakra was designed to align with Panda, so `@chakra-ui/panda-preset` carries the whole theme over in one config
line; what's left is moving components off the Emotion runtime.

Panda styles, it doesn't ship components: pair it with [Ark UI](https://ark-ui.com) to fully replace Chakra.

## Keep the Chakra theme

[`@chakra-ui/panda-preset`](https://www.npmjs.com/package/@chakra-ui/panda-preset) mirrors Chakra's default theme:
tokens, semantic colors, recipes, slot recipes, and global styles.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@chakra-ui/panda-preset'],
  include: ['./src/**/*.{js,jsx,ts,tsx}']
})
```

Your existing token and recipe names (`bg.subtle`, `red.500`, `button`) keep working in `css()` unchanged. With
the preset in place, the theming sections below only matter where your config diverges from Chakra's defaults.

## Theming

Chakra builds a system at runtime and hands it to a provider:

```jsx
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: { value: '#0ea5e9' }
      }
    }
  }
})

const system = createSystem(defaultConfig, config)

export default function App({ children }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>
}
```

The token shape is already Panda's. Panda needs no provider: the theme lives in `panda.config.ts` and resolves at
build time:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#0ea5e9' }
        }
      }
    }
  }
})
```

See [Tokens](/docs/theming/tokens).

## css prop

Chakra v3's `css` prop carries over by name; only the component source changes:

```jsx
// before
import { Box } from '@chakra-ui/react'

<Box css={{ color: 'white', bg: 'brand' }} />

// after
import { styled } from '../styled-system/jsx'

<styled.div css={{ color: 'white', bg: 'brand' }} />
```

See [JSX Style Props](/docs/styling/style-props).

## Variants

Chakra registers recipes on the system:

```ts
import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  base: { fontWeight: 'bold' },
  variants: {
    variant: {
      solid: { bg: 'brand', color: 'white' }
    }
  }
})
```

Panda uses the same `base`/`variants` shape, in `panda.config.ts` (or colocated with `cva`/`sva`). The one new
field is `className`, the stable class name Panda emits for the recipe, which Chakra never needed because Emotion
generated hashed class names at runtime:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      recipes: {
        button: {
          className: 'button',
          base: { fontWeight: 'bold' },
          variants: {
            variant: {
              solid: { bg: 'brand.500', color: 'white' }
            }
          }
        }
      }
    }
  }
})
```

```jsx
import { button } from '../styled-system/recipes'

<button className={button({ variant: 'solid' })}>Click me</button>
```

See [Recipes](/docs/recipes/atomic-recipe) and [Slot Recipes](/docs/recipes/slot-recipes).

## Color modes

Both sides prefer semantic tokens: define the light/dark pair once, and every use site resolves per mode.

```ts filename="panda.config.ts"
theme: {
  extend: {
    semanticTokens: {
      colors: {
        bg: { value: { base: '{colors.white}', _dark: '{colors.gray.800}' } }
      }
    }
  }
}
```

```jsx
<div className={css({ bg: 'bg' })} />
```

See [Conditional Styles](/docs/styling/conditional-styles) and [Multiple Themes](/docs/theming/multiple-themes).

## Global styles

Same key, same shape, no provider:

```ts filename="panda.config.ts"
export default defineConfig({
  globalCss: {
    body: { bg: 'gray.50', color: 'gray.800' }
  }
})
```

See [Global Styles](/docs/styling/global-styles).

## Layout components

Chakra's `Box`, `Flex`, `Grid`, `Stack` map to Panda's [patterns](/docs/styling/patterns), generated into
`styled-system/jsx`:

```jsx
import { Box, Grid } from '../styled-system/jsx'

<Grid gridTemplateColumns="repeat(2, 1fr)" gap="6">
  <Box bg="brand.500">Box</Box>
</Grid>
```

## Unwind the runtime

The mechanical part of the migration is removing what Panda replaces:

- **`ChakraProvider` and `createSystem`** go away entirely. Nothing reads a theme from context; the theme is in
  the generated CSS.
- **`useColorModeValue`** call sites become [semantic tokens](#color-modes). The value branches in CSS, not in a
  hook, so the component doesn't re-render on mode change. Keep `next-themes` (or your toggle of choice) for
  setting the `.dark` class.

```jsx
// before
const bg = useColorModeValue('white', 'gray.800')

// after: css({ bg: 'bg' }) with the semantic token above
```

- **`useRecipe` / `useSlotRecipe`** become direct imports from `styled-system/recipes`. Recipes are plain
  functions now; there is no system to look them up in.

```jsx
// before
const recipe = useRecipe({ key: 'button' })
const styles = recipe({ variant: 'solid' })

// after
import { button } from '../styled-system/recipes'
const className = button({ variant: 'solid' })
```

## Interactive components

Panda doesn't ship interactive components (`Menu`, `Dialog`, `Tabs`). The replacement is wrapping Ark UI with a
slot recipe, and since Chakra v3 is built on Ark, the component anatomy is the one you already use:

```tsx
// before
import { Menu } from '@chakra-ui/react'

// after: same parts from Ark, styled by your slot recipe
import { Menu as ArkMenu } from '@ark-ui/react/menu'
import { sva } from '../styled-system/css'
import { createSlotRecipeContext } from '../styled-system/jsx'

const menu = sva({
  slots: ['root', 'trigger', 'content', 'item'],
  base: {
    content: { bg: 'white', rounded: 'md', shadow: 'lg' },
    item: { px: '3', py: '2', _highlighted: { bg: 'gray.100' } }
  }
})

const { withProvider, withContext } = createSlotRecipeContext(menu)

export const Menu = {
  Root: withProvider(ArkMenu.Root, 'root'),
  Trigger: withContext(ArkMenu.Trigger, 'trigger'),
  Content: withContext(ArkMenu.Content, 'content'),
  Item: withContext(ArkMenu.Item, 'item')
}
```

Usage sites keep their `<Menu.Root>` / `<Menu.Trigger>` markup unchanged. See
[Wrap headless libraries](/docs/design-systems/wrap-headless-libraries) for the full pattern.

## Run both during the migration

Panda's CSS ships inside cascade layers, and Emotion's injected styles are unlayered, so Chakra's styles win over
converted components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two
ways to control which side wins.

## After migrating

- **Lint against your theme.** The [lint rules](/docs/get-started/linting) flag raw values where a token exists
  and deprecated tokens as you retire Chakra-era names.
- **Drop the styling runtime.** [Source transforms](/docs/styling/source-transforms) rewrite static calls to plain
  class strings, so no styling code ships at all, the full distance from Emotion's runtime.

## See also

- [Wrap headless libraries](/docs/design-systems/wrap-headless-libraries) for Chakra-like interactive components
  without Chakra's runtime.
- [Recipes](/docs/recipes/overview) for the full recipe model this migration leans on.


---


## Panda CLI

An alternative way to use Panda is by running the Panda CLI tool.

This guide shows you how to use Panda as an alternative approach by running the Panda CLI tool.

<Steps>

### Install Panda

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Configure the content

Add the paths to all of your JavaScript or TypeScript code where you intend to use panda.

```js {5}
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{ts,tsx,js,jsx}', './pages/**/*.{ts,tsx,js,jsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3}
{
  "scripts": {
+    "prepare": "panda codegen",
  }
}
```

The `prepare` script that will run codegen after dependency installation. Read more about
[codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Import the generated CSS

For each Panda run, it emits the generated CSS at the `styled-system/styles.css` file path. Import this file at the root
component of your project.

```jsx {1}
import './styled-system/styles.css'

export function App() {
  return <div>Page</div>
}
```

### Start the Panda build process

Run the CLI tool to scan your JavaScript and TypeScript files for style properties and call expressions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    # Run it once
    pnpm panda

    # Run it in watch mode
    pnpm panda --watch
    ```

  </Tab>
  <Tab>
    ```bash
    # Run it once
    npx panda

    # Run it in watch mode
    npx panda --watch
    ```

  </Tab>
  <Tab>
    ```bash
    # Run it once
    yarn panda

    # Run it in watch mode
    yarn panda --watch
    ```

  </Tab>
  <Tab>
    ```bash
    # Run it once
    bun panda

    # Run it in watch mode
    bun panda --watch
    ```

  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Use the generated style utilities in your code and panda will extract them to the generated CSS file. Then run your
build process.

```jsx
import { css } from './styled-system/css'

export function App() {
  return <div className={css({ bg: 'red.400' })} />
}
```

</Steps>

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Ember

Easily use Panda with Ember with our dedicated integration.

This guide shows you how to set up Panda CSS in an Ember project using PostCSS.

## Start a new project

<Steps>

### Create Ember project

To get started, we will need to create a new Ember project using the `embroider` build system. We will name our project
`test-app` but you can name it whatever you want.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']} variant="code">
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dlx ember-cli@latest new test-app --embroider --no-welcome --typescript --pnpm
    ```
  </Tab>
  <Tab>
    ```bash
    npx ember-cli@latest new test-app --embroider --no-welcome --typescript
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dlx ember-cli@latest new test-app --embroider --no-welcome --typescript --yarn
    ```
  </Tab>
  <Tab>
    ```bash
    bunx ember-cli@latest new test-app --embroider --no-welcome --typescript --skip-install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

Enter the newly created directory:

```bash
cd test-app
```

### Install Panda

Install panda and its peer dependencies, as well as `postcss-loader`. Run the init command to generate the
`panda.config.ts` and `postcss.config.cjs` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev postcss postcss-loader
    pnpm panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev postcss postcss-loader
    npx panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev postcss postcss-loader
    yarn panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev postcss postcss-loader
    bun panda init --postcss
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Enable PostCSS support

In your `ember-cli-build.js` file, configure PostCSS to process your CSS files.

```js {12-23} filename="ember-cli-build.js"
'use strict'

const EmberApp = require('ember-cli/lib/broccoli/ember-app')

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
  })

  const { Webpack } = require('@embroider/webpack')
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: ['postcss-loader']
            }
          ]
        }
      }
    }
    // other options...
  })
}
```

### Configure the PostCSS plugin

Add the `.embroider` folder to the allow list so the Panda PostCSS plugin picks up your app CSS files.

```js {4} filename="postcss.config.cjs"
module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {
      allow: [/node_modules\/.embroider/]
    }
  }
}
```

### Update package.json scripts

Open the `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    // ...
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your Ember components are included in the `include` section of the `panda.config.ts`
file. Set the `outdir` to the app folder so the code can be imported in your Ember app. Adjust the `importMap`
accordingly to reflect your app name.

```js {9,20-23} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app/**/*.{js,ts,gjs,gts}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {}
  },

  // The output directory for your css system
  outdir: 'app/styled-system',

  // Configure the import map to use your project name
  importMap: 'test-app/styled-system'
})
```

### Configure CSS layers

Add this code to an `app/index.css` file.

```css filename="app/index.css"
@layer reset, base, tokens, recipes, utilities;
```

Next, import the file in your `app/app.ts` file.

```ts {5} filename="app/app.ts"
import Application from '@ember/application'
import Resolver from 'ember-resolver'
import loadInitializers from 'ember-load-initializers'
import config from 'test-app/config/environment'
import 'test-app/index.css'

export default class App extends Application {
  modulePrefix = config.modulePrefix
  podModulePrefix = config.podModulePrefix
  Resolver = Resolver
}

loadInitializers(App, config.modulePrefix)
```

### Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm start
    ```
  </Tab>
  <Tab>
    ```bash
    npm run start
    ```
  </Tab>
  <Tab>
    ```bash
    yarn start
    ```
  </Tab>
  <Tab>
    ```bash
    bun start
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project.

```ts filename="app/components/hello-panda.ts"
import Component from '@glimmer/component'
import { css } from 'test-app/styled-system/css'

export default class HelloPanda extends Component {
  style = css({ fontSize: '5xl', fontWeight: 'bold' })
}
```

```hbs filename="app/components/hello-panda.hbs"
<div class={{this.style}}>Hello 🐼!</div>
```

```hbs {5} filename="app/templates/application.hbs"
{{page-title 'TestApp'}}

<h2 id='title'>Welcome to Ember</h2>

<HelloPanda />

{{outlet}}
```

> For the best developer experience, set up
> [template tag component authoring format](https://guides.emberjs.com/release/components/template-tag-format/) in
> Ember.

</Steps>

## Ship without the styling runtime

This setup resolves `css()` calls with a small runtime in the browser. Panda's webpack plugin can rewrite them to plain
class strings at build time instead. See [Source transforms](/docs/styling/source-transforms).

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["app/styled-system"]
}
```


---


## Migrating from Emotion

Migrate your project from Emotion to Panda and see how css, styled, and theming map across.

Emotion computes styles at runtime and ships no variant system, color modes, or layout components, so this
migration is mostly replacing hand-rolled patterns with typed built-ins. Two constraints shape the work:
`` css`...` `` template literals become objects, and Emotion's runtime plumbing gets deleted, not translated.

## Template literals to objects

Panda's extractor reads style objects from source; it does not parse CSS text. Emotion's idiomatic tagged
templates become objects:

```jsx
import { css } from '@emotion/react'

// before
const style = css`
  color: white;
  background: blue;
  &:hover {
    background: darkblue;
  }
`
```

```jsx
import { css } from '../styled-system/css'

// after
const style = css({
  color: 'white',
  background: 'blue',
  _hover: { background: 'darkblue' }
})
```

Emotion's object syntax converts almost unchanged. `styled.x` tagged templates follow the same rule; the
conversion is identical to [Migrating from Styled Components](/docs/get-started/styled-components#objects-not-template-literals).

## css prop

Emotion's `css` prop needs the `@jsxImportSource @emotion/react` pragma. Panda's `styled` factory accepts a `css`
prop with no pragma or special JSX runtime:

```jsx
/** @jsxImportSource @emotion/react */
// before
<div css={{ color: 'white', background: 'blue' }} />
```

```jsx
import { styled } from '../styled-system/jsx'

// after
<styled.div css={{ color: 'white', bg: 'blue' }} />
```

See [JSX Style Props](/docs/styling/style-props).

`cx` carries over by name, and Panda's resolves style conflicts instead of just joining strings:

```jsx
// before
import { cx } from '@emotion/css'

// after
import { cx } from '../styled-system/css'
```

## Theming

Emotion passes a plain theme object through `ThemeProvider` and reads it back with `useTheme`:

```jsx
// before
const theme = { colors: { brand: '#0ea5e9' } }

<ThemeProvider theme={theme}>...</ThemeProvider>

function Button() {
  const theme = useTheme()
  return <button css={{ background: theme.colors.brand }} />
}
```

Panda resolves tokens at build time, so the provider and the hook both disappear:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#0ea5e9' }
        }
      }
    }
  }
})
```

```jsx
import { css } from '../styled-system/css'

<button className={css({ bg: 'brand' })} />
```

Where you read the theme outside a style object, `token` replaces `useTheme`:

```jsx
import { token } from '../styled-system/tokens'

<Chart color={token('colors.brand')} />
```

See [Tokens](/docs/theming/tokens).

## Hand-rolled patterns to built-ins

The features teams build on top of Emotion are Panda built-ins:

**Variant functions** become typed [recipes](/docs/recipes/atomic-recipe). `button({ variant: 'accent' })` is a
type error if `accent` was never defined; the hand-rolled version has no safety net.

```jsx
// before: prop branching in a template
const Button = styled.button`
  ${props => (props.variant === 'primary' ? `background: blue;` : `background: gray;`)}
`
```

```ts
// after
import { cva } from '../styled-system/css'

export const button = cva({
  variants: {
    variant: {
      primary: { bg: 'blue.500' },
      secondary: { bg: 'gray.500' }
    }
  }
})
```

**Theme-swapping for dark mode** becomes a semantic token, defined once, no context read at the usage site:

```ts filename="panda.config.ts"
theme: {
  extend: {
    semanticTokens: {
      colors: {
        bg: { value: { base: 'white', _dark: 'gray.900' } }
      }
    }
  }
}
```

```jsx
<div className={css({ bg: 'bg' })} />
```

**The `Global` component** becomes the `globalCss` config key ([Global Styles](/docs/styling/global-styles)):

```ts filename="panda.config.ts"
export default defineConfig({
  globalCss: {
    body: { margin: 0 }
  }
})
```

**Hand-built `Box`/`Stack` components** become [patterns](/docs/styling/patterns):

```jsx
import { Box, Stack } from '../styled-system/jsx'

<Stack gap="4">
  <Box bg="gray.100">Item</Box>
</Stack>
```

**The `keyframes` helper** becomes [`theme.keyframes`](/docs/theming/theme#keyframes), referenced by name and
composable via [Animation Styles](/docs/theming/animation-styles).

## SSR and cache teardown

Emotion's server plumbing exists to flush runtime styles into HTML. Panda's CSS is a static file, so delete it
all, nothing replaces it:

- `@emotion/cache` and `CacheProvider` setups (including nonce and insertion-point config)
- `extractCriticalToChunks` / `constructStyleTagsFromChunks` server code
- `@emotion/babel-plugin` and the `@jsxImportSource` pragmas
- The `ThemeProvider`, once every consumer reads tokens instead

## Run both during the migration

Panda's CSS ships inside cascade layers and Emotion's injected styles are unlayered, so legacy styles win over
converted components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two
ways to control which side wins.

## After migrating

- **Drop the styling runtime.** [Source transforms](/docs/styling/source-transforms) rewrite static calls to plain
  class strings at build time; combined with leaving Emotion, your bundle ships no styling code at all.
- **Lint against your theme.** The [lint rules](/docs/get-started/linting) flag raw values where a token exists,
  which keeps the token discipline the migration just bought you.

## See also

- [Migrating from Styled Components](/docs/get-started/styled-components) for the shared `styled` conversion in
  more depth.
- [Dynamic Styles](/docs/styling/dynamic-styling) for values that genuinely only exist at runtime.


---


## FAQs

Common questions, short answers.

<Faq>

<Details>
<summary>Why aren't my styles applied?</summary>

Check that the [`@layer` order](/docs/styling/cascade-layers#layer-css) is declared and the stylesheet is imported. Without
PostCSS, import `styled-system/styles.css` and run `panda` (or `panda --watch`).

</Details>

<Details id="browser-support">
<summary>Which browsers does Panda support?</summary>

Panda needs CSS variables, [cascade layers](https://caniuse.com/css-cascade-layers), and modern selectors like
[`:where()`](https://caniuse.com/mdn-css_selectors_where) / [`:is()`](https://caniuse.com/css-matches-pseudo).

```txt
>= 1%
last 1 major version
not dead
Chrome >= 99
Edge >= 99
Firefox >= 97
iOS >= 15.4
Safari >= 15.4
Android >= 115
Opera >= 73
```

For older browsers:

- Set `polyfill: true` (or `--polyfill`) so cascade-layer order works without `@layer`. See
  [Cascade Layers](/docs/styling/cascade-layers#polyfills).
- Add [autoprefixer](https://github.com/postcss/autoprefixer) in PostCSS when you need vendor prefixes.
- Transform and filter utilities use `@property` (Safari 16.4+, Firefox 128+). Set
  [`optimize.propertyFallback`](/docs/styling/optimization#older-browsers) if you need older engines.

</Details>

<Details>
<summary>How are style conflicts resolved?</summary>

Shorthand and longhand can both emit. Longhands win when they target a more specific side. Panda sorts by property
breadth, not source order.

```jsx
css({ padding: '10px', paddingTop: '20px' })
// → .p_10px { padding: 10px } then .pt_20px { padding-top: 20px }
```

</Details>

<Details>
<summary>Why isn't HMR working?</summary>

**Path aliases.** Set `importMap` to match your `tsconfig` paths:

```ts filename="panda.config.ts"
export default defineConfig({
  importMap: '@my-path'
})
```

**Config changes.** List files that should reload the context in
[`dependencies`](/docs/reference/config#dependencies):

```ts filename="panda.config.ts"
export default defineConfig({
  dependencies: ['path/to/files/**.ts']
})
```

</Details>

<Details>
<summary>Should I commit the styled-system folder?</summary>

No. Regenerate it with `panda codegen` or `panda`.

</Details>

<Details>
<summary>Why doesn't `styled` exist?</summary>

Set [`jsxFramework`](/docs/styling/style-props#configure-jsx) so Panda generates JSX helpers. Rename the factory with
[`jsxFactory`](/docs/reference/config#jsxfactory) if you want.

</Details>

<Details>
<summary>Atomic or config recipes?</summary>

[Config recipes](/docs/recipes/config-recipe) emit only the variants you use. Prefer them for shared design-system
components.

[Atomic recipes](/docs/recipes/atomic-recipe) (`cva`) emit every variant. Prefer them when you want styles colocated with
the component.

</Details>

<Details>
<summary>How do I type and split recipe props?</summary>

Config recipe:

```ts
import { button, type ButtonVariantProps } from '../styled-system/recipes'
```

Atomic recipe:

```ts
import { cva, type RecipeVariantProps } from '../styled-system/css'

export type ButtonVariantProps = RecipeVariantProps<typeof buttonStyle>
```

Split variants from the rest with `splitVariantProps`:

```tsx
const [buttonProps, cssProps] = button.splitVariantProps(props)
```

</Details>

<Details>
<summary>Does Panda ship a runtime?</summary>

A small one. CSS is generated at build time; in the browser, `css()` only resolves class strings. Turn on
[source transforms](/docs/styling/source-transforms) and the bundler rewrites static calls to plain class strings
at build time, so even that runtime drops out of the bundle.

</Details>

<Details>
<summary>How do I read a token at runtime?</summary>

Use [`token`](/docs/reference/tokens) from `styled-system/tokens`:

```tsx
import { token } from '../styled-system/tokens'

<div style={{ background: token('colors.blue.200') }} />
```

</Details>

<Details>
<summary>Why did my preset replace the defaults?</summary>

You need `extend`. Without it, your theme or preset replaces the base instead of merging.

For tokens, omit `extend` only when you want a full override. To keep some defaults, import `@pandacss/preset-panda` and
pick what you need.

</Details>

<Details>
<summary>Why isn't `base` working?</summary>

Use `base`, not `_base`. There is no underscore.

```ts
css({ color: { base: 'red.600', _dark: 'white' } })
```

</Details>

<Details>
<summary>defineConfig vs definePreset?</summary>

`defineConfig` is for the app. It exposes every config key.

`definePreset` is for shareable presets. It only includes keys that merge into an app config. See
[Creating a preset](/docs/theming/presets#creating-a-preset).

</Details>

<Details>
<summary>Can I use dynamic styles?</summary>

Yes, with limits. See [Dynamic Styles](/docs/styling/dynamic-styling).

</Details>

<Details>
<summary>How do I build a design system?</summary>

See [Design systems](/docs/design-systems/overview).

</Details>

<Details>
<summary>Why don't imported images work in Vite?</summary>

Panda can't know Vite's final asset URL at extract time. Put `backgroundImage` on `style` instead:

```jsx
import bg from './my-image.png'

<p
  className={css({ bg: 'red.300', backgroundRepeat: 'repeat' })}
  style={{ backgroundImage: `url("${bg}")` }}
/>
```

</Details>

<Details>
<summary>Jest or esbuild can't resolve styled-system?</summary>

Set [`outExtension: 'js'`](/docs/reference/config#outextension). For Jest, also transform with `ts-jest` and set
`allowJs: true` in `tsconfig`.

</Details>

<Details>
<summary>Why does codegen fail with an es5 error?</summary>

Raise the TypeScript target:

```json filename="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2017"
  }
}
```

</Details>

<Details>
<summary>How do I generate every CSS variant?</summary>

Use [`staticCss`](/docs/styling/static). Avoid wide `*` lists if you want to keep usage-based CSS. See
[Optimization](/docs/styling/optimization#less-staticcss).

</Details>

<Details>
<summary>Can I write one-off media queries?</summary>

Yes. Put `@media`, `@container`, or `@supports` keys in the style object:

```js
css({
  '@media (min-width: 10px)': { fontSize: 'xl' },
  '@supports (display: flex)': { color: 'red.300' }
})
```

</Details>

<Details>
<summary>How do I stop other libraries overriding my styles?</summary>

Import their CSS into a lower cascade layer, then put that layer before Panda's:

```css
@import url('bootstrap.css') layer(bootstrap);

@layer bootstrap, reset, base, tokens, recipes, utilities;
```

</Details>

<Details>
<summary>How do I debug styles?</summary>

Run [`panda debug`](/docs/reference/debugging#panda-debug). If that doesn't help, search
[GitHub issues](https://github.com/chakra-ui/panda/issues) or ask in [Discord](https://discord.gg/VQrkpsgSx7). Open a
minimal reproduction when you file an issue.

</Details>

</Faq>


---


## Framework Guides

Start using Panda CSS in your JavaScript framework, with a dedicated, step-by-step guide for each.

Start using Panda CSS in your JavaScript framework using our framework-specific guides that cover our recommended
approach.

<FrameworkCards />


---


## Using Gatsby

Easily use Panda with Gatsby with our dedicated integration.

This guide shows you how to set up Panda CSS in a Gatsby project using PostCSS.

<Steps>

### Create Gatsby project

To get started, we will need to create a new Gatsby project. We will name our project `test-app` but you can name it
whatever you want.

If you don't enter any parameter, the CLI will guide you through the process of creating a new Gatsby app.

```bash
npm init gatsby
```

You will be asked a few questions, answer them as follows:

```
✔ What would you like to call your site? ... My Gatsby Site
✔ What would you like to name the folder where your site will be created? ... projects/ test-app
✔ Will you be using JavaScript or TypeScript? ... TypeScript
✔ Will you be using a CMS? ... No (or I'll add it later)
✔ Would you like to install a styling system? ... No (or I'll add it later)
✔ Would you like to install additional features with other plugins? ... No items were selected
```

Enter the newly created directory:

```bash
cd test-app
```

### Install Panda CSS

Install Panda CSS and `gatsby-plugin-postcss` to your project. After that run the `panda init` command to setup Panda
CSS in your project.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

```bash
npm install -D @pandacss/dev postcss gatsby-plugin-postcss
npx panda init --postcss
```

### Setup the Gatsby PostCSS plugin

Include the plugin in your `gatsby-config.ts` file. Check out the
[official documentation](https://www.gatsbyjs.com/plugins/gatsby-plugin-postcss/) for more information.

```ts {9} filename="gatsby-config.ts"
import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: `My Gatsby Site`,
    siteUrl: `https://www.yourdomain.tld`
  },
  graphqlTypegen: true,
  plugins: [`gatsby-plugin-postcss`]
}

export default config
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "develop": "gatsby develop",
    "start": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve",
    "clean": "gatsby clean",
    "typecheck": "tsc --noEmit"
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your React components are included in the `include` section of the `panda.config.ts`
file.

> If you use [GraphQL Typegen](https://www.gatsbyjs.com/docs/how-to/local-development/graphql-typegen/), you'll need to update the `include` to
> avoid infinite loop due to generated `src/gatsby-types.d.ts`.

```js {7} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  // Where to look for your css declarations
  include: ['./src/pages/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Configure CSS layers

Create `src/styles/index.css` file and add the following content:

```css filename="src/styles/index.css"
@layer reset, base, tokens, recipes, utilities;
```

Create a `gatsby-browser.ts` file in the root of your project and add the following content:

```ts filename="gatsby-browser.ts"
import './src/styles/index.css'
```

### Start your build process

Run the following command to start your development server.

```bash
npm run develop
```

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`src/pages/index.tsx` file.

```tsx {3,7} filename="src/pages/index.tsx"
import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { css } from '../../styled-system/css'

const IndexPage: React.FC<PageProps> = () => {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}

export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
```

</Steps>

## Ship without the styling runtime

This setup resolves `css()` calls with a small runtime in the browser. Panda's webpack plugin can rewrite them to plain
class strings at build time instead. See [Source transforms](/docs/styling/source-transforms).

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Linting

A Panda-aware lint rule set for ESLint and Oxlint, catching mistakes the compiler doesn't error on.

A style object can be valid TypeScript and still be wrong. `color: '#ef4444'` renders fine but ignores the `red.500`
token your theme already owns; `color: 'red.1000'` is quieter still: the compiler skips it, and you find out in the
browser.

The lint rules catch these in real time. They run on Panda's own compiler, so they know your actual theme: which raw
values have a token waiting, which token paths resolve. One package, two entry points, same rules:

```txt
@pandacss/eslint-plugin            # ESLint flat config
@pandacss/eslint-plugin/oxlint     # Oxlint entry, reuses the same rules
```

## ESLint setup

The recommended config preloads your Panda project so rules can resolve tokens and recipes:

```ts filename="eslint.config.mjs"
import panda from '@pandacss/eslint-plugin'

export default [await panda.configs.recommended({ configPath: './panda.config.ts' })]
```

`recommended` turns on the rules marked **default** in the table below. Add any other rule as a second config entry:

```ts filename="eslint.config.mjs"
import panda from '@pandacss/eslint-plugin'

export default [
  await panda.configs.recommended({ configPath: './panda.config.ts' }),
  {
    rules: {
      '@pandacss/no-important': 'error',
      '@pandacss/no-margin-properties': 'warn'
    }
  }
]
```

<Callout type="info">If `eslint.config.js` isn't ESM, rename it to `eslint.config.mjs`.</Callout>

## Oxlint setup

Register the plugin in `.oxlintrc.json`. Oxlint has no `recommended` preset to import, so list every rule you want on,
including the ones marked **default** below, oxlint won't turn them on for you:

```json filename=".oxlintrc.json"
{
  "jsPlugins": ["@pandacss/eslint-plugin/oxlint"],
  "rules": {
    "@pandacss/no-invalid-token-paths": "error",
    "@pandacss/no-invalid-nesting": "error",
    "@pandacss/file-not-included": "error",
    "@pandacss/no-deprecated": "warn",
    "@pandacss/no-debug": "warn",
    "@pandacss/extraction-diagnostics": "warn",
    "@pandacss/prefer-token": ["warn", { "categories": ["colors"] }]
  }
}
```

The Panda config is auto-discovered from the working directory. Point it elsewhere with `PANDA_CONFIG_PATH`:

```sh
PANDA_CONFIG_PATH=./apps/web/panda.config.ts oxlint
```

Alpha: needs `oxlint` and `@oxlint/plugins`, and binds one Panda project per run, a monorepo with several
`panda.config.ts` files needs a small local plugin per project (see the
[package README](https://github.com/chakra-ui/panda/blob/v2/packages/eslint-plugin/README.md#oxlint)).

## Recommended and opt-in rules

| Rule                        | ESLint `recommended` | Severity |
| --------------------------- | -------------------- | -------- |
| `no-invalid-token-paths`    | default              | error    |
| `no-invalid-nesting`        | default              | error    |
| `file-not-included`         | default              | error    |
| `no-deprecated`             | default              | warn     |
| `no-debug`                  | default              | warn     |
| `extraction-diagnostics`    | default              | warn     |
| `prefer-token`              | default, colors only | warn     |
| `no-primitive-token`        | opt-in               | —        |
| `no-important`              | opt-in               | —        |
| `no-margin-properties`      | opt-in               | —        |
| `no-descendant-selectors`   | opt-in               | —        |
| `no-physical-properties`    | opt-in               | —        |
| `no-shorthand-longhand-mix` | opt-in               | —        |
| `consistent-property-style` | opt-in               | —        |
| `prefer-text-style`         | opt-in               | —        |

"Recommended" means `panda.configs.recommended()` enables it for ESLint. Oxlint doesn't read that config at all, so
nothing is automatic there, every row in your `.oxlintrc.json` `rules` block is something you opted into.

## Correctness rules

These catch code that silently produces no CSS, or the wrong CSS. The recommended config enables all of them, plus
[`no-deprecated`](#no-deprecated), [`no-debug`](#no-debug), and [`prefer-token`](#prefer-token) for colors.

#### no-invalid-token-paths

The rule reports token paths that are missing from your theme. It checks `token()` calls and the `{…}` and `token(…)`
references inside style values, including shadows, borders, and `calc()`.

A fallback doesn't suppress the report: `token(sizes.ghost, 10px)` emits valid CSS using `10px`, but still references a
missing theme token. `panda cssgen` also warns once per missing path in each call or JSX element, at the start of that
call or element. Lint reports each reference separately, with a tighter source location when available.

```tsx
// ❌ 'colors.ghost' and 'sizes.ghost' are not in the theme
css({
  boxShadow: '0 0 0 1px {colors.ghost}',
  width: 'calc(token(sizes.ghost) + 2px)'
})

// ✅
css({
  boxShadow: '0 0 0 1px {colors.red.500}',
  width: 'calc(token(sizes.4) + 2px)'
})
```

#### no-invalid-nesting

A nested selector without `&` is silently ignored by the compiler.

```tsx
// ❌ no "&", Panda skips the whole block
css({ ':hover': { color: 'red.500' } })

// ✅ either form works
css({ '&:hover': { color: 'red.500' } })
css({ _hover: { color: 'red.500' } })
```

#### file-not-included

A file that calls Panda's style functions but sits outside the config's `include` globs extracts nothing. Every `css()`
call in it is dead.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  include: ['src/**/*.tsx']
  // ❌ lib/button.tsx calls css() but is not covered
})
```

#### extraction-diagnostics

Relays the compiler's own diagnostics into the editor: a typo'd condition key, a value extraction can't resolve
statically, anything the build would warn about. This is the rule that surfaces
[dynamic styling](/docs/styling/dynamic-styling) mistakes at lint time instead of at runtime.

```tsx
// ❌ '_hver' is not a condition, the compiler ignores it
css({ _hver: { color: 'red.500' } })
```

## Deprecation

#### no-deprecated

Flags tokens, utilities, recipes, and patterns marked [`deprecated`](/docs/reference/deprecations) in the config. Scope
it with `kinds` if you only care about some of them.

```tsx
// theme: brand: { value: '#facc15', deprecated: 'use colors.accent instead' }

// ❌ deprecated token
css({ color: 'brand' })

// ✅
css({ color: 'accent' })
```

## Consistency rules

These enforce house style across a team. `prefer-token` is the exception, it's already on by default for colors;
everything else here is opt-in, turn on the ones that match yours.

#### prefer-token

A raw value where a token exists for that category. The suggestion names the token, so the fix is a copy-paste. On by
default, scoped to `colors`; widen with `categories` to cover more.

```tsx
// ❌ raw value, theme has red.500
css({ color: '#ef4444' })

// ✅
css({ color: 'red.500' })
```

```ts
'@pandacss/prefer-token': ['warn', { categories: ['colors', 'spacing', 'radii'] }]
```

#### no-primitive-token

Stricter than `prefer-token`: flags primitive palette tokens where a semantic token exists, so component code tracks
intent instead of a palette.

```tsx
// ❌ primitive, theme defines fg.error
css({ color: 'red.500' })

// ✅
css({ color: 'fg.error' })
```

#### prefer-text-style

Several typography properties set individually that should collapse into one `textStyle` token.

```tsx
// ❌ ad-hoc typography
css({ fontSize: '2xl', fontWeight: 'bold', lineHeight: '1.2' })

// ✅
css({ textStyle: 'heading.lg' })
```

#### consistent-property-style

One spelling per property across the codebase. Configure `style` as `'shorthand'` or `'longhand'`.

```tsx
// with { style: 'shorthand' }

// ❌
css({ marginLeft: '4' })

// ✅
css({ ml: '4' })
```

#### no-shorthand-longhand-mix

A shorthand and its longhand in the same object resolve in an order you probably didn't intend.

```tsx
// ❌ does marginLeft win? don't make readers guess
css({ margin: '4', marginLeft: '5' })

// ✅
css({ marginTop: '4', marginLeft: '5' })
```

## Hygiene rules

Opt-in, apart from `no-debug`.

#### no-debug

The `debug` property left in source. Useful locally, noise in a commit.

```tsx
// ❌
css({ debug: true, color: 'red.500' })
```

#### no-important

`!important` in a style value, in either spelling.

```tsx
// ❌ both forms flagged
css({ color: 'red.500!' })
css({ _hover: { color: 'red.500 !important' } })
```

#### no-margin-properties

Margins couple a component to its surroundings. Prefer `gap` and layout patterns, so spacing lives in the parent.

```tsx
// ❌ child decides its own spacing
css({ mt: '4' })

// ✅ parent owns the spacing
css({ display: 'flex', flexDirection: 'column', gap: '4' })
```

#### no-descendant-selectors

A selector that styles another element (`& > li`, `.foo &`) couples components through the DOM tree. Off by default;
turn it on for StyleX-style per-element scoping.

```tsx
// ❌ styles the children, not the element
css({ '& > li': { marginBlock: '2' } })

// ✅ cross-element state through a condition
css({ _groupHover: { opacity: 1 } })
```

#### no-physical-properties

Physical properties break RTL layouts. Use logical equivalents.

```tsx
// ❌
css({ left: '0', marginLeft: '4' })

// ✅
css({ insetInlineStart: '0', marginInlineStart: '4' })
```

## See also

- [Linting a design system](/docs/design-systems/linting) for enforcing token usage across consuming apps.
- [Diagnostics Reference](/docs/reference/diagnostics) for the compiler-level diagnostic codes this plugin builds on top
  of.
- [Dynamic Styles](/docs/styling/dynamic-styling) for the extraction constraint the compiler enforces.


---


## LLMs.txt

Help AI tools understand Panda CSS with LLMs.txt support.

## What is LLMs.txt?

[LLMs.txt](https://llmstxt.org/) files are used to provide the Panda CSS documentation to large language models (LLMs).
This helps AI tools better understand our styling engine, its APIs, and usage patterns.

## Available Routes

These routes are available to help AI tools access our documentation:

- [/llms.txt](/llms.txt) - Contains a structured overview of all concepts and their documentation links
- [/llms-full.txt](/llms-full.txt) - Provides comprehensive documentation including implementation details and examples

## Access Individual Pages

You can also access the raw markdown content for any documentation page by adding `.mdx` to the end of the URL. For
example:

- [`/docs/get-started/why-panda.mdx`](/docs/get-started/why-panda.mdx) - Raw markdown for the welcome page
- [`/docs/recipes/atomic-recipe.mdx`](/docs/recipes/atomic-recipe.mdx) - Raw markdown for the recipes documentation
- [`/docs/theming/tokens.mdx`](/docs/theming/tokens.mdx) - Raw markdown for the tokens documentation

This is useful for AI tools that need to access specific documentation sections directly.

## Usage with AI Tools

### Cursor

Use the `@Docs` feature in Cursor to include the LLMs.txt files in your project. This helps Cursor provide more accurate
code suggestions and documentation for Panda CSS.

[Read more about @Docs in Cursor](https://docs.cursor.com/context/@-symbols/@-docs)

### Windsurf

Reference the LLMs.txt files using `@` or in your `.windsurfrules` files to enhance Windsurf's understanding of Panda
CSS.

[Read more about Windsurf Memories](https://docs.windsurf.com/windsurf/cascade/memories#memories)

### Other AI Tools

Any AI tool that supports LLMs.txt can use these routes to better understand Panda CSS. Simply point your tool to any of
the routes above to get comprehensive documentation about our styling engine.


---


## MCP Server

Expose your Panda CSS design system to AI assistants using the Model Context Protocol (MCP).

The Panda MCP Server allows AI assistants like Claude, Cursor, VS Code Copilot, Windsurf, and Codex to understand and
work with your project's design system. It provides tools for querying tokens, recipes, patterns, conditions, and more.

## What is MCP?

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard for connecting AI assistants to
external tools and data sources. Panda's MCP server exposes your design system through a set of specialized tools that
AI assistants can use to:

- Look up design tokens and their values
- Understand available component recipes and variants
- Query layout patterns and their properties
- Inspect configured conditions, animations, and style compositions
- Audit source usage and find unused tokens, recipes, patterns, and keyframes

## Quick Start

### 1. Add the MCP Server

Add the Panda MCP server to your AI client's MCP configuration:

```json
{
  "mcpServers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp"]
    }
  }
}
```

For VS Code, use the `servers` key instead of `mcpServers`.

### 2. Use with Your AI Assistant

Once configured, your AI assistant will automatically have access to Panda CSS tools. You can ask questions like:

- "What color tokens are available in my design system?"
- "Show me the button recipe variants"
- "What text styles are available?"
- "What breakpoints are defined?"

## CLI Commands

The MCP server is distributed as `@pandacss/mcp`. It is usually started by your AI client, but you can also run it
directly with `npx`, `pnpm dlx`, or your package manager's equivalent one-off package runner.

Start the MCP server manually (usually not needed - clients start it automatically).

```bash
pnpm dlx @pandacss/mcp

# With custom config path
pnpm dlx @pandacss/mcp --config ./panda.config.ts

# Specify working directory
pnpm dlx @pandacss/mcp --cwd ./my-project
```

| Flag                  | Description               |
| --------------------- | ------------------------- |
| `--config, -c <path>` | Path to Panda config file |
| `--cwd <path>`        | Current working directory |
| `--silent`            | Suppress startup logs     |

## Supported AI Clients

The MCP server can be used with AI assistants that support local stdio MCP servers:

| Client   | Typical Config Path  | Config Key   |
| -------- | -------------------- | ------------ |
| Claude   | `.mcp.json`          | `mcpServers` |
| Cursor   | `.cursor/mcp.json`   | `mcpServers` |
| VS Code  | `.vscode/mcp.json`   | `servers`    |
| Windsurf | `.windsurf/mcp.json` | `mcpServers` |
| Codex    | `.codex/mcp.json`    | `mcpServers` |

## Available Tools

The MCP server exposes these tools to AI assistants:

| Tool                   | Description                                                           | Input                                  |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| `get_tokens`           | Get design tokens with values, CSS variables, and usage examples      | `category?` - filter by token category |
| `get_semantic_tokens`  | Get semantic tokens with conditional values (dark mode, responsive)   | `category?` - filter by token category |
| `get_color_palette`    | Get the complete color palette                                        | -                                      |
| `get_recipes`          | Get component recipes with variants and default values                | `name?` - filter by recipe name        |
| `get_patterns`         | Get layout patterns with properties and usage examples                | `name?` - filter by pattern name       |
| `get_conditions`       | Get all conditions (breakpoints, pseudo-classes, color modes)         | -                                      |
| `get_keyframes`        | Get keyframe animations defined in the theme                          | -                                      |
| `get_text_styles`      | Get text style compositions for typography                            | -                                      |
| `get_layer_styles`     | Get layer style compositions for visual styling                       | -                                      |
| `get_animation_styles` | Get animation style compositions                                      | -                                      |
| `get_config`           | Get the resolved Panda CSS configuration                              | -                                      |
| `get_usage_report`     | Scan source files for design-system usage and unused configured names | `scope?` - select a report scope       |

`get_usage_report` scans files matching your configured `include` and `exclude` paths on each call. Its optional `scope`
accepts `all` (the default), `tokens`, `recipes`, `utilities`, `patterns`, or `keyframes`.

Reports include usage counts, source locations, unused configured names, and diagnostics. Token reports also include raw
values and token suggestions; recipe reports include variant usage. Reports with file-read errors or JavaScript parse
errors are returned as MCP tool errors and may be incomplete. Other tools query your resolved design-system
configuration.

## Configuration

For most MCP clients, use this configuration:

```json
{
  "mcpServers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp"]
    }
  }
}
```

The server automatically loads your `panda.config.ts` from the current working directory when started.

### Claude

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp"]
    }
  }
}
```

### Cursor

Create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp"]
    }
  }
}
```

### VS Code

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp"]
    }
  }
}
```

### Custom Config Path

If your Panda config is not in the default location, specify it explicitly:

```json
{
  "mcpServers": {
    "panda": {
      "command": "npx",
      "args": ["-y", "@pandacss/mcp", "--config", "./path/to/panda.config.ts"]
    }
  }
}
```

## Example Interactions

Here are some example prompts you can use with AI assistants once MCP is configured:

### Exploring Tokens

> "What spacing tokens are available?"

The AI will use `get_tokens` with `category: "spacing"` to show you all spacing values.

### Understanding Recipes

> "How do I use the button recipe with a destructive variant?"

The AI will use `get_recipes` with `name: "button"` to show variants and usage.

### Finding unused tokens

> "Which tokens aren't used in this project?"

The AI will use `get_usage_report` with `scope: "tokens"` to show token usage and unused configured tokens.

### Auditing patterns and animations

> "Where do we use the stack pattern?"

The AI will use `get_usage_report` with `scope: "patterns"` to show pattern usage and source locations. Use
`scope: "keyframes"` to audit animation references, or `scope: "all"` for all five usage categories.

### Checking Conditions

> "What responsive breakpoints are defined?"

The AI will use `get_conditions` to show all available breakpoints.

## Troubleshooting

### Server Not Starting

If the MCP server fails to start:

1. Ensure Panda CSS is installed: `pnpm add -D @pandacss/dev`
2. Verify you have a valid `panda.config.ts` in your project
3. Check that `npx -y @pandacss/mcp` runs without errors

### Tools Not Available

If tools aren't showing up in your AI assistant:

1. Restart the AI assistant after adding the MCP configuration
2. Verify the config file is in the correct location
3. Check the AI assistant's MCP documentation for any additional setup steps

### Usage report scans no files

Check that the `include` paths in `panda.config.ts` cover your source files and that the MCP server starts from your
project directory. Files matching `exclude` are not scanned.


---


## Using Next.js

Easily use Panda with Next.js with our dedicated integration.

Setting up Panda CSS with Next.js is straightforward. Follow the steps below to get started.

If you don't have Next.js app installed, you can follow the [Create a Next.js app](#start-a-new-project) section to
create a new Next.js app, otherwise you can skip to the [Install Panda CSS](#install-panda-css) section.

<RouteSwitch values={["app-dir","pages-dir"]}>

## Start a new project

You can chose between these two options to start a new project:

<RouteSwitchTrigger values={['Using App Router', 'Using Pages Router']} />

  <Steps>
  ### Create a Next.js app

First, create a Next.js app using the official [Create Next App](https://nextjs.org/docs/api-reference/create-next-app)
CLI. We will name our project `test-app` but you can name it whatever you want.

If you don't enter any parameter, the CLI will guide you through the process of creating a new Next.js app.

  <Tabs items={['pnpm', 'npm', 'yarn', 'bun']} variant="code">
    {/* <!-- prettier-ignore-start --> */}
    <Tab>
      ```bash
      pnpm dlx create-next-app@latest --use-pnpm
      ```
    </Tab>
    <Tab>
      ```bash
      npx create-next-app@latest --use-npm
      ```
    </Tab>
    <Tab>
      ```bash
      yarn dlx create-next-app@latest --use-yarn
      ```
    </Tab>
    <Tab>
      ```bash
      bunx create next-app@latest --use-bun
      ```
    </Tab>
    {/* <!-- prettier-ignore-end --> */}
  </Tabs>

You will be asked a few questions, answer them as follows:

  <RouteSwitchContent value="app-dir">
  {/* <!-- prettier-ignore-start --> */}
    ```bash
    ✔ What is your project named? … test-app
    ✔ Would you like to use TypeScript with this project? … Yes
    ✔ Would you like to use ESLint with this project? … Yes
    ✔ Would you like to use Tailwind CSS with this project? … No
    ✔ Would you like to use `src/` directory with this project? … Yes
    ✔ Use App Router (recommended)? … Yes
    ✔ Would you like to customize the default import alias? … No
    ```
  {/* <!-- prettier-ignore-end --> */}
  </RouteSwitchContent>
  <RouteSwitchContent value="pages-dir">
  {/* <!-- prettier-ignore-start --> */}
    ```bash
    ✔ What is your project named? … test-app
    ✔ Would you like to use TypeScript with this project? … Yes
    ✔ Would you like to use ESLint with this project? … Yes
    ✔ Would you like to use Tailwind CSS with this project? … No
    ✔ Would you like to use `src/` directory with this project? … Yes
    ✔ Use App Router (recommended)? … No
    ✔ Would you like to customize the default import alias? … No
    ```
  {/* <!-- prettier-ignore-end --> */}
  </RouteSwitchContent>

Enter the newly created directory:

```bash
cd test-app
```

### Install Panda CSS

Install Panda CSS dependency using your favorite package manager.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

  <Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
    <Tab>
      ```bash
      pnpm install -D @pandacss/dev
      pnpm panda init --postcss
      ```
    </Tab>
    <Tab>
      ```bash
      npm install -D @pandacss/dev
      npx panda init --postcss
      ```
    </Tab>
    <Tab>
      ```bash
      yarn add -D @pandacss/dev
      yarn panda init --postcss
      ```
    </Tab>
    <Tab>
      ```bash
      bun add -D @pandacss/dev
      bun panda init --postcss
      ```
    </Tab>
  {/* <!-- prettier-ignore-end --> */}
  </Tabs>

`panda init --postcss` command will automatically create a `postcss.config.cjs` file at the root of your project
with the following code:

```js {3}
module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {}
  }
}
```

For advanced configuration follow the Next.js PostCSS guide to set up a custom PostCSS configuration by referring to
this [link](https://nextjs.org/docs/pages/building-your-application/configuring/post-css#customizing-plugins).

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3}
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

The `prepare` script that will run codegen after dependency installation. Read more about
[codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your React components are included in the `include` section of the `panda.config.ts`
file.

<RouteSwitchContent value="app-dir">

```ts {8} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,
  // Where to look for your css declarations
  include: ['./src/components/**/*.{ts,tsx,js,jsx}', './src/app/**/*.{ts,tsx,js,jsx}'],
  // Files to exclude
  exclude: [],
  // The output directory for your css system
  outdir: 'styled-system'
})
```

</RouteSwitchContent>

<RouteSwitchContent value="pages-dir">

```ts {8} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,
  // Where to look for your css declarations
  include: ['./src/components/**/*.{ts,tsx,js,jsx}', './src/pages/**/*.{ts,tsx,js,jsx}'],
  // Files to exclude
  exclude: [],
  // The output directory for your css system
  outdir: 'styled-system'
})
```

</RouteSwitchContent>

### Configure CSS layers

<RouteSwitchContent value="app-dir">
  In your Next.js project, navigate to the `src/app` folder and open `globals.css` file. Replace all the content with
  the following code:
</RouteSwitchContent>
<RouteSwitchContent value="pages-dir">
  In your Next.js project, navigate to the `src/styles` folder and open `globals.css` file. Replace all the content with
  the following code:
</RouteSwitchContent>

```css
@layer reset, base, tokens, recipes, utilities;
```

<RouteSwitchContent value="app-dir">
  
  > **Note:** Feel free to remove the `page.module.css` file as we don't need it
  anymore.
  
</RouteSwitchContent>
<RouteSwitchContent value="pages-dir">

> **Note:** Feel free to remove the `Home.module.css` file as we don't need it anymore.

</RouteSwitchContent>

<RouteSwitchContent value="app-dir">
  
Make sure that you import the `globals.css` file in your `src/app/layout.tsx` file as follows:

```tsx {1} filename="./src/app/layout.tsx"
import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  )
}
```

</RouteSwitchContent>
<RouteSwitchContent value="pages-dir">

Make sure that you import the `globals.css` file in your `src/pages/_app.tsx` file as follows:

```tsx {1} filename="./src/pages/_app.tsx"
import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

</RouteSwitchContent>

### Start using Panda

<RouteSwitchContent value="app-dir">
  We will update the contents of `src/app/page.tsx` with the following snippet that uses Panda CSS:
</RouteSwitchContent>
<RouteSwitchContent value="pages-dir">
  We will update the contents of `src/pages/index.tsx` with the following snippet that uses Panda CSS:
</RouteSwitchContent>

```tsx
import { css } from '../../styled-system/css'

export default function Home() {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}
```

### Start the development server

Run the following command to start the development server:

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
{/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
{/* <!-- prettier-ignore-end --> */}
</Tabs>

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

</Steps>

## Ship without the styling runtime

This setup resolves `css()` calls with a small runtime in the browser. Panda's webpack plugin can rewrite them to plain
class strings at build time instead. See [Source transforms](/docs/styling/source-transforms).

</RouteSwitch>

## Troubleshooting

### I don't see any styles after restarting the dev server

Save your CSS entry file once. That re-triggers the build and the styles come back.

This only happens across a cold restart, and it is Next.js's persistent filesystem cache (`.next/cache`) holding the
previous CSS, not Panda failing to invalidate. While the dev server is running, the PostCSS plugin emits dir-dependency
messages for your source directories, so styles refresh normally as you edit.

Reach for `rm -rf .next` only when a single save doesn't clear it. Wiring it into your `dev` script forces a full
rebuild on every start, which costs far more time than the stale styles it works around.

If you hit this often, or your app is large enough that the rebuild hurts, skip the PostCSS cache entirely: run the CLI
in watch mode and import the stylesheet it generates.

```json filename="package.json"
{
  "scripts": {
    "dev": "concurrently \"panda --watch\" \"next dev\""
  }
}
```

```ts filename="app/layout.tsx"
import '../styled-system/styles.css'
```

The CLI watches the filesystem directly, so nothing rides Next's cache and there is nothing to go stale. Remove
`@pandacss/dev/postcss` from your `postcss.config.mjs` when you switch, otherwise both paths emit CSS.

Tracking upstream:

- [vercel/next.js#39410](https://github.com/vercel/next.js/issues/39410)
- [vercel/next.js#48748](https://github.com/vercel/next.js/issues/48748)
- [vercel/next.js#47533](https://github.com/vercel/next.js/issues/47533)

### I don't see any import autocomplete in my IDE

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```

### Codegen fails using es5

If you run into any error related to "Transforming const to the configured target environment ("es5") is not supported
yet", update your tsconfig to use es6 or higher:

```json filename="tsconfig.json"
{
  "compilerOptions": {
    "target": "es6"
  }
}
```


---


## Using Nuxt

Easily use Panda with Nuxt with the vue integration.

Learn how to set up Panda CSS in a Nuxt project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Nuxt project

To get started, we will need to create a new Nuxt project using npx.

<Tabs items={['npx', 'pnpm', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npx nuxi@latest init test-app
    ```
  </Tab>
  <Tab>
    ```bash
    pnpm dlx nuxi@latest init test-app
    ```
  </Tab>
  <Tab>
    ```bash
    bunx nuxi@latest init test-app
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

Enter the newly created directory and install the dependencies.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    yarn install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Nuxt runs on Vite, so the plugin goes in the `vite` section of your Nuxt config. It generates the `styled-system`
folder, injects the CSS, and keeps both up to date on save. No separate watcher needed.

```ts {1,10-12} filename="nuxt.config.ts"
import pandacss from '@pandacss/vite'
import { createResolver } from '@nuxt/kit'
const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  alias: {
    'styled-system': resolve('./styled-system')
  },
  css: ['@/assets/css/global.css'],
  vite: {
    plugins: [pandacss()]
  }
})
```

With the above we've performed the following:

- added the panda plugin to Nuxt's Vite config.
- imported the global css file `@/assets/css/global.css` (created in a later step) at the root of the system.
- created an alias that points to the `styled-system` directory.

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your Vue components are included in the `include` section of the `panda.config.ts`
file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app.vue', './components/**/*.{js,jsx,ts,tsx,vue}', './pages/**/*.{js,jsx,ts,tsx,vue}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `assets/css/global.css` file.

```css filename="assets/css/global.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project.

As an example here is a snippet of code for a `components/Demo.vue` file.

```vue filename="components/Demo.vue"
<script setup lang="ts">
import { css } from "styled-system/css";
</script>

<template>
  <div :class="css({ fontSize: '5xl', fontWeight: 'bold' })">Hello 🐼!</div>
</template>
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="nuxt.config.ts"
vite: {
  plugins: [pandacss({ transform: true })]
}
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


---


## Using PostCSS

Installing Panda as a PostCSS plugin is the recommended way to integrate it with your project.

This guide shows you how to install Panda as a PostCSS plugin, which is the recommended way to integrate it with your
project.

<Steps>
### Install Panda

Install panda and create your `panda.config.ts` file.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev postcss
    pnpm panda init -p
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev postcss
    npx panda init -p
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev postcss
    yarn panda init -p
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev postcss
    bun panda init -p
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add Panda to your PostCSS config

Add panda to your `postcss.config.cjs` file, or wherever PostCSS is configured in your project.

```js
module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {}
  }
}
```

### Configure the content

Add your panda config to your `panda.config.js` file, or wherever panda is configured in your project.

```js {5}
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{ts,tsx,js,jsx}', './pages/**/*.{ts,tsx,js,jsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3}
{
  "scripts": {
+    "prepare": "panda codegen",
  }
}
```

The `prepare` script will run codegen after dependency installation. Read more about
[codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure CSS layers

Add this code to an `index.css` file which is going to be the root css of your project.

```css
@layer reset, base, tokens, recipes, utilities;
```

### Start your build process

Run your build process by feeding the [root css](#configure-css-layers) to PostCSS in your preferred way.

<Tabs items={['CLI', 'JS API']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    postcss -o output.css index.css
    ```
  </Tab>
  <Tab>
    ```js
    const postcss = require("postcss");
    const fs = require("fs");

    fs.readFile("index.css", (err, css) => {
      postcss()
        .process(css, { from: "index.css", to: "output.css" })
        .then((result) => {
          console.log(result.css);
        });
    });
    ```

  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

> If you're using a framework, PostCSS is probably already integrated with your build process. Check our other guides or
> the documentation of your framework to see how to configure PostCSS.

### Start using Panda

Use the generated style utilities in your code and panda will extract them to the generated CSS file.

```jsx
import { css } from './styled-system/css'

export function App() {
  return <div className={css({ bg: 'red.400' })} />
}
```

  </Steps>

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Preact

Easily use Panda with Preact with our dedicated integration.

This guide shows you how to set up Panda CSS in a Preact project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Vite project

To get started, we will need to create a new Preact project using `typescript` template.

<Tabs items={['npm', 'yarn']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npx preact-cli create typescript test-app
    cd test-app
    ```
  </Tab>
  <Tab>
    ```bash
    npx preact-cli create typescript test-app --yarn
    cd test-app
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['npm', 'yarn']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,6} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [pandacss(), preact()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "build": "cross-env NODE_OPTIONS=--openssl-legacy-provider preact build",
    "serve": "sirv build --cors --single",
    "dev": "cross-env NODE_OPTIONS=--openssl-legacy-provider preact watch",
    "lint": "eslint src",
    "test": "jest"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your Preact components are included in the `include` section of the `panda.config.ts`
file.

```js {7} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/style/index.css` file imported in the root component of your project.

```css filename="src/style/index.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

## Start your build process

Run the following command to start your development server.

<Tabs items={['npm', 'yarn']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`src/routes/home/index.tsx` file.

```tsx filename="src/routes/home/index.tsx"
import { h } from 'preact'
import { css } from '../../../styled-system/css'

const Home = () => {
  return <div class={css({ fontSize: '2xl', fontWeight: 'bold', pt: '56px' })}>Hello 🐼!</div>
}

export default Home
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), preact()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Qwik

Easily use Panda with Qwik with our dedicated integration.

Learn how to set up Panda CSS in a Qwik project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Qwik project

To get started, we will need to create a new Qwik project using `typescript` template.

<Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npm create qwik@latest
    ```
  </Tab>
  <Tab>
    ```bash
    pnpm create qwik@latest
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create qwik
    ```
  </Tab>
  <Tab>
    ```bash
    bun create qwik@latest
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,8} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [pandacss(), qwikCity(), qwikVite(), tsconfigPaths()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "vite --mode ssr",
    "build": "qwik build",
    "preview": "qwik build preview && vite preview --open"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure your component paths are in `include`:

```js {6} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  outdir: 'styled-system'
})
```

### Configure CSS layers

Declare the layer order at the top of `src/global.css`, which Qwik already imports in `src/root.tsx`:

```css filename="src/global.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

## Start your build process

Run the following command to start your development server.

<Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project.

```tsx filename="src/routes/layout.tsx"
import { component$, Slot } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'
import { css } from 'styled-system/css'

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString()
  }
})

export default component$(() => {
  return (
    <div class={css({ p: '10', bg: 'gray.900', h: 'dvh' })}>
      <Slot />
    </div>
  )
})
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), qwikCity(), qwikVite(), tsconfigPaths()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using React Router

Easily use Panda with React Router with our dedicated integration.

This guide will show you how to set up Panda CSS in a React Router project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create project

To get started, we will need to create a new React Router project using the official
[Create React Router](https://reactrouter.com/start/framework/installation) CLI. In this guide, we will use TypeScript.

If you don't enter any parameter, the CLI will guide you through the process of creating a new React Router app.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dlx create-react-router@latest
    ```
  </Tab>
  <Tab>
    ```bash
    npx create-react-router@latest
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dlx create-react-router@latest
    ```
  </Tab>
  <Tab>
    ```bash
    bunx create-react-router@latest
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

You will be asked a few questions, answer these as follows:

```sh
? Where should we create your new project? test-app
? Install dependencies? No
```

> **Note:** You should decline the dependency installation step as we will install dependencies together with Panda CSS.

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Update the `vite.config.ts` file to use Panda instead of TailwindCSS. The plugin generates the `styled-system`
folder, injects the CSS, and keeps both up to date on save.

```ts {2,7} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import { reactRouter } from '@react-router/dev/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [pandacss(), reactRouter(), tsconfigPaths()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "build": "cross-env NODE_ENV=production react-router build",
    "dev": "react-router dev",
    "start": "cross-env NODE_ENV=production react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc"
  },
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your React Router components are included in the `include` section of the
`panda.config.ts` file.

```ts {6,9,12} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Create a new file `app/app.css` and add the following content:

```css filename="app/app.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

Import the `app.css` file in your `app/root.tsx` file and add the `styles` variable to the `links` function.

Please note the `?url` query parameter in the `import` statement. This is required by Vite to generate the correct path
to the CSS file.

```tsx {4,8} filename="app/root.tsx"
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import type { Route } from './+types/root'
import stylesheet from './app.css?url'

export const links: LinksFunction = () => [
  // ...
  { rel: 'stylesheet', href: stylesheet }
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

### Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`app/routes/home.tsx` file.

```tsx filename="app/routes/home.tsx"
import type { Route } from './+types/home'
import { css } from 'styled-system/css'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export default function Home() {
  return (
    <div>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Welcome to the home page</h1>
    </div>
  )
}
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), reactRouter(), tsconfigPaths()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["app", "styled-system"]
}
```


---


## Using Redwood

Easily use Panda with Redwood.js with our dedicated integration.

This guide shows you how to set up Panda CSS in a Redwood project using PostCSS.

> Redwood uses `yarn` as its primary package manager.

## Start a new project

<Steps>

### Create Redwood project

To get started, we will need to create a new Redwood project using `typescript` template.

```bash
yarn create redwood-app app
```

Respond to the prompts as follows:

```bash
✔ Compatibility checks passed
✔ Select your preferred language · TypeScript
✔ Do you want to initialize a git repo? · no / Yes
✔ Enter a commit message · Initial commit
✔ Do you want to run yarn install? · no / Yes
✔ Project files created
✔ Initialized a git repo with commit message "Initial commit"
✔ Installed node modules
✔ Generated types
```

### Install Panda

Install panda and generate the `panda.config.ts` and `postcss.config.cjs` file.

```bash
cd web
yarn add -D @pandacss/dev postcss postcss-loader
yarn panda init --postcss
```

### Move to config folder

Redwood uses a `config` folder for all of the configuration files. Move the `panda.config.ts` and `postcss.config.cjs`
files to the `config` folder.

```bash
mv panda.config.ts postcss.config.cjs config/
```

### Update configs

Update the postcss config file to use the `panda.config.ts` file.

```diff filename="web/config/postcss.config.cjs"
+ const path = require('path')

module.exports = {
  plugins: {
    "@pandacss/dev/postcss": {
+      configPath: path.resolve(__dirname, 'panda.config.ts'),
   },
  },
}
```

Update the tsconfig file to include the `styled-system` folder.

```json {6} filename="web/tsconfig.json"
{
  // ...
  "compilerOptions": {
    "paths": {
      // ...
      "styled-system/*": ["./styled-system/*"]
    }
  }
}
```

### Update package.json scripts

Open the `web/package.json` file and update the `scripts` section as follows:

```diff {3} filename="web/package.json"
{
  "scripts": {
+    "prepare": "panda codegen"
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your Redwood components are included in the `include` section of the
`panda.config.ts` file.

```js {5} filename="web/config/panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/style/index.css` file imported in the root component of your project.

```css filename="web/src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

## Start your build process

Run the following command to start your development server.

```bash
yarn rw dev
```

### Start using Panda

Now you can start using Panda CSS in your project.

```tsx filename="web/src/pages/HomePage/HomePage.tsx"
import { css } from 'styled-system/css'
import { stack } from 'styled-system/patterns'
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      <div
        className={stack({
          bg: { base: 'red.300', _hover: 'red.500' },
          py: '12',
          px: '8'
        })}
      >
        <h1 className={css({ fontSize: '4xl', fontWeight: 'bold' })}>HomePage</h1>
        <p>Hello World</p>
      </div>
    </>
  )
}

export default HomePage
```

</Steps>

## Ship without the styling runtime

This setup resolves `css()` calls with a small runtime in the browser. Panda's Vite plugin can rewrite them to plain
class strings at build time instead. See [Source transforms](/docs/styling/source-transforms).

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="web/tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Remix

How to use Panda with Remix with our dedicated integration.

This guide will show you how to set up Panda CSS in a Remix project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Remix project

To get started, we will need to create a new Remix project using the official
[Create Remix](https://remix.run/docs/en/main/start/quickstart) CLI. In this guide, we will use TypeScript.

If you don't enter any parameter, the CLI will guide you through the process of creating a new Remix app.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dlx create-remix@latest
    ```
  </Tab>
  <Tab>
    ```bash
    npx create-remix@latest
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dlx create-remix@latest
    ```
  </Tab>
  <Tab>
    ```bash
    bunx create-remix@latest
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

You will be asked a few questions, answer these as follows:

```sh
? Where should we create your new project? test-app
? Install dependencies? No
```

> **Note:** You should decline the dependency installation step as we will install dependencies together with Panda CSS.

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,7} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import { vitePlugin as remix } from '@remix-run/dev'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [pandacss(), remix(), tsconfigPaths()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "build": "remix build",
    "dev": "remix dev",
    "start": "remix-serve build",
    "typecheck": "tsc"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your Remix components are included in the `include` section of the `panda.config.ts`
file.

```js {6,12} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app/routes/**/*.{ts,tsx,js,jsx}', './app/components/**/*.{ts,tsx,js,jsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Create a new file `app/index.css` and add the following content:

```css filename="app/index.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

Import the `index.css` file in your `app/root.tsx` file and add the `styles` variable to the `links` function.

Please note the `?url` query parameter in the `import` statement. This is required by Vite to generate the correct path
to the CSS file.

```tsx filename="app/root.tsx" {4,6}
import type { LinksFunction } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

import styles from './index.css?url'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
```

### Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`app/routes/_index.tsx` file.

```tsx filename="app/routes/_index.tsx"
import type { MetaFunction } from '@remix-run/node'
import { css } from 'styled-system/css'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export default function Index() {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), remix(), tsconfigPaths()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```

If your app doesn't reload when making changes to the `panda.config.ts` file, consider adding `watchPaths` in your remix
config file.

```js filename="remix.config.js"
export default {
  // ...
  watchPaths: ['panda.config.ts']
}
```


---


## Using Rsbuild

Easily use Panda with Rsbuild, React and Typescript with our dedicated integration.

This guide shows you how to set up Panda CSS in a Rsbuild project using PostCSS.

## Start a new project

<Steps>

### Create Rsbuild project

To get started, we will need to create a new Rsbuild project using `react-ts` template.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm create rsbuild@latest --dir test-app --template react-ts
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    npm create rsbuild@latest --dir test-app -- --template react-ts
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create rsbuild@latest --dir test-app --template react-ts
    cd test-app
    yarn
    ```
  </Tab>
  <Tab>
    ```bash
    bun create rsbuild@latest --dir test-app --template react-ts
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev
    pnpm panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev
    npx panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev
    yarn panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev
    bun panda init --postcss
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {5} filename="package.json"
{
  "scripts": {
    "build": "rsbuild build",
    "dev": "rsbuild dev --open",
+   "prepare": "panda codegen",
    "preview": "rsbuild preview"
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your React components are included in the `include` section of the `panda.config.ts`
file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Generates JSX utilities with options of React, Preact, Solid, Vue
  jsxFramework: 'react',

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/App.css` file imported in the root component of your project.

```css filename="src/App.css"
@layer reset, base, tokens, recipes, utilities;
```

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your `src/App.tsx`
file.

```tsx filename="src/App.tsx"
import { css } from '../styled-system/css'

function App() {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}

export default App
```

</Steps>

## Ship without the styling runtime

This setup resolves `css()` calls with a small runtime in the browser. Panda's webpack plugin (via Rspack's webpack-compatible API) can rewrite them to plain
class strings at build time instead. See [Source transforms](/docs/styling/source-transforms).

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using SolidJS

Easily use Panda with SolidJS with our dedicated integration.

This guide will show you how to set up Panda CSS in a Solid.js project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Vite project

To get started, we will need to create a new SolidJS project using `solidjs/templates/ts` template.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dlx degit solidjs/templates/ts test-app
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    npx degit solidjs/templates/ts test-app
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dlx degit solidjs/templates/ts test-app
    cd test-app
    yarn
    ```
  </Tab>
  <Tab>
    ```bash
    bunx degit solidjs/templates/ts test-app
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,6} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [pandacss(), solidPlugin()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your SolidJS components are included in the `include` section of the
`panda.config.ts` file.

```ts {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/index.css` file imported in the root component of your project.

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

> **Note:** Feel free to remove `src/App.module.css` file as we don't need it anymore, and make sure to remove the
> import from the `src/App.tsx` file.

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your `src/App.tsx`
file.

```tsx filename="src/App.tsx"
import type { Component } from 'solid-js'
import { css } from '../styled-system/css'

const App: Component = () => {
  return <div class={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}

export default App
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), solidPlugin()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Storybook

Easily use Panda with Storybook with our dedicated integration.

Learn how to set up Panda CSS in a Storybook project using PostCSS.

## Setup

We are assuming that you already have a project set up with a framework like React, Vue or Svelte.

<Steps>

### Install Storybook

Storybook needs to be installed into a project that is already set up with a framework. It will not work on an empty
project.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
{/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dlx storybook@latest init
    ```
  </Tab>
  <Tab>
    ```bash
    npx storybook@latest init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dlx storybook@latest init
    ```
  </Tab>
  <Tab>
    ```bash
    bunx storybook@latest init
    ```
  </Tab>
{/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev
    pnpm panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev
    npx panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev
    yarn panda init --postcss
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev
    bun panda init --postcss
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

If you are using Storybook with the Vite builder, you will have to update your PostCSS config file to use the array
syntax for the plugins instead of the object syntax. Simply change `postcss.config.cjs`:

```diff filename="postcss.config.cjs"
module.exports = {
-  plugins: {
-   '@pandacss/dev/postcss': {}
-  }
+  plugins: [require('@pandacss/dev/postcss')()]
}
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="web/package.json"
{
  "scripts": {
+    "prepare": "panda codegen"
  }
}
```

- `"prepare"` - script that will run Panda CSS CLI codegen before each build. Read more about
  [codegen](/docs/reference/cli#codegen) in the CLI section.

> This step ensures that the panda output directory is regenerated after each dependency installation. So you can add
> the output directory to your `.gitignore` file and not worry about it.

### Configure the content

Make sure that all of the paths of your Storybook components are included in the `include` section of the
`panda.config.ts` file.

```ts {8} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,
  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}', './stories/**/*.{js,jsx,ts,tsx}'],
  // Files to exclude
  exclude: [],
  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Locate your main CSS file and add the following layers:

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

### Import the CSS in your Storybook config

Locate your `.storybook/preview.ts` file and import the CSS file.

In this example CSS file is located in the `src` folder.

```ts {1} filename=".storybook/preview.ts"
import '../src/index.css'

import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  }
}

export default preview
```

### Start the Storybook server

Run the following command to start your Storybook server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm storybook
    ```
  </Tab>
  <Tab>
    ```bash
    npm run storybook
    ```
  </Tab>
  <Tab>
    ```bash
    yarn storybook
    ```
  </Tab>
  <Tab>
    ```bash
    bun storybook
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in Storybook.

Here is the example of a Button component and its corresponding Storybook story:

```tsx filename="src/stories/Button.tsx"
import { ReactNode } from 'react'
import { css } from '../../styled-system/css'

export interface IButtonProps {
  children: ReactNode
}

export const Button = ({ children }: IButtonProps) => {
  return (
    <button
      className={css({
        bg: 'red.300',
        fontFamily: 'Inter',
        px: '4',
        py: '3',
        borderRadius: 'md',
        _hover: { bg: 'red.400' }
      })}
    >
      {children}
    </button>
  )
}
```

```tsx filename="src/stories/Button.stories.tsx"
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../../styled-system/css'

import { Button } from './Button'

const meta = {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className={css({ m: 10 })}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Hello 🐼!'
  }
}
```

</Steps>

## Configuring Dark Mode

To enable dark mode in Storybook, you can use the `@storybook/addon-themes` package.

```bash
pnpm add -D @storybook/addon-themes
```

Then, update your `.storybook/preview.ts` file to include the following:

```ts filename=".storybook/preview.ts"
import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview, ReactRenderer } from '@storybook/react'

const preview: Preview = {
  // ...
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: '',
        dark: 'dark'
      },
      defaultTheme: 'light'
    })
  ]
}

export default preview
```

With that in place, you should see the light/dark switcher in Storybook's toolbar.

## Troubleshooting

### Cannot find postcss plugin

If you are having issues with the PostCSS plugin similar to `Cannot find module '@pandacss/dev/postcss'`, update the
PostCSS config as follows:

```js filename="postcss.config.cjs"
module.exports = {
  plugins: [require('@pandacss/dev/postcss')]
}
```

### HMR not triggered

If you are having issues with HMR not being triggered after a `panda.config.ts` change (or one of its
[dependencies](/docs/reference/config#dependencies), you can manually specify the files that should trigger a rebuild
by adding the following to your `panda.config.ts`:

```js filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  dependencies: ['path/to/files/**.ts']
})
```

### Styles in `args` is not generated

If you are having issues with your `args` not generating the expected CSS, it's probably because of:

- you didn't add a file glob for the Storybook files in your [`config.include`](/docs/reference/config#include) like
  `"./stories/**/*.{js,jsx,ts,tsx}"`
- you didn't wrap your `args` object (or some part of it) with the
  [`.raw()` marker that helps Panda find style usage](/docs/styling/dynamic-styling#marking-objects-with-raw)

```tsx filename="stories/Button.stories.tsx"
import type { Meta, StoryObj } from '@storybook/react'
import { button } from '../../styled-system/recipes'

export const Funky: Story = {
  // mark this as a button recipe usage
  args: button.raw({
    visual: 'funky',
    shape: 'circle',
    size: 'sm'
  })
}
```

### Some recipes styles are missing

If you are having issues with your config `recipes` or `slotRecipes` not generating the expected CSS, it's probably
because of:

- you didn't add a file glob for the Storybook files in your [`config.include`](/docs/reference/config#include) like
  `"./stories/**/*.{js,jsx,ts,tsx}"`
- you haven't used every recipes variants in your app, so you might want to pre-generate it (only for storybook usage)
  with [`staticCss`](/docs/styling/static)

```tsx filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  staticCss: {
    recipes: '*'
  }
})
```


---


## Migrating from Styled Components

Migrate your project from Styled Components to Panda, from tagged templates to typed style objects.

Styled Components computes styles at runtime and has been in maintenance mode since v6; Panda extracts static
CSS at build time. The one hard boundary: every `` styled.x`...` `` template literal becomes a style object.

## Objects, not template literals

Panda's static extraction reads style objects from your source. It does not parse CSS text, so a tagged template
never extracts:

```jsx
import styled from 'styled-components'

// before
const Button = styled.button`
  background-color: #fff;
  border: 1px solid #000;
  padding: 0.5rem 1rem;
`
```

```jsx
import { styled } from '../styled-system/jsx'

// after: same factory idea, styles in the `base` key
const Button = styled('button', {
  base: {
    backgroundColor: '#fff',
    border: '1px solid #000',
    padding: '0.5rem 1rem'
  }
})
```

The factory is generated into `styled-system/jsx` when `jsxFramework: 'react'` is set in your config.

If you already use Styled Components' object syntax, the conversion is just moving styles under `base`. See
[Styled factory](/docs/recipes/styled-factory).

## Prop interpolation becomes variants

Functions of props are the other thing static extraction can't run:

```jsx
// before
const Button = styled.button`
  ${props => props.color === 'violet' && `background-color: blueviolet;`}
  ${props => props.color === 'gray' && `background-color: gainsboro;`}
`
```

```jsx
// after: each branch is a typed variant
const Button = styled('button', {
  variants: {
    color: {
      violet: { backgroundColor: 'blueviolet' },
      gray: { backgroundColor: 'gainsboro' }
    }
  }
})

<Button color="violet">Button</Button>
```

A value that only exists at runtime (state, fetched data) can't become a variant; see
[Dynamic Styles](/docs/styling/dynamic-styling) for what to do instead.

## Theme access to tokens

Styled Components reads a theme through React context, with ambient type declarations for safety:

```tsx
// before
const StyledLink = styled.a(({ theme }) => ({
  color: theme.colors.primary,
  textDecoration: 'none'
}))
```

Panda's tokens live in config, generate their own types, and connect to every CSS property, so the interpolation
function disappears:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: 'blue' }
        }
      }
    }
  }
})
```

```tsx
const StyledLink = styled('a', {
  base: {
    color: 'primary',
    textDecoration: 'none'
  }
})
```

`ThemeProvider` goes away entirely. See [Tokens](/docs/theming/tokens).

## Responsive styles

Hand-written media queries become breakpoint objects:

```tsx
// before
const Button = styled.button({
  padding: '0.5rem 1rem',
  '@media (min-width: 768px)': { padding: '1rem 2rem' }
})

// after
const Button = styled('button', {
  base: {
    padding: { base: '0.5rem 1rem', md: '1rem 2rem' }
  }
})
```

See [Responsive Design](/docs/styling/responsive-design).

## Global styles

`createGlobalStyle` becomes the `globalCss` config key, emitted straight into the generated CSS:

```ts filename="panda.config.ts"
export default defineConfig({
  globalCss: {
    body: { margin: 0, padding: 0 }
  }
})
```

See [Global Styles](/docs/styling/global-styles).

## Targeting components

Styled Components lets one component target another by interpolating it (`${Link}:hover &`). That relies on
runtime-generated class identity. In Panda, a parent-driven state is a compound component: model both parts as one
[slot recipe](/docs/recipes/slot-recipes), where the parent's state styles its slots.

```tsx
const link = sva({
  slots: ['root', 'icon'],
  base: {
    root: { background: 'papayawhip' },
    icon: {
      width: '48px',
      height: '48px',
      // the group modifier replaces ${Link}:hover &
      _groupHover: { fill: 'rebeccapurple' }
    }
  }
})
```

The parent carries the `group` class that `_groupHover` reads:

```tsx
const classes = link()

<a className={cx(classes.root, 'group')}>
  <svg className={classes.icon} />
</a>
```

See [Slot Recipes](/docs/recipes/slot-recipes) and [Conditional Styles](/docs/styling/conditional-styles).

## Animations

The `keyframes` helper becomes `theme.keyframes`, referenced by name:

```ts filename="panda.config.ts"
export default defineConfig({
  theme: {
    extend: {
      keyframes: {
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      }
    }
  }
})
```

```tsx
const Button = styled('button', {
  base: {
    _hover: { animation: 'rotate 200ms' }
  }
})
```

See [Theme](/docs/theming/theme#keyframes) and [Animation Styles](/docs/theming/animation-styles).

## Server-side rendering

Delete it. `ServerStyleSheet`, `collectStyles`, `getStyleTags`, the babel plugin: all of it exists to flush
runtime-generated styles into server HTML. Panda's CSS is a static file produced at build time, so there is
nothing to collect and no hydration mismatch to manage.

## Run both during the migration

Panda's CSS ships inside cascade layers and Styled Components' injected styles are unlayered, so legacy styles win
over converted components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two
ways to control which side wins.

## After migrating

- **Drop the styling runtime.** [Source transforms](/docs/styling/source-transforms) rewrite static calls to plain
  class strings at build time, so after leaving Styled Components' runtime behind, even Panda's small one can go.
- **Lint against your theme.** The [lint rules](/docs/get-started/linting) flag raw values where a token exists,
  useful while converting hardcoded template-literal values to tokens.

## See also

- [Migrating from Emotion](/docs/get-started/emotion) if parts of your app use Emotion directly; the `styled`
  conversion is the same.
- [Styled factory](/docs/recipes/styled-factory) for the full factory API.


---


## Migrating from StyleX

Migrate your project from Meta's StyleX to Panda and see how create, defineVars, and props map across.

StyleX and Panda share the same foundation: static extraction with a Rust compiler, atomic output, object syntax.
The difference is scope:

- **StyleX stays minimal.** No globals, no built-in variants. Your team hand-rolls its conventions, and
  hand-rolled conventions drift.
- **Panda gives you the conventions.** Variants, patterns, and semantic tokens as typed APIs, enforced by the
  compiler and the [lint rules](/docs/get-started/linting). More surface area up front, but each piece replaces a
  convention you'd otherwise write and police yourself.

Value the minimalism? You don't have to take the batteries: start from
[zero presets](/docs/theming/minimal-setup) or just `@pandacss/preset-base`, bring your own tokens, and add
conventions back one at a time. Install through your [framework guide](/docs/get-started/framework-guides).

## Theme to tokens

`stylex.defineVars` (which must live in a `.stylex.ts` file as a named export) becomes `theme.tokens` in config,
referenced by name instead of imported variable objects:

```ts filename="vars.stylex.ts"
import * as stylex from '@stylexjs/stylex'

// before
export const colors = stylex.defineVars({
  brand: '#0ea5e9'
})
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

// after
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#0ea5e9' }
        }
      }
    }
  }
})
```

```jsx
import { css } from '../styled-system/css'

<button className={css({ bg: 'brand' })} />
```

See [Tokens](/docs/theming/tokens).

## Inline styles to css()

`stylex.create` plus `stylex.props()` spread becomes `css()` building a class name:

```jsx
import * as stylex from '@stylexjs/stylex'

// before
const styles = stylex.create({
  base: { color: 'white', backgroundColor: 'blue' }
})

<div {...stylex.props(styles.base)} />
```

```jsx
import { css } from '../styled-system/css'

// after
<div className={css({ color: 'white', bg: 'blue' })} />
```

See [JSX Style Props](/docs/styling/style-props) for the `styled` factory and `css` prop forms.

## Variants

StyleX's common pattern is named style objects picked by an untyped string key. Panda's
[recipes](/docs/recipes/atomic-recipe) formalize it as a typed variant map:

```jsx
// before
const styles = stylex.create({
  primary: { backgroundColor: 'blue' },
  secondary: { backgroundColor: 'gray' }
})

<button {...stylex.props(styles[variant])} />
```

```ts filename="button.ts"
// after: the prop and its allowed values are checked at compile time
import { cva } from '../styled-system/css'

export const button = cva({
  variants: {
    variant: {
      primary: { bg: 'blue.500' },
      secondary: { bg: 'gray.500' }
    }
  }
})
```

See [Recipes](/docs/recipes/atomic-recipe) and [Slot Recipes](/docs/recipes/slot-recipes) for multi-part
components.

## View transitions

`stylex.viewTransitionClass` maps one to one to Panda's `viewTransition`, same `group`/`old`/`new` keys, both
built on `view-transition-class`:

```ts
// before
const slide = stylex.viewTransitionClass({
  group: { animationDuration: '0.4s' },
  old: { opacity: 0 },
  new: { opacity: 1 }
})
```

```ts
// after
import { viewTransition } from '../styled-system/css'

const slide = viewTransition({
  group: { animationDuration: '0.4s' },
  old: { opacity: 0 },
  new: { opacity: 1 }
})
```

See [View Transitions](/docs/styling/view-transition).

## Keyframes

`stylex.keyframes` maps one to one to Panda's `keyframes`. Both take the same
`from`/`to`/`<percentage>` stops and return an animation name you put in
`animationName` or the `animation` shorthand:

```ts
// before
const fade = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
})

const styles = stylex.create({
  box: { animationName: fade, animationDuration: '0.6s' }
})
```

```ts
// after
import { css, keyframes } from '../styled-system/css'

const fade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
})

const box = css({ animationName: fade, animationDuration: '0.6s' })
```

Panda emits the `@keyframes` block for you and tree-shakes it to what you
reference. Shared, design-system animations belong in `theme.keyframes` instead,
referenced by name (`animationName: 'fade'`). See [Keyframes](/docs/styling/keyframes).

## Position try

`stylex.positionTry` maps one to one to Panda's `positionTry`. Both take the
anchor-positioning declarations and return the dashed-ident you put in
`positionTryFallbacks`:

```ts
// before
const flip = stylex.positionTry({
  top: 'anchor(bottom)',
  insetInlineStart: 'anchor(start)'
})

const styles = stylex.create({
  popover: { positionTryFallbacks: flip }
})
```

```ts
// after
import { css, positionTry } from '../styled-system/css'

const flip = positionTry({
  top: 'anchor(bottom)',
  insetInlineStart: 'anchor(start)'
})

const popover = css({ positionTryFallbacks: flip })
```

Panda emits the `@position-try` block and tree-shakes it. Reusable fallbacks
belong in `theme.positionTry`, referenced by name (`positionTry('flip')`). See
[Position Try](/docs/styling/position-try).

## Value fallbacks

`stylex.firstThatWorks` maps one to one to Panda's `firstThatWorks`. Same name, same order: the value you
want first. Both emit the declarations reversed, so the browser keeps the last one it understands:

```ts
// before
const styles = stylex.create({
  header: { position: stylex.firstThatWorks('sticky', '-webkit-sticky', 'fixed') }
})
```

```ts
// after
import { css, firstThatWorks } from '../styled-system/css'

const header = css({ position: firstThatWorks('sticky', '-webkit-sticky', 'fixed') })
```

```css
position: fixed;
position: -webkit-sticky;
position: sticky;
```

Two differences. StyleX folds `var()` members into one nested `var(a, var(b, c))`; Panda keeps each member
as its own declaration, because its token variables always exist and a native `var(--x, red)` fallback passes
through untouched. And Panda needs at least two values, since one has nothing to fall back to. See
[Value Fallbacks](/docs/styling/first-that-works).

## Color modes

StyleX keys a `defineVars` value to a media query. Panda's semantic tokens are the direct equivalent, branching on
the `_dark` condition:

```ts
// before
const DARK = '@media (prefers-color-scheme: dark)'

export const colors = stylex.defineVars({
  bg: { default: 'white', [DARK]: 'black' }
})
```

```ts filename="panda.config.ts"
// after
theme: {
  extend: {
    semanticTokens: {
      colors: {
        bg: { value: { base: 'white', _dark: 'black' } }
      }
    }
  }
}
```

See [Multiple Themes](/docs/theming/multiple-themes) for setups beyond media-query switching (a toggled class or
attribute).

## Layout components

StyleX has no built-in layout primitives, consistent with its single-element scope. Panda ships
[patterns](/docs/styling/patterns) as both functions and JSX components:

```jsx
import { Box, Stack } from '../styled-system/jsx'

<Stack gap="4">
  <Box bg="gray.100">Item</Box>
</Stack>
```

See [Patterns](/docs/styling/patterns).

## Scoping: constraints become choices

StyleX forbids global styles and descendant selectors by design. Panda supports both, plus typed conditions for
the cross-element cases `stylex.when` gates:

**Global styles**, for resets and base styles:

```ts filename="panda.config.ts"
globalCss: {
  body: { margin: 0 }
}
```

**Descendant selectors**, styling children from the parent:

```ts
css({ '& > li': { marginBlock: '2' } })
```

**Cross-element state**, as conditions instead of a separate API:

```tsx
<div className={css({ _groupHover: { opacity: 1 } })} />
```

The specificity discipline StyleX enforced at compile time becomes your choice:
[cascade layers](/docs/styling/cascade-layers) keep precedence predictable, and the opt-in
[`no-descendant-selectors`](/docs/get-started/linting#no-descendant-selectors) lint rule brings back per-element
scoping as a lint error where you want it.

## Run both during the migration

Panda's CSS ships inside cascade layers and StyleX's output is unlayered, so StyleX styles win over converted
components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two
ways to control which side wins.

## After migrating

- **Replace the compiler-enforced discipline.** StyleX's compiler rejected what its model forbids. Panda's
  [lint rules](/docs/get-started/linting) are the equivalent enforcement: raw values where a token exists,
  invalid token paths, `!important`, physical properties.
- **Keep the zero-runtime output.** [Source transforms](/docs/styling/source-transforms) rewrite static calls to
  plain class strings, matching StyleX's compiled output model.

## See also

- [Cascade Layers](/docs/styling/cascade-layers) for how Panda manages selector precedence, the nearest
  equivalent to StyleX's specificity guarantees.
- [Writing Styles](/docs/styling/writing-styles) for the full `css()` model this guide maps onto.


---


## Using Svelte

Easily use Panda with Svelte with our dedicated integration.

This guide will show you how to set up Panda CSS in a Svelte project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Svelte project

To get started, we will need to create a new Svelte project.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm create svelte@latest test-app
    ```
  </Tab>
  <Tab>
    ```bash
    npm create svelte@latest test-app
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create svelte@latest test-app
    ```
  </Tab>
  <Tab>
    ```bash
    bun create svelte@latest test-app
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

You will be asked a few questions, answer them as follows:

```sh
┌  Welcome to SvelteKit!
│
◇  Which Svelte app template?
│  Skeleton project
│
◇  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◇  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting
│  ◼ Add Prettier for code formatting
│  ◻ Add Playwright for browser testing
│  ◻ Add Vitest for unit testing
│
└  Your project is ready!
```

Enter the newly created directory and install the dependencies.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    yarn
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file:

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,6-11} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  plugins: [sveltekit(), pandacss()],
  server: {
    fs: {
      allow: ['styled-system']
    }
  }
})
```

`server.fs.allow` lets SvelteKit's dev server read the generated `styled-system` folder.

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```json {3}
{
  "scripts": {
    "prepare": "panda codegen",
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "prettier --plugin-search-dir . --check . && eslint .",
    "format": "prettier --plugin-search-dir . --write ."
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your Svelte components are included in the `include` section of the `panda.config.ts`
file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,ts,svelte}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Update Svelte config

Add the `styled-system` alias to your `svelte.config.js` file:

```js {15} filename="svelte.config.js"
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess()],
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      'styled-system': './styled-system/*'
    }
  }
}

export default config
```

### Configure CSS layers

Create an `src/app.css` file with the layer order, and import it from the root layout:

```css filename="src/app.css"
@layer reset, base, tokens, recipes, utilities;
```

```svelte {2} filename="src/routes/+layout.svelte"
<script>
  import '../app.css'
</script>

<slot />
```

The CSS file only sets the layer order. The plugin injects the generated CSS for you.

### Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your
`src/routes/+page.svelte` file.

```svelte filename="src/routes/+page.svelte"
<script>
	import { css } from 'styled-system/css'
</script>

<div class={css({ fontSize: '2xl',	fontWeight: 'bold' })}>
	Hello 🐼!
</div>
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [sveltekit(), pandacss({ transform: true })]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>

## Troubleshooting

### Storybook can't load styled-system files

Storybook runs its own Vite server, which does not inherit the `server.fs.allow` setting from your `vite.config.ts`.
Add it in your `.storybook` folder's `main.js` (or `vite.config.js` in older Storybook versions):

```js filename="main.js"
import { defineConfig, mergeConfig } from 'vite'

/** @type { import('@storybook/sveltekit').StorybookConfig } */

const config = {
  // other Storybook config...
  viteFinal: async config => {
    return mergeConfig(
      config,
      defineConfig({
        server: {
          fs: {
            allow: ['styled-system']
          }
        }
      })
    )
  }
}
export default config
```

### Autocomplete not working

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
TypeScript config. However, in Svelte your main `tsconfig.json` file is extending the autogenerated one. To extend it
without overriding the defaults adjust your `svelte.config.js` to include following entry:

```js filename="svelte.config.js"
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
/** @type {import('@sveltejs/kit').Config} */
const config = {
  // ...
  kit: {
    // ...
    typescript: {
      config: config => {
        config.include.push('../styled-system')
        return config
      }
    }
  }
}

export default config
```


---


## Migrating from Tailwind CSS

Migrate your project from Tailwind CSS to Panda and see how utility classes map to Panda's style objects.

Tailwind and Panda are both utility-first with build-time extraction, so migrating is closer to a syntax
translation than a redesign:

```jsx
// before
<div class="bg-red-500 px-4 hover:bg-red-600" />

// after
<div className={css({ bg: 'red.500', px: '4', _hover: { bg: 'red.600' } })} />
```

Same utilities, now typed and checked by your editor. No more class soup, and no `tailwind-merge`: style objects
merge natively with `css(base, overrides)`.

## Utilities become style objects

Tailwind styles are class-name strings. A misspelled class is a silent no-op: the style doesn't apply and nothing
warns you. Panda styles are objects with typed keys and token-typed values, so the same mistake is a TypeScript
error at the call site:

```jsx
import { css } from '../styled-system/css'

// ❌ Tailwind: a mistyped class is a silent no-op
;<div class="bg-red-500 aligns-center" />

// ✅ Panda: a mistyped property won't type-check
;<div className={css({ bg: 'red.500', aligns: 'center' })} /> // 'aligns' does not exist
```

See [Writing Styles](/docs/styling/writing-styles).

## Theme to tokens

Tailwind v4 defines tokens in CSS with `@theme` (v3: the `theme` key in `tailwind.config.js`):

```css filename="app.css"
@import 'tailwindcss';

@theme {
  --color-brand: #0ea5e9;
}
```

Panda's tokens live in `panda.config.ts` and generate typed names you get autocomplete for:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: '#0ea5e9' }
        }
      }
    }
  }
})
```

See [Tokens](/docs/theming/tokens), including semantic tokens, which Tailwind approximates by hand with CSS
variables.

## Arbitrary values

Tailwind's bracket syntax covers one-off values outside the scale:

```html
<div class="w-[327px] top-[calc(100%-4px)]"></div>
```

`css()` takes any valid CSS value directly, no brackets:

```jsx
<div className={css({ width: '327px', top: 'calc(100% - 4px)' })} />
```

Tailwind's opacity shorthand carries over too: `bg-red-500/40` is `bg: 'red.500/40'`. See
[Color opacity modifier](/docs/styling/color-opacity-modifier).

## Variants

Tailwind has no built-in way to define a component's variants; that usually means hand-composed class strings or a
package like `tailwind-variants`. Panda ships it as [recipes](/docs/recipes/atomic-recipe):

```ts filename="button.ts"
import { cva } from '../styled-system/css'

export const button = cva({
  base: { borderRadius: 'md', fontWeight: 'semibold' },
  variants: {
    size: {
      sm: { fontSize: 'sm', px: '3', py: '1.5' },
      lg: { fontSize: 'lg', px: '6', py: '3' }
    }
  }
})
```

```jsx
<button className={button({ size: 'lg' })}>Click me</button>
```

Variants are typed: `button({ size: 'xl' })` is a type error if `xl` was never defined. Multi-part components use
[Slot Recipes](/docs/recipes/slot-recipes).

## Dark mode

Tailwind's `dark:` prefix (v4 follows `prefers-color-scheme` by default; `@custom-variant` switches to class-based
toggling):

```html
<div class="bg-white dark:bg-gray-900"></div>
```

Panda's `_dark` condition is the direct equivalent:

```jsx
<div className={css({ bg: { base: 'white', _dark: 'gray.900' } })} />
```

For a pair that repeats across the app, define it once as a semantic token and use the token everywhere:

```ts filename="panda.config.ts"
theme: {
  extend: {
    semanticTokens: {
      colors: {
        bg: { value: { base: 'white', _dark: 'gray.900' } }
      }
    }
  }
}
```

```jsx
<div className={css({ bg: 'bg' })} />
```

See [Conditional Styles](/docs/styling/conditional-styles) and [Multiple Themes](/docs/theming/multiple-themes).

## Custom variants

Tailwind's `@custom-variant` defines your own prefix. Panda's equivalent is a condition in config:

```css filename="app.css"
/* before */
@custom-variant hocus (&:hover, &:focus);
```

```ts filename="panda.config.ts"
// after
export default defineConfig({
  conditions: {
    extend: {
      hocus: '&:is(:hover, :focus)'
    }
  }
})
```

```jsx
// before
<div class="hocus:bg-red-600" />

// after
<div className={css({ _hocus: { bg: 'red.600' } })} />
```

See [Conditions](/docs/theming/conditions).

## Custom utilities

Tailwind's `@utility` (v3: `addUtilities` in a plugin) defines your own class. Panda's equivalent is a typed
utility in config:

```css filename="app.css"
/* before */
@utility tab-* {
  tab-size: --value(integer);
}
```

```ts filename="panda.config.ts"
// after
export default defineConfig({
  utilities: {
    extend: {
      tab: {
        className: 'tab',
        transform(value) {
          return { tabSize: value }
        }
      }
    }
  }
})
```

```jsx
// before
<pre class="tab-4" />

// after
<pre className={css({ tab: 4 })} />
```

A utility can also pull its values from a token category (`values: 'spacing'`), which makes them typed and
autocompleted. See [Utilities](/docs/theming/utilities).

## Global styles

Tailwind global styles are real CSS under `@layer base`:

```css
@layer base {
  button {
    margin: 0;
    border: 0;
  }
}
```

Panda declares the same thing in config:

```ts filename="panda.config.ts"
export default defineConfig({
  globalCss: {
    button: { margin: 0, border: 0 }
  }
})
```

See [Global Styles](/docs/styling/global-styles).

## Layout components

Tailwind is class-name-only; a `Box` or `Stack` comes from your own code or a component library. Panda ships
[patterns](/docs/styling/patterns) as both functions and JSX components:

```jsx
import { Box, Grid } from '../styled-system/jsx'

<Grid gridTemplateColumns="repeat(2, 1fr)" gap="6">
  <Box bg="gray.100">Box</Box>
</Grid>
```

## Typography plugin

`@tailwindcss/typography`'s `prose` classes map to `@pandacss/preset-typography`, a preset with a size-aware
`prose` recipe:

```ts filename="panda.config.ts"
import typographyPreset from '@pandacss/preset-typography'

export default defineConfig({
  presets: ['@pandacss/preset-panda', typographyPreset()]
})
```

```jsx
// before
<article class="prose prose-lg dark:prose-invert" />

// after
import { prose } from '../styled-system/recipes'

<article className={prose({ size: 'lg' })} />
```

Dark mode needs no extra class, because the recipe's colors are semantic tokens. See
[Typography](/docs/theming/typography).

## What has no equivalent

- **`@apply`.** Panda doesn't generate named utility classes for separate CSS to reference. Compose with a
  [recipe](/docs/recipes/atomic-recipe) or [`cx`](/docs/styling/merging-styles) instead.
- **Other Tailwind plugins** (`@tailwindcss/forms`). The equivalent idea is a
  [preset](/docs/theming/presets): a shareable package of tokens, recipes, and patterns.

## Run both during the migration

Panda's CSS ships inside cascade layers and most Tailwind setups are effectively unlayered, so legacy styles win
over converted components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two
ways to control which side wins.

## After migrating

- **Enforce the discipline Tailwind's fixed class set gave you.** The [lint rules](/docs/get-started/linting) flag
  raw values where a token exists (`prefer-token`) and know your actual theme. Turn on
  [`strictTokens`](/docs/styling/writing-styles#stricttokens) to reject raw values at the type level.
- **Drop the styling runtime.** [Source transforms](/docs/styling/source-transforms) rewrite static `css()` calls
  to plain class strings at build time, matching Tailwind's zero-runtime output byte for byte.

## See also

- [Writing Styles](/docs/styling/writing-styles) and [Recipes](/docs/recipes/atomic-recipe) for the two APIs this
  guide leans on most.
- [Utilities](/docs/theming/utilities) to build your own typed version of Tailwind's utility layer.


---


## Thinking in Panda

Which Panda API to reach for next, from css() to recipes, slots, and config.

Panda has one mental model. Whether you're styling a single button or building a design system, these four ideas hold
true:

- **Styles live next to your markup.** You write them as objects in the same file as the component, not in a separate
  stylesheet you have to keep in sync.
- **Tokens replace raw values.** Name the token once (`blue.500`, `md`, `semibold`) instead of the raw value, and every
  style refers to the same token.
- **Atomic CSS scales.** Each property and value becomes one shared class, so your CSS grows with the number of distinct
  styles, not the number of components.
- **Ships zero runtime.** It all compiles to plain CSS at build time. Nothing computes styles in the browser.

The only question day to day is which API to reach for as a component grows. Start local. Promote only when the shape of
the styles forces it. This walk builds a Button, then a Card, and climbs the ladder: `css` → `cva` → `sva` → config.

Want the case for build-time styles first? Read [Welcome to Panda](/docs/get-started/why-panda).

## Step 1: Start with `css()`

Say you need to style a button that has no variants yet. Use `css()` to put the styles right on the element:

```tsx
import { css } from '../styled-system/css'

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        rounded: 'md',
        fontWeight: 'semibold',
        bg: 'blue.500',
        color: 'white',
        px: '4',
        py: '2',
        _hover: { bg: 'blue.600' },
        md: { px: '5' }
      })}
    >
      {children}
    </button>
  )
}
```

A few habits show up here and stay true for every later step.

**Tokens name intent.** `blue.500`, `md`, `semibold` come from your theme. Panda resolves them to CSS variables.

**Conditions live in the object.** `_hover` and `md` are keys next to the rest of the styles. No separate media file.

**Keep styles static.** Panda reads your source at build time, so literals, local constants, and ternaries are all fine.
The moment a value only exists once the app is running, Panda can't see it. Map runtime choices to styles Panda can see:

```tsx
// ❌ Panda can't see `shade` at build time
function Text({ shade }: { shade: number }) {
  return <p className={css({ color: `red.${shade}` })} />
}

// ✅ every class exists at build time
const byShade = {
  300: css({ color: 'red.300' }),
  500: css({ color: 'red.500' })
}

function Text({ shade }: { shade: keyof typeof byShade }) {
  return <p className={byShade[shade]} />
}
```

> `byShade` is really just a variant map without the name. Catch yourself hand-rolling one like this and take it as a
> sign: that's `cva`, coming up in Step 2. For values that are truly dynamic, a user-picked color, a computed length,
> skip the lookup map too: use [CSS variables](/docs/styling/dynamic-styling) instead.

Each property and value becomes a shared atomic class. Write `css({ color: 'white' })` in two different files, and Panda
still only generates it once. Your CSS scales with how many distinct styles you use, not with how many components you
have.

More on the object syntax: [Writing styles](/docs/styling/writing-styles).

## Step 2: Promote to a recipe when variants appear

The button now needs `size` and `visual`. Duplicating `css()` calls or nesting ternaries isn't an effective approach:

```tsx
// works, but every new variant makes this harder to read
function Button({ size, visual, children }) {
  return (
    <button
      className={css({
        rounded: 'md',
        fontWeight: 'semibold',
        px: size === 'sm' ? '3' : '5',
        py: size === 'sm' ? '1.5' : '3',
        bg: visual === 'solid' ? 'blue.500' : 'transparent',
        color: visual === 'solid' ? 'white' : 'blue.500',
        borderWidth: visual === 'outline' ? '1px' : undefined,
        borderColor: visual === 'outline' ? 'blue.500' : undefined
      })}
    >
      {children}
    </button>
  )
}
```

That's a variant matrix. Reach for `cva`:

```tsx
import { cva } from '../styled-system/css'

const button = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    rounded: 'md',
    fontWeight: 'semibold'
  },
  variants: {
    size: {
      sm: { px: '3', py: '1.5', fontSize: 'sm' },
      lg: { px: '5', py: '3', fontSize: 'md' }
    },
    visual: {
      solid: { bg: 'blue.500', color: 'white', _hover: { bg: 'blue.600' } },
      outline: { borderWidth: '1px', borderColor: 'blue.500', color: 'blue.500' }
    }
  },
  defaultVariants: {
    size: 'sm',
    visual: 'solid'
  }
})

export function Button({ size, visual, children }) {
  return <button className={button({ size, visual })}>{children}</button>
}
```

Always use a recipe when you have variants to name, not simply because the component file gets long. As long as it's a
single element, `cva` alone is enough.

If a component has more than one element, reach for `sva` instead, which you'll see in Step 3.

> That "before" example still compiles, unlike Step 1's `` `red.${shade}` ``. A ternary's branches are both literal, so
> Panda can see them and generates CSS for both. A template literal's interpolation isn't a fixed set of options, so
> there's nothing for Panda to generate. Runtime _choice_ between literals is fine. Runtime _computation_ of a new one
> is not.

Full API: [Recipes](/docs/recipes/atomic-recipe).

## Step 3: Split into slots when markup has parts

Now let's build a Card. Unlike a button, which has a single element, a Card has a `root`, `title`, and a `body`. One
`size` prop should style all three together.

`sva` gives you one recipe and a class bag per part:

```tsx
import { sva } from '../styled-system/css'

const card = sva({
  slots: ['root', 'title', 'body'],
  base: {
    root: {
      rounded: 'lg',
      borderWidth: '1px',
      borderColor: 'gray.200',
      bg: 'white',
      p: '4'
    },
    title: { fontWeight: 'semibold', mb: '2' },
    body: { color: 'gray.600', fontSize: 'sm' }
  },
  variants: {
    size: {
      sm: {
        root: { p: '3' },
        title: { fontSize: 'md' },
        body: { fontSize: 'xs' }
      },
      lg: {
        root: { p: '6' },
        title: { fontSize: 'xl' },
        body: { fontSize: 'md' }
      }
    }
  },
  defaultVariants: { size: 'sm' }
})

export function Card({ size, title, children }) {
  const classes = card({ size })
  return (
    <div className={classes.root}>
      <h2 className={classes.title}>{title}</h2>
      <div className={classes.body}>{children}</div>
    </div>
  )
}
```

Use slots when one variant API owns multiple elements. Stay on `cva` when a single element is enough.

Full API: [Slot recipes](/docs/recipes/slot-recipes).

## Step 4: Move to config when it's a system primitive

`cva` and `sva` are fine as long as the recipe stays colocated: it only matters inside this one component's file.
However, move the same `base` / `variants` / `defaultVariants` shape into `defineRecipe` or `defineSlotRecipe`, then
register it in `panda.config.ts`, once any of this gets true: other apps need to import the component, it ships inside a
preset, or you want Panda to generate CSS only for the variants your code actually calls, not the full matrix.

Button becomes a config recipe:

```ts filename="button.recipe.ts"
import { defineRecipe } from '@pandacss/dev'

export const buttonRecipe = defineRecipe({
  className: 'button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    rounded: 'md',
    fontWeight: 'semibold'
  },
  variants: {
    size: {
      sm: { px: '3', py: '1.5', fontSize: 'sm' },
      lg: { px: '5', py: '3', fontSize: 'md' }
    },
    visual: {
      solid: { bg: 'blue.500', color: 'white', _hover: { bg: 'blue.600' } },
      outline: { borderWidth: '1px', borderColor: 'blue.500', color: 'blue.500' }
    }
  },
  defaultVariants: {
    size: 'sm',
    visual: 'solid'
  }
})
```

Card becomes a config slot recipe:

```ts filename="card.recipe.ts"
import { defineSlotRecipe } from '@pandacss/dev'

export const cardRecipe = defineSlotRecipe({
  className: 'card',
  slots: ['root', 'title', 'body'],
  base: {
    root: {
      rounded: 'lg',
      borderWidth: '1px',
      borderColor: 'gray.200',
      bg: 'white',
      p: '4'
    },
    title: { fontWeight: 'semibold', mb: '2' },
    body: { color: 'gray.600', fontSize: 'sm' }
  },
  variants: {
    size: {
      sm: {
        root: { p: '3' },
        title: { fontSize: 'md' },
        body: { fontSize: 'xs' }
      },
      lg: {
        root: { p: '6' },
        title: { fontSize: 'xl' },
        body: { fontSize: 'md' }
      }
    }
  },
  defaultVariants: { size: 'sm' }
})
```

Register them on the theme, then import the generated recipes from `styled-system`:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import { buttonRecipe } from './button.recipe'
import { cardRecipe } from './card.recipe'

export default defineConfig({
  // ...
  theme: {
    extend: {
      recipes: { button: buttonRecipe },
      slotRecipes: { card: cardRecipe }
    }
  }
})
```

The call signature doesn't change. Only the import path does, from a local file to `styled-system`:

```tsx
import { button, card } from '../styled-system/recipes'

const classes = card({ size: 'lg' })

<button className={button({ size: 'lg', visual: 'outline' })}>Buy now</button>
<div className={classes.root}>
  <h2 className={classes.title}>Plan</h2>
</div>
```

**Decision rule:**

- Stay on `cva` / `sva` for colocated, app-local components.
- Move to `defineRecipe` / `defineSlotRecipe` for design-system components. You get leaner JIT CSS, and you can share
  the recipe through a preset or `panda lib`.

The full comparison table lives here: [Recipes overview](/docs/recipes/overview). Config form for parts:
[Config Slot Recipe](/docs/recipes/config-recipe#config-slot-recipe).

## Trust the system

A few things don't change as you move between `css`, `cva`, `sva`, and config: tokens, cascade layers, and types.

**Tokens are the vocabulary.** Name intent once: `colors.text`, `spacing.4`. Every `css`, recipe, and slot refers to the
same names. See [tokens](/docs/theming/tokens).

**Cascade layers keep overrides predictable.** Panda emits into fixed layers, reset, base, tokens, recipes, utilities,
and a utility always beats a recipe no matter what order you import things in. That's decided at the CSS layer, not in
your code. Merge style objects yourself, though, and a different rule kicks in: the last value wins. See
[cascade layers](/docs/styling/cascade-layers) and [merging styles](/docs/styling/merging-styles).

**Types come from your config.** Autocomplete offers your tokens and recipe variants. A typo is a type error while you
type. Turn on [`strictTokens`](/docs/styling/writing-styles#stricttokens) when you want raw values rejected too.

## Where to go next

Know which step a style belongs on? You already think in Panda.

- [Welcome to Panda](/docs/get-started/why-panda): install Panda and generate your first styles.
- [Writing styles](/docs/styling/writing-styles): the `css` function and object syntax in full.
- [Recipes](/docs/recipes/overview): `cva`, config recipes, slots, and JSX.
- [Slot Recipe](/docs/recipes/slot-recipes): `sva` for parts. Shared form is on
  [Config Recipe](/docs/recipes/config-recipe#config-slot-recipe).


---


## Upgrading to v2

What changed in Panda v2, how to install it, and the breaking changes to fix as you migrate.

v2 keeps the framework you already know and rewrites the compiler underneath it. You write the same `css()`, recipes,
patterns, tokens, conditions, and JSX props. What changed is how Panda turns them into CSS.

## What v2 is

v1 ran extraction and evaluation through `ts-morph` and `ts-evaluator` in Node. v2 replaces that hot path with a native
engine built on [Oxc](https://oxc.rs), shipped two ways:

- **`@pandacss/compiler`** — a native binding. The CLI and bundler plugins use it.
- **`@pandacss/compiler-wasm`** — the same engine compiled to WASM for the browser. The playground runs on it.

Both wrap the same Rust crates, so Node and browser builds produce the same CSS. You get faster extraction — one parse
per file, no TypeScript program in the hot path — and a smaller install, since the `ts-morph` dependency tree is gone.
Output stays in parity with v1 except for the deliberate changes below.

See [Why Panda → How it works](/docs/get-started/why-panda#how-it-works) for the model it keeps.

## Install

Most projects only need `@pandacss/dev`:

```bash
pnpm add -D @pandacss/dev@latest
```

Upgrade any integration you use to the same version: `@pandacss/postcss`, `@pandacss/vite`, `@pandacss/webpack`,
`@pandacss/rollup`, or `@pandacss/bun`. All `@pandacss/*` packages move on one version. Don't mix a v1 package with a v2
one.

v2 is ESM only and needs Node 22 or newer. Set `"type": "module"` (or use `.mjs`) so your `panda.config.ts` loads as
ESM.

### Build

Your v1 `panda.config.ts` carries over. The first time, regenerate from a clean output folder:

```bash
panda build --clean      # codegen + cssgen in one pass
panda codegen --clean    # or, if you only run codegen
panda dev                # rebuild on change
```

You only need `--clean` once. v2 doesn't delete files it no longer generates, and by default v1 wrote `.mjs` where v2
writes `.js`. Vite resolves `index.mjs` before `index.js`, so a leftover v1 file can win over the new one.

Missing `Flex` or other pattern components after that? Add `@pandacss/preset-base`. See
[Presets aren't added for you](#presets-arent-added-for-you).

The `panda` and `pandacss` binaries are the same as v1.

## Breaking changes to fix

These are the changes you have to act on when you move a project from v1.

### ESM only

There's no CommonJS build. If your config or tooling used `require()`:

```js
// ❌ v1
const { defineConfig } = require('@pandacss/dev')

// ✅ v2
import { defineConfig } from '@pandacss/dev'
```

Set `"type": "module"`, use `.mjs`, or run through an ESM-aware bundler. The `postcss.config.cjs` that
`panda init --postcss` writes is CommonJS on purpose and still works.

### Hooks moved to plugins

Hooks still exist, but they live on named plugins now, not a root `hooks` object:

```ts
// ❌ v1
export default defineConfig({
  hooks: {
    'cssgen:done': ({ content }) => content
  }
})

// ✅ v2
export default defineConfig({
  plugins: [
    {
      name: 'local',
      hooks: {
        'parser:before': {
          filter: { id: '**/*.{jsx,tsx}' },
          handler: ({ content }) => content
        }
      }
    }
  ]
})
```

Supported hooks: `config:resolved`, `preset:resolved`, `parser:before`, `codegen:prepare`, `codegen:done`, and
`cssgen:done`. `cssgen:done` is observe-only now — it runs after the final CSS with `{ artifact, content, path? }` and
can't rewrite the string. Used it to strip unused tokens or keyframes? Reach for `optimize.removeUnusedTokens` /
`removeUnusedKeyframes` instead. The v1 engine hooks (`context:created`, `parser:after`, `tokens:created`,
`utility:created`, `parser:before.configure(...)`, …) are gone. See [Plugins](/docs/theming/plugins).

### createStyleContext is now two helpers

`createStyleContext` is gone from `styled-system/jsx`. Use one helper per recipe kind:

```tsx
// ❌ v1 — one helper for both
import { createStyleContext } from 'styled-system/jsx'

// ✅ v2 — slot recipe (sva)
import { createSlotRecipeContext } from 'styled-system/jsx'
const { withRootProvider, withProvider, withContext } = createSlotRecipeContext(card)

// ✅ v2 — config recipe (cva)
import { createRecipeContext } from 'styled-system/jsx'
const { withContext } = createRecipeContext(button)
```

`withRootProvider` is new — use it for a slot recipe's root when the root doesn't render a slot of its own. See
[slot recipe context](/docs/recipes/slot-recipe-context).

### defineParts is gone

`defineParts` only renamed keys to selectors, so write the selector yourself. For a class per part, use
`defineSlotRecipe` instead.

```ts
// ❌ v1
const parts = defineParts(anatomy.build())
base: parts({ control: { borderWidth: '1px' } })

// ✅ v2 — the selector is the key
base: { '& [data-part="control"]': { borderWidth: '1px' } }
```

If you'd rather keep the helper, copy it into your config:

```ts
import type { SystemStyleObject } from '@pandacss/types'

const defineParts =
  <T extends Record<string, { selector: string }>>(parts: T) =>
  (config: Partial<Record<keyof T, SystemStyleObject>>): SystemStyleObject =>
    Object.fromEntries(Object.entries(config).map(([key, value]) => [parts[key].selector, value]))
```

### MCP moved to its own package

The MCP server left the CLI. Run it from `@pandacss/mcp` with the `panda-mcp` binary:

```bash
# ❌ v1
panda mcp
panda init-mcp

# ✅ v2 — run it directly, nothing to install
npx -y @pandacss/mcp
```

See [MCP server](/docs/get-started/mcp-server).

### Compound variants are their own class

v1 merged compound-variant styles into the `css` prop, so a `textStyle` in `css` replaced the compound's text style. v2
emits each compound variant as its own class, so properties you don't override still apply. If you relied on the
replacement, override those properties in `css` directly.

### Packages folded into the compiler

These v1 internals are gone; their work lives in `@pandacss/compiler` now. Drop direct imports of `@pandacss/core`,
`@pandacss/extractor`, `@pandacss/generator`, `@pandacss/node`, `@pandacss/parser`, `@pandacss/token-dictionary`,
`@pandacss/is-valid-prop`, `@pandacss/logger`, `@pandacss/reporter`, and the Astro `@pandacss/studio`, replaced by the
hosted [Studio](https://studio.panda-css.com/). The same goes for `@pandacss/plugin-vue` and `@pandacss/plugin-svelte`:
the compiler reads `.vue`, `.svelte`, and `.astro` files directly, so remove them from `plugins`. If you only use
`@pandacss/dev` plus Vite or PostCSS, you're fine.

### Config options removed

Nine options are gone: `studio` (and its sub-options), `eject`, `emitTokensOnly`, `gitignore`, `clean`, `watch`, `poll`,
`lightningcss`, and `browserslist`. `forceConsistentTypeExtension` is replaced by `forceImportExtension` — different
semantics, not a rename. `outExtension` gains a `'ts'` value. See [Config](/docs/reference/config).

### Presets aren't added for you

v1 added `@pandacss/preset-base` unless you set `eject: true`, even when you listed your own presets. v2 adds nothing. A
config that only lists its own presets loses the base utilities and conditions. It still builds, but with
`unknown_condition` warnings. List the presets you need:

```ts
// ❌ v1: preset-base was added for you
export default defineConfig({ presets: ['@acme/preset'] })

// ✅ v2
export default defineConfig({ presets: ['@pandacss/preset-base', '@acme/preset'] })
```

### theme.containerSizes is now theme.containers

The old key is ignored without a warning, so every `@name/size` container condition stops working.

```ts
// ❌ v1
theme: {
  extend: {
    containerSizes: {
      sm: '384px'
    }
  }
}

// ✅ v2
theme: {
  extend: {
    containers: {
      sm: '384px'
    }
  }
}
```

### Type imports moved

`@pandacss/dev` only exports the `Config`, `Preset`, and `UserConfig` types. Import other config types from
`@pandacss/types`:

```ts
// ❌ v1
import type { RecipeConfig } from '@pandacss/dev'

// ✅ v2
import type { RecipeConfig } from '@pandacss/types'
```

Generated types changed too:

- `Token` and `SizeToken` moved from `styled-system/tokens` to `styled-system/types`.
- `types/prop-type` (`UtilityValues`) and `CssProperties` are gone. Use `SystemStyleObject` or `SystemProperties` from
  `styled-system/types`.
- The generated `RecipeConfig` and `SlotRecipeConfig` are now `RecipeDefinition` and `SlotRecipeDefinition`, without the
  config fields (`className`, `jsx`, `staticCss`, `description`). Use `@pandacss/types` for the config shape.

### Template literal syntax is removed

The `syntax` option and the `template-literal` authoring mode are gone. Drop `syntax` from your config and the
`--syntax` flag from `panda init`, and write styles as objects:

```ts
// ❌ v1
css`
  color: red;
`

// ✅ v2
css({ color: 'red' })
```

### Array conditions are deprecated

Array conditions still work: Panda converts them to the object form and warns. Move to an object that nests each rule
and ends in `'@slot'`:

```ts
// ❌ v1
conditions: {
  supportHover: ['@media (hover: hover)', '&:hover']
}

// ✅ v2
conditions: {
  supportHover: {
    '@media (hover: hover)': { '&:hover': '@slot' }
  }
}
```

### Qwik JSX is removed

`jsxFramework: 'qwik'` no longer generates `styled`, `Box`, or pattern components. Drop the option and style with
`css()`, `cva()`, and pattern functions; Qwik's `class` accepts their output directly.

```tsx
// ❌ v1
import { Box } from 'styled-system/jsx'
;<Box color="red.500" />

// ✅ v2
import { css } from 'styled-system/css'
;<div class={css({ color: 'red.500' })} />
```

### CLI commands and flags

Check your package scripts as well as your config. The CLI no longer accepts several v1 commands and flags. Use
`panda doctor` to check your setup, and add `--json` for scripts.

#### Replace removed commands

| v1 command                                           | v2 replacement                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `panda spec`                                         | `panda codegen --spec`, or `--spec=./design-system.json` for a custom path                                           |
| `panda ship`                                         | `panda lib` to publish a design system; `panda buildinfo --outfile ./dist/panda.buildinfo.json` for build info alone |
| `panda emit-pkg`                                     | Removed. `panda lib` manages design-system package exports; review other runtime package exports yourself            |
| `panda studio` (including `--build` and `--preview`) | Use the hosted [Studio](https://studio.panda-css.com/)                                                               |

`--spec` also works on `panda build` and `panda lib`. It writes one design-system document instead of the v1 spec files.
See [Codegen](/docs/reference/cli#codegen).

#### Replace logging and profiling flags

`--silent` is now `--log-level silent`. Update scripts such as:

```json
// v1
{ "scripts": { "prepare": "panda codegen --silent" } }

// v2
{ "scripts": { "prepare": "panda codegen --log-level silent" } }
```

Use `--log-level error` if you want errors to remain visible. `silent` also suppresses normal diagnostic output. The
available levels are `silent`, `error`, `warn`, `info`, and `debug`.

`--profile` replaces `--cpu-prof` and includes time in the Rust engine. It writes `trace.json` and `timings.json`, not a
Node `.cpuprofile`; update any scripts that read the old profile. Shared flags use kebab-case (`--max-warnings`,
`--watch-debounce`, …). See [CLI](/docs/reference/cli).

#### Replace positional globs with --include

`panda`, `panda cssgen`, `panda analyze`, and `panda debug` no longer take a positional glob. Use `--include`, and
repeat it for more globs:

```bash
# v1
panda cssgen "src/**/*.tsx"

# v2
panda cssgen --include "src/**/*.tsx" --include "components/**/*.tsx"
```

A positional glob on bare `panda` is treated as a command name. On `cssgen`, `analyze`, and `debug`, it does not
restrict the scan; Panda uses your configured `include` list instead.

`panda cssgen tokens` (and `preflight`, `static`, `global`, or `keyframes`) no longer selects an individual artifact.
Generate the full stylesheet, or use `panda cssgen --splitting` and import the layers you need.

#### Update output and build flags

| v1 flag                                           | v2 replacement                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `panda -o dist`                                   | `panda --outdir dist`. On the full build, `-o` now means `--outfile`, a CSS file path           |
| `panda --preflight`, `--hash`, `--exclude` / `-e` | Set `preflight`, `hash`, and `exclude` in `panda.config.ts`                                     |
| `panda --minify` / `-m`                           | Set `minify` in config, or run `panda cssgen --minify`                                          |
| `panda cssgen -m`                                 | Use the full `--minify` flag                                                                    |
| `panda cssgen --clean`                            | Use `panda build --clean` or `panda codegen --clean` to clean generated output                  |
| `--poll` / `-p`                                   | Remove it; watching has no polling flag. `--watch-debounce` changes rebuild timing, not polling |
| `--lightningcss`, `--emitTokensOnly`              | Remove them; these flags have no v2 equivalent                                                  |

`panda cssgen --minimal` now includes `staticCss` rules, because they live in the `recipes` and `utilities` layers.
Per-package sheets built with `--minimal` repeat the static rules the host sheet already ships.

### Theme keys without `extend` replace less than they did

A theme key written without `extend` still replaces what a preset defined. What changed is how much it claims.

v1 claimed the key directly under `theme`, so naming one scale claimed all of `tokens`:

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

- **v1**: color tokens replaced, and `spacing`, `fonts`, `radii` and `fontSizes` dropped with them.
- **v2**: color tokens replaced, every other scale untouched.

v2 claims the entry you name. The same holds a level down:

```ts
theme: {
  recipes: {
    button: myButton
  }
}
```

- **v1**: `button` replaced, and every other recipe a preset registered dropped with it.
- **v2**: `button` replaced, the rest left alone.

`breakpoints` is the exception. A breakpoint is a single value, not a definition, so writing them without `extend`
replaces the whole set.

Nothing to change if you already use `extend`.

### Border overrides sort by property, not source order

v2 orders atomic rules by property breadth, deterministically. All the border shorthands sit in one tier, so an
all-sides shorthand always wins over a per-side one, no matter the merge order. Composing an all-sides border with a
per-side override no longer opens that side:

```tsx
// v1: renders an open bracket — the override was declared last
// v2: renders a closed box — borderWidth re-applies the inline-end side
cx(css({ borderWidth: '1px', borderStyle: 'solid' }), css({ borderInlineEnd: '0' }))
```

Reach for the longhand when the override has to win — longhands rank above every shorthand, so they always land last:

```tsx
cx(css({ borderWidth: '1px', borderStyle: 'solid' }), css({ borderInlineEndWidth: '0' }))
```

Padding, margin, and every other property group sort the same way. See [Border](/docs/reference/border).

### scrollbarWidth takes keywords, not tokens

v1 mapped `scrollbarWidth` to `sizes` tokens, so `scrollbarWidth: '4'` emitted `var(--sizes-4)` and browsers dropped it.
It's now `auto | thin | none`:

```ts
// ❌ v1 — type-checked, invalid CSS
css({ scrollbarWidth: '4' })

// ✅ v2
css({ scrollbarWidth: 'thin' })
```

If you passed a single color to `scrollbarColor`, move it to `scrollbarThumb`. `scrollbarColor` is now a raw two-value
string (`'red transparent'`).

### sizes.prose is narrower

`@pandacss/preset-panda` changes `sizes.prose` from `65ch` to `60ch`. Styles such as `maxWidth: 'prose'` will use the
narrower value. To keep the v1 width, override the token:

```ts
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        sizes: {
          prose: { value: '65ch' }
        }
      }
    }
  }
})
```

### No universal variable reset

v1 seeded `--translate-x`, `--blur`, `--gradient-from-position` and friends through a `*, ::before, ::after, ::backdrop`
rule — 34 declarations on every element, used or not. v2 registers those variables with `@property` instead, so they
carry their own defaults and only ship when you use the utility. A page that uses none of them gets an empty base layer.

This needs `@property` (Chrome 85+, Safari 16.4+, Firefox 128+); older browsers drop the affected utilities rather than
mis-render them. Set `optimize.propertyFallback: true` to also seed the defaults as plain declarations for the variables
your project uses.

## Panda follows imports

In v1, a style value imported from another file produced no CSS. Panda saw `brand`, couldn't follow the import, and
skipped the property. v2 follows the import, reads the value, and generates the rule.

```ts filename="theme.ts"
export const brand = 'red.500'
export const gutter = '4'
```

```tsx filename="button.tsx"
import { css } from '../styled-system/css'
import { brand, gutter } from './theme'

// ❌ v1: no CSS for either property
// ✅ v2: background: var(--colors-red-500) and padding-inline: var(--spacing-4)
css({ bg: brand, px: gutter })
```

Panda follows named imports, re-exports, `export *` barrels, and tsconfig path aliases. Imported helper functions and
`css.raw()` styles work too, as long as the result is static.

If you added `staticCss` entries or copied a value inline only because v1 couldn't see the import, you can remove them.

Two forms still aren't followed: default imports (`import theme from './theme'`) and namespace imports
(`import * as theme from './theme'`). Use a named import instead. Values that only exist at runtime, like props or
state, never produce CSS from any file. See
[Imports from other files](/docs/styling/dynamic-styling#imports-from-other-files).

## What's new you'll want

Beyond parity, v2 adds features worth turning on:

- **The `optimize` block.** Opt-in CSS cleanup: `removeUnusedTokens`, `removeUnusedKeyframes`, `smartCompoundVariants`,
  `treeshakeDesignSystem`, and `propertyFallback`. It replaces the common v1 `cssgen:done` cleanup.
- **New utilities and conditions.** Mask helpers ([Masks](/docs/reference/masks)), scrollbar utilities, pointer and
  validity conditions (`_pointerFine`, `_userValid`, `_inert`), and raw CSS keywords like `textWrap: 'pretty'` and
  `justifyContent: 'safe center'`.
- **`viewTransition()`.** Style the View Transitions API and get a stable class back. See
  [View transitions](/docs/styling/view-transition).
- **`positionTry()`.** Define CSS anchor-positioning fallbacks with a typed, tree-shaken factory. Replaces the removed
  `globalPositionTry` config. See [Position try](/docs/styling/position-try).
- **Source transforms.** Let bundler plugins rewrite static `css()` calls with `transform: true`.
- **Smaller `.d.ts`.** `cva` / `sva` return types key on a clean props type, which unblocks `isolatedDeclarations`. See
  [Isolated declarations](/docs/design-systems/isolated-declarations).
- **Design systems.** `panda lib` publishes a component library; apps consume it with the `designSystem` config field.
  It replaces `panda ship`. See [Build a design system](/docs/design-systems/build-a-design-system) and
  [Consume with Panda](/docs/design-systems/consume-with-panda).
- **Linting on the v2 engine.** The [ESLint & oxlint plugin](/docs/get-started/linting) lints against the same
  extraction the build uses.

## See also

- [Config](/docs/reference/config) — the full v2 config reference.
- [CLI](/docs/reference/cli) — every command and flag.
- [Why Panda → How it works](/docs/get-started/why-panda#how-it-works) — the mental model v2 keeps.


---


## Migrating from vanilla-extract

Migrate your project from vanilla-extract to Panda and see how style, recipes, sprinkles, and themes map across.

vanilla-extract and Panda share the same model: typed style objects, compiled to static CSS at build time, with no
runtime. The difference is where styles live and how much you build yourself:

- **vanilla-extract keeps styles in `.css.ts` files.** Every class is a named export you import into the component.
  Tokens, utilities, and variants come from separate packages you wire up: `createTheme`, Sprinkles, Recipes.
- **Panda lets styles live next to the component, or in their own files.** Tokens, utilities, responsive values, and
  recipes are built in, and styles are extracted from any file Panda scans.

Install Panda through your [framework guide](/docs/get-started/framework-guides).

## Keep separate style files

Styles can stay in their own files. `css()` returns a class name like `style()`, and `cva()` returns a function like
`recipe()`, so you can convert each `.css.ts` file in place. Keep the file names, and every component that uses them
stays the same.

```ts filename="button.css.ts"
import { css, cva } from '../styled-system/css'

export const root = css({ display: 'flex', gap: '3' })

export const button = cva({
  variants: { size: { small: { padding: '12px' }, large: { padding: '24px' } } }
})
```

```tsx filename="button.tsx"
import * as styles from './button.css'

export const Button = () => (
  <div className={styles.root}>
    <button className={styles.button({ size: 'large' })} />
  </div>
)
```

Point `include` at your style files. Add your components too once you write styles inline or use
[JSX style props](/docs/styling/style-props):

```ts filename="panda.config.ts"
export default defineConfig({
  include: ['./src/**/*.css.ts', './src/**/*.tsx']
})
```

Migrating one file at a time? The vanilla-extract plugin still compiles every `.css.ts` file until you remove it. Files
that only export `css()` class names are fine, but a file that exports a `cva()` recipe fails its build. Give those
files another suffix, like `.styles.ts`, until the migration is complete.

## Run both during the migration

Panda's CSS ships inside cascade layers, and vanilla-extract's output is unlayered unless you use its `layer()` API. So
vanilla-extract styles win over converted components by default. See
[Migrating alongside unlayered CSS](/docs/styling/cascade-layers#migrating-alongside-unlayered-css) for the two ways to
control which side wins.

## Theme to tokens

`createTheme` and `createGlobalTheme` become tokens in config, referenced by name instead of through the `vars`
contract:

```ts filename="theme.css.ts"
import { createGlobalTheme } from '@vanilla-extract/css'

// before
export const vars = createGlobalTheme(':root', {
  color: { brand: '#0ea5e9' },
  space: { small: '4px', medium: '8px' }
})
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

// after
export default defineConfig({
  // the selector you passed to createGlobalTheme; defaults to :where(:root, :host)
  cssVarRoot: ':root',
  theme: {
    extend: {
      tokens: {
        colors: { brand: { value: '#0ea5e9' } },
        spacing: { small: { value: '4px' }, medium: { value: '8px' } }
      }
    }
  }
})
```

```tsx
// before: style({ color: vars.color.brand, padding: vars.space.small })
css({ color: 'brand', padding: 'small' })
```

Outside of styles, where you'd read `vars.color.brand` in JavaScript, use [`token()`](/docs/theming/tokens).
`vars.color.brand` is a CSS variable reference, and so is `token.var()`. `token()` returns the raw value:

```ts
import { token } from '../styled-system/tokens'

// before: vars.color.brand → 'var(--color-brand__1fx8k3)'
token.var('colors.brand') // 'var(--colors-brand)'
token('colors.brand') // '#0ea5e9'
```

### Alternative themes

`createTheme(vars, { … })` maps to Panda's [themes](/docs/theming/multiple-themes): alternative values for the same
tokens, scoped by an attribute instead of a class. A theme contract maps across too:

```ts filename="theme.css.ts"
// before
export const vars = createThemeContract({ color: { accent: '' } })
export const brandTheme = createTheme(vars, { color: { accent: 'purple' } })
```

```ts filename="panda.config.ts"
import { defineConfig, defineThemeContract } from '@pandacss/dev'

// after
const defineTheme = defineThemeContract({
  semanticTokens: { colors: { accent: { value: '' } } }
})

export default defineConfig({
  themes: {
    brand: defineTheme({ semanticTokens: { colors: { accent: { value: '{colors.purple.600}' } } } })
  },
  staticCss: { themes: ['brand'] }
})
```

```tsx
// before: <div className={brandTheme}>
<div data-panda-theme="brand">…</div>
```

Like a theme class, the attribute works on any element and nests. Code-split themes become
[on-demand themes](/docs/theming/multiple-themes#on-demand), loaded with `getTheme()`. If the alternative theme is only
dark mode, use a semantic token with a `_dark` value instead.

## style() to css()

`style()` becomes `css()`. Both return a class name:

```ts
import { style } from '@vanilla-extract/css'

// before
export const button = style({ display: 'flex', paddingTop: '3px' })
```

```ts
import { css } from '../styled-system/css'

// after
export const button = css({ display: 'flex', paddingTop: '3px' })
```

You can also write it inline, next to the markup: `<button className={css({ display: 'flex' })} />`.

## Selectors and at-rules

Pseudo selectors become [conditions](/docs/styling/conditional-styles). Complex selectors keep their `&` syntax, without
the `selectors` wrapper:

```ts
// before
style({
  ':hover': { color: 'pink' },
  selectors: {
    '&:hover:not(:active)': { borderColor: 'aquamarine' },
    'nav li > &': { textDecoration: 'underline' }
  }
})
```

```ts
// after
css({
  _hover: { color: 'pink' },
  '&:hover:not(:active)': { borderColor: 'aquamarine' },
  'nav li > &': { textDecoration: 'underline' }
})
```

A parent class selector (``[`${parent}:focus &`]``) becomes a group condition. Mark the parent with `group`:

```tsx
<div className="group">
  <span className={css({ _groupFocus: { bg: 'gray.100' } })} />
</div>
```

`@media`, `@container`, and `@supports` objects become plain keys, or
[responsive values](/docs/styling/responsive-design) for your breakpoints:

```ts
// before
style({
  '@media': { 'screen and (min-width: 768px)': { padding: 10 } },
  '@supports': { '(display: grid)': { display: 'grid' } }
})
```

```ts
// after
css({
  padding: { base: '2', md: '10px' },
  '@supports (display: grid)': { display: 'grid' }
})
```

## Composition

`style([base, { … }])` becomes `css(base, { … })`. Keep the shared part as a plain object with
[`css.raw()`](/docs/styling/merging-styles):

```ts
// before
const base = style({ padding: 12 })
const primary = style([base, { background: 'blue' }])
```

```ts
// after
const base = css.raw({ padding: '12px' })
const primary = css(base, { background: 'blue' })
```

Later objects win, so an override always beats the base.

## styleVariants to style maps

`styleVariants` returns an object of class names. A plain object of `css()` calls has the same shape, so
`background[variant]` keeps working:

```ts
// before
export const background = styleVariants({
  primary: { background: 'blue' },
  secondary: { background: 'aqua' }
})
```

```ts
// after
export const background = {
  primary: css({ background: 'blue' }),
  secondary: css({ background: 'aqua' })
}
```

`styleVariants(palette, mapFn)` builds the map from data. Panda doesn't run
[built-ins like `.map`](/docs/styling/dynamic-styling#unsupported-expressions) during extraction, so write the map out.
To pick a variant with a typed prop, put the map in a [recipe](/docs/recipes/atomic-recipe), with the shared style as
its `base`:

```ts
// before
const base = style({ padding: 12 })
const palette = { primary: 'blue', secondary: 'aqua' }

export const variant = styleVariants(palette, color => [base, { background: color }])
```

```ts
// after
export const variant = cva({
  base: { padding: '12px' },
  variants: {
    tone: {
      primary: { background: 'blue' },
      secondary: { background: 'aqua' }
    }
  }
})
```

## recipe() to cva()

A [recipe](/docs/recipes/atomic-recipe) moves over almost unchanged. Only compound variants change shape: the conditions
sit at the top level and `style` becomes `css`.

```ts
import { recipe } from '@vanilla-extract/recipes'

// before
export const button = recipe({
  base: { borderRadius: 6 },
  variants: {
    color: { neutral: { background: 'whitesmoke' }, brand: { background: 'blueviolet' } },
    size: { small: { padding: 12 }, large: { padding: 24 } }
  },
  compoundVariants: [{ variants: { color: 'neutral', size: 'large' }, style: { background: 'ghostwhite' } }],
  defaultVariants: { color: 'brand', size: 'small' }
})
```

```ts
import { cva } from '../styled-system/css'

// after
export const button = cva({
  base: { borderRadius: '6px' },
  variants: {
    color: { neutral: { background: 'whitesmoke' }, brand: { background: 'blueviolet' } },
    size: { small: { padding: '12px' }, large: { padding: '24px' } }
  },
  compoundVariants: [{ color: 'neutral', size: 'large', css: { background: 'ghostwhite' } }],
  defaultVariants: { color: 'brand', size: 'small' }
})
```

`RecipeVariants<typeof button>` becomes `RecipeVariantProps<typeof button>`. For components with several parts, use
[slot recipes](/docs/recipes/slot-recipes).

## Sprinkles to utilities

A Sprinkles setup, `defineProperties` plus `createSprinkles`, maps to Panda's config:

```ts filename="sprinkles.css.ts"
import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'

// before
const space = { none: 0, small: '4px', medium: '8px', large: '16px' }

const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': 'screen and (min-width: 768px)' },
    desktop: { '@media': 'screen and (min-width: 1024px)' }
  },
  defaultCondition: 'mobile',
  properties: {
    display: ['none', 'flex', 'block', 'inline'],
    flexDirection: ['row', 'column'],
    paddingLeft: space,
    paddingRight: space
  },
  shorthands: { paddingX: ['paddingLeft', 'paddingRight'] }
})

export const sprinkles = createSprinkles(responsiveProperties)
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

// after
export default defineConfig({
  theme: {
    extend: {
      tokens: {
        spacing: {
          none: { value: '0' },
          small: { value: '4px' },
          medium: { value: '8px' },
          large: { value: '16px' }
        }
      },
      breakpoints: { tablet: '48rem', desktop: '64rem' }
    }
  }
})
```

- The `space` scale becomes `spacing` tokens.
- `conditions` become `breakpoints`. Keep the names, and call sites keep them too. `defaultCondition` becomes `base`.
- `properties` and `shorthands` need no config. `@pandacss/preset-base` ships a utility for every CSS property, with
  shorthands like `paddingX` and `px`.
- `createSprinkles` needs nothing: `css()` is your sprinkles function.

```ts
// before
sprinkles({ display: 'flex', paddingX: 'small', flexDirection: { mobile: 'column', desktop: 'row' } })
```

```ts
// after
css({ display: 'flex', paddingX: 'small', flexDirection: { base: 'column', desktop: 'row' } })
```

Sprinkles only accepts the values you list. Panda accepts any CSS value. Turn on
[`strictTokens`](/docs/reference/config#stricttokens) to allow only your tokens.

For a property your Sprinkles setup defined that the preset doesn't have, add a [utility](/docs/theming/utilities):

```ts filename="panda.config.ts"
export default defineConfig({
  utilities: {
    extend: {
      gutter: {
        values: 'spacing',
        transform: value => ({ paddingInline: value })
      }
    }
  }
})
```

```ts
css({ gutter: 'small' })
```

The same props work on [JSX components](/docs/styling/style-props): `<Box display="flex" px="small" />`.

## Variables and dynamic values

`createVar()` plus `vars: { [myVar]: … }` becomes a custom property key:

```ts
// before
const accent = createVar()
style({ vars: { [accent]: 'purple' }, color: accent })
```

```ts
// after
css({ '--accent': 'purple', color: 'var(--accent)' })
```

`assignInlineVars` for runtime values becomes a plain `style` prop setting the same variable:

```tsx
<section className={css({ color: 'var(--accent)' })} style={{ '--accent': props.color } as React.CSSProperties} />
```

See [Dynamic styling](/docs/styling/dynamic-styling) for the other runtime patterns.

## Global styles, fonts, and keyframes

These move into config, or stay as one-to-one functions:

- `globalStyle('body', { margin: 0 })` becomes [`globalCss`](/docs/styling/global-styles): `body: { margin: 0 }`.
- `fontFace` becomes [`globalFontface`](/docs/theming/fonts).
- `keyframes` maps to Panda's [`keyframes()`](/docs/styling/keyframes), or to `theme.keyframes` for shared animations
  referenced by name.

## After migrating

- **Remove the build plugin.** Drop the vanilla-extract bundler plugin and the `.css.ts` files.
- **Keep the zero-runtime output.** [Source transforms](/docs/styling/source-transforms) rewrite static `css()` and
  `cva()` calls to plain class strings.
- **Enforce tokens.** The [lint rules](/docs/get-started/linting) flag raw values where a token exists, the guarantee a
  typed `vars` contract gave you.

## See also

- [Writing Styles](/docs/styling/writing-styles) for the full `css()` model this guide maps onto.
- [Recipes](/docs/recipes/atomic-recipe) for variants beyond what `recipe()` covers.


---


## Using Vite

Easily use Panda with Vite, React and Typescript with our dedicated integration.

This guide will show you how to set up Panda CSS in a Vite project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Vite project

To get started, we will need to create a new Vite project using `react-ts` template.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm create vite test-app --template react-ts
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    npm create vite@latest test-app -- --template react-ts
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create vite test-app --template react-ts
    cd test-app
    yarn
    ```
  </Tab>
  <Tab>
    ```bash
    bun create vite test-app --template react-ts
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` before your framework plugin. It generates the `styled-system` folder, injects the CSS, and keeps
both up to date on save. No separate watcher needed.

```ts {2,6} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [pandacss(), react()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers `tsc` and your editor, which read `styled-system`
before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your React components are included in the `include` section of the `panda.config.ts`
file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Generates JSX utilities with options of React, Preact, Solid, Vue
  jsxFramework: 'react',

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/index.css` file imported in the root component of your project.

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

> **Note:** Feel free to remove `src/App.css` file as we don't need it anymore, and make sure to remove the import from
> the `src/App.tsx` file.

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your `src/App.tsx`
file.

```tsx filename="src/App.tsx"
import { css } from '../styled-system/css'

function App() {
  return <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Hello 🐼!</div>
}

export default App
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), react()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>

## Troubleshooting

If you're not getting import autocomplete in your IDE, you may need to include the `styled-system` directory in your
`tsconfig.json` file:

```json filename="tsconfig.json"
{
  // ...
  "include": ["src", "styled-system"]
}
```


---


## Using Vue

Easily use Panda with Vue with our dedicated integration.

Learn how to set up Panda CSS in a Vue project using the `@pandacss/vite` plugin.

Prefer PostCSS? Run `panda init --postcss` instead of the plugin step below and follow
[Using PostCSS](/docs/get-started/postcss). Everything else on this page stays the same.

## Start a new project

<Steps>

### Create Vite project

To get started, we will need to create a new Vue project using the official
[scaffolding tool](https://github.com/vuejs/create-vue).

If you don't enter any parameter, the CLI will guide you through the process of creating a new Vue app.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm create vue@latest
    ```
  </Tab>
  <Tab>
    ```bash
    npm create vue@latest
    ```
  </Tab>
  <Tab>
    ```bash
    yarn create vue@latest
    ```
  </Tab>
  <Tab>
    ```bash
    bun create vue@latest
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

You will be asked a few questions, answer them as follows:

```bash
Vue.js - The Progressive JavaScript Framework

✔ Project name: … test-app
✔ Add TypeScript? … Yes
✔ Add JSX Support? … Yes
✔ Add Vue Router for Single Page Application development? … No / Yes
✔ Add Pinia for state management? … No / Yes
✔ Add Vitest for Unit Testing? … No / Yes
✔ Add an End-to-End Testing Solution? › No
✔ Add ESLint for code quality? … No / Yes
✔ Add Prettier for code formatting? … No / Yes
```

Enter the newly created directory and install the dependencies.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    cd test-app
    pnpm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    npm install
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    yarn
    ```
  </Tab>
  <Tab>
    ```bash
    cd test-app
    bun install
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Install Panda

Install panda, the Vite plugin, and create your `panda.config.ts` file.

`panda init` also installs `@pandacss/preset-base` and `@pandacss/preset-panda` and lists them under `presets`. Keep
them there. Without them you get no utilities, tokens or conditions.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm install -D @pandacss/dev @pandacss/vite
    pnpm panda init
    ```
  </Tab>
  <Tab>
    ```bash
    npm install -D @pandacss/dev @pandacss/vite
    npx panda init
    ```
  </Tab>
  <Tab>
    ```bash
    yarn add -D @pandacss/dev @pandacss/vite
    yarn panda init
    ```
  </Tab>
  <Tab>
    ```bash
    bun add -D @pandacss/dev @pandacss/vite
    bun panda init
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Add the Vite plugin

Add `pandacss()` to your Vite plugins. It generates the `styled-system` folder, injects the CSS, and keeps both up
to date on save. No separate watcher needed.

```ts {2,6} filename="vite.config.ts"
import { defineConfig } from 'vite'
import pandacss from '@pandacss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [pandacss(), vue()]
})
```

### Update package.json scripts

Open your `package.json` file and update the `scripts` section as follows:

```diff {3} filename="package.json"
{
  "scripts": {
+    "prepare": "panda codegen",
    "dev": "vite",
    "build": "run-p type-check build-only",
    "preview": "vite preview",
    "build-only": "vite build"
  }
}
```

The plugin only runs with Vite. The `"prepare"` script covers type checking and your editor, which read
`styled-system` before Vite starts, and lets the folder stay gitignored.

### Configure the content

Make sure that all of the paths of your Vue components are included in the `include` section of the `panda.config.ts`
file.

```js {9} filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx,vue}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system'
})
```

### Configure CSS layers

Add this code to an `src/index.css` file and import it in the root component of your project.

```css filename="src/index.css"
@layer reset, base, tokens, recipes, utilities;
```

This file only sets the layer order. The plugin injects the generated CSS for you.

## Start your build process

Run the following command to start your development server.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm dev
    ```
  </Tab>
  <Tab>
    ```bash
    npm run dev
    ```
  </Tab>
  <Tab>
    ```bash
    yarn dev
    ```
  </Tab>
  <Tab>
    ```bash
    bun dev
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

### Start using Panda

Now you can start using Panda CSS in your project. Here is the snippet of code that you can use in your `src/App.vue`
file.

```vue-html filename="src/App.vue"
<script setup lang="ts">
import { css } from "../styled-system/css";
</script>

<template>
  <div :class="css({ fontSize: '5xl', fontWeight: 'bold' })">Hello 🐼!</div>
</template>
```

### Optional: drop the styling runtime

By default `css()` resolves class strings in the browser with a small runtime. Turn on source transforms and the
plugin rewrites static calls to plain class strings at build time, so the runtime never ships:

```ts filename="vite.config.ts"
plugins: [pandacss({ transform: true }), vue()]
```

Dynamic values keep their runtime form. See [Source transforms](/docs/styling/source-transforms).

</Steps>


---


## Why Panda

What Panda is, and what you get from writing styles this way.

## What is Panda

Panda is a styling engine. You write styles in TypeScript, and Panda generates plain atomic CSS at build time.

It reads your source rather than running in the browser: static analysis picks up JSX style props and function calls,
and only the styles you actually used end up in the stylesheet. You get the authoring experience of CSS-in-JS without
shipping a style engine to your users.

There is more than one way to write it. Every tab below produces the same atomic CSS.

<Tabs items={['css function', 'Style props', 'Patterns', 'Recipes']}>
  <Tab>
    ```jsx
    import { css } from '../styled-system/css'

    export function Card() {
      return (
        <div className={css({ display: 'flex', gap: '4', p: '4', rounded: 'md', bg: 'white' })}>
          <img className={css({ w: '12', h: '12', rounded: 'full' })} src="/avatar.png" alt="" />
          <span className={css({ fontWeight: 'semibold' })}>John Doe</span>
        </div>
      )
    }
    ```

  </Tab>
  <Tab>
    ```jsx
    import { styled } from '../styled-system/jsx'

    export function Card() {
      return (
        <styled.div display="flex" gap="4" p="4" rounded="md" bg="white">
          <styled.img w="12" h="12" rounded="full" src="/avatar.png" alt="" />
          <styled.span fontWeight="semibold">John Doe</styled.span>
        </styled.div>
      )
    }
    ```

  </Tab>
  <Tab>
    ```jsx
    import { hstack, circle } from '../styled-system/patterns'

    export function Card() {
      return (
        <div className={hstack({ gap: '4', p: '4', rounded: 'md', bg: 'white' })}>
          <img className={circle({ size: '12' })} src="/avatar.png" alt="" />
          <span>John Doe</span>
        </div>
      )
    }
    ```

  </Tab>
  <Tab>
    ```jsx
    import { cva } from '../styled-system/css'

    const card = cva({
      base: { display: 'flex', gap: '4', rounded: 'md', bg: 'white' },
      variants: {
        size: { sm: { p: '2' }, md: { p: '4' } }
      },
      defaultVariants: { size: 'md' }
    })

    export function Card({ size }) {
      return <div className={card({ size })}>John Doe</div>
    }
    ```

  </Tab>
</Tabs>

## How it works

Panda runs two passes at build time, so the browser never computes styles:

1. **Codegen** reads your config and writes the `styled-system` package you import from.
2. **Extract** scans your source for those calls and emits only the CSS you used.

```
  panda.config.ts                 css({ color: 'blue.500' })
         │                                    │
         ▼                                    ▼
      codegen                              extract
         │                                    │
         ▼                                    ▼
  styled-system/                         styles.css
  (css, cva, …)                     .color_blue\.500 { … }
         │                                    │
         └────────────────┬───────────────────┘
                          ▼
                       browser
              class name string + static CSS
```

Values have to be visible in source. If a style only exists at runtime, see
[Dynamic Styles](/docs/styling/dynamic-styling). Folder details: [Styled System](/docs/reference/styled-system).

## The compiled output

Here is the whole trip for one component, with [source transforms](/docs/styling/source-transforms) on
(`transform: true` on the bundler plugin). The second and third tabs are the compiler's actual output for the first.

<Tabs items={['You write', 'Panda emits', 'Your bundle ships']}>
  <Tab>
    ```tsx filename="Card.tsx"
    import { css } from '../styled-system/css'

    export function Card() {
      return (
        <div
          className={css({
            display: 'flex',
            gap: '4',
            p: '4',
            rounded: 'md',
            bg: 'white',
            _hover: { bg: 'gray.50' }
          })}
        >
          <span className={css({ fontWeight: 'semibold', color: 'gray.900' })}>John Doe</span>
        </div>
      )
    }
    ```

  </Tab>
  <Tab>
    ```css filename="styles.css"
    @layer utilities {
      .bg_white {
        background: var(--colors-white);
      }
      .p_4 {
        padding: var(--spacing-4);
      }
      .bdr_md {
        border-radius: var(--radii-md);
      }
      .gap_4 {
        gap: var(--spacing-4);
      }
      .c_gray\.900 {
        color: var(--colors-gray-900);
      }
      .d_flex {
        display: flex;
      }
      .fw_semibold {
        font-weight: var(--font-weights-semibold);
      }
      .hover\:bg_gray\.50:is(:hover, [data-hover]) {
        background: var(--colors-gray-50);
      }
    }
    ```

  </Tab>
  <Tab>
    ```tsx filename="Card.js"
    // vite: pandacss({ transform: true })
    export function Card() {
      return (
        <div
          className={"bg_white bdr_md d_flex gap_4 p_4 hover:bg_gray.50"}
        >
          <span className={"c_gray.900 fw_semibold"}>John Doe</span>
        </div>
      )
    }
    ```

  </Tab>
</Tabs>

The stylesheet is a static file and the component is a string. The `css` import is gone because there was nothing
left for it to do, so no styling code reaches the browser.

Transforms are opt-in. Without them the CSS is the same, but the `css` call stays in the client bundle and a small
runtime joins the class names. Server components get the same result with no transform, since `css()` runs on the
server.

## What you get

- **Static analysis:** Panda parses your styles at build time and generates plain CSS files that work in any JavaScript
  framework.
- **Type safety:** Panda combines `csstype` with auto-generated typings, so CSS properties and design tokens are
  type-checked as you write them.
- **Performance:** styles compile down to atomic CSS ahead of time, so there's no runtime style engine shipped to the
  browser.
- **Developer experience:** recipes, patterns, design tokens, and JSX style props give you a consistent way to author
  styles without hand-rolling your own system.
- **Modern CSS:** generated styles use cascade layers, CSS variables, and modern selectors like `:where` and `:is`.

## Where to go next

Panda installs as a CLI tool, a PostCSS plugin, through a framework-specific guide, or inside Storybook.

<Cards>
  <Card
    arrow
    title="Installation"
    description="Pick the setup that matches your project, then write your first style"
    href="/docs/get-started/cli"
  />
  <Card
    arrow
    title="Tokens"
    description="Learn how setup and customize design tokens to customize your colors, typography, and more"
    href="/docs/theming/tokens"
  />
  <Card
    arrow
    title="Recipes"
    description="Create composable style variants that are typed and generates the atomic or layer recipe"
    href="/docs/recipes/overview"
  />
  <Card
    arrow
    title="Patterns"
    description="Use the built-in layout patterns like stack, flex, grid to speed up your development"
    href="/docs/styling/patterns"
  />
  <Card
    arrow
    title="Utilities"
    description="Learn how to create your own custom css properties and speed up your development"
    href="/docs/theming/utilities"
  />
</Cards>

## Playground

You can use the [online playground](https://play.panda-css.com) to get a taste of what Panda can do.

- See the live results of your JSX code
- Inspect what panda can extract using static analysis from your code
- Preview the statically generated `.css` files

## Acknowledgement

The development of Panda was only possible due to the inspiration and ideas from these amazing projects.

- [Chakra UI](https://chakra-ui.com/) - where it all started
- [Vanilla Extract](https://vanilla-extract.style/) - for inspiring the utilities API
- [Stitches](https://stitches.dev/) - for inspiring the recipes and variants API
- [Tailwind CSS](https://tailwindcss.com/) - for inspiring the JIT compiler and strategy
- [Class Variance Authority](https://cva.style/) - for inspiring the `cva` name
- [Styled System](https://styled-system.com/) - for the initial idea of Styled Props
- [Linaria](https://linaria.dev/) - for inspiring the initial atomic css strategy
- [Uno CSS](https://unocss.dev) - for inspiring the studio and astro integration


---

_This content is automatically generated from the official Panda CSS documentation._
