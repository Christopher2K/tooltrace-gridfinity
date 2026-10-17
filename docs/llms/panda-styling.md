# Panda CSS Styling

> This document contains all styling documentation for Panda CSS

## Table of Contents

- [Cascade Layers](#cascade-layers)
- [Color opacity modifier](#color-opacity-modifier)
- [Conditional Styles](#conditional-styles)
- [Dynamic styling](#dynamic-styling)
- [Extraction rules](#extraction-rules)
- [Value Fallbacks](#value-fallbacks)
- [Global Styles](#global-styles)
- [Keyframes](#keyframes)
- [Merging Styles](#merging-styles)
- [Optimization](#optimization)
- [Styling](#styling)
- [Layout Patterns](#layout-patterns)
- [Position Try](#position-try)
- [Responsive Design](#responsive-design)
- [Source Transforms](#source-transforms)
- [Static CSS Generation](#static-css-generation)
- [Style isolation](#style-isolation)
- [Style props](#style-props)
- [View Transitions](#view-transitions)
- [Virtual Color](#virtual-color)
- [Writing Styles](#writing-styles)

---


## Cascade Layers

CSS cascade layers refer to the order in which CSS rules are applied to an HTML element.

When multiple CSS rules apply
to the same element, the browser uses the cascade to determine which rule should take precedence. See the
[MDN article](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) to learn more.

Panda takes advantage of the cascade to provide a more efficient and flexible way to organize styles. This allows you to
define styles in a modular way, using CSS rules that are scoped to specific components or elements.

## Layer Types

Panda supports five types of cascade layers out of the box:

- `@layer reset` - The reset layer is used to reset the default styles of HTML elements. This is used when
  `preflight: true` is set in the config. You can also use this layer to add your own reset styles.

The generated CSS for the reset layer looks like this:

```css
@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  /* ... */
}
```

- `@layer base` - The base layer contains global styles defined in the `globalStyles` key in the config. You can also
  use this layer to add your own global styles.

The generated CSS for the base layer looks like this:

```css
@layer base {
  a {
    color: #000;
    text-decoration: none;
  }
  /* ... */
}
```

- `@layer recipes` - The recipes layer contains styles for recipes created within the config (aka config recipes). You
  can also use this layer to add your own component styles.

The generated CSS for the recipes layer looks like this:

```css
@layer recipes {
  .button {
    /* ... */
  }

  .button--variant-primary {
    /* ... */
  }
  /* ... */
}
```

- `@layer tokens` - The tokens layer contains css variables for tokens and semantic tokens. You can also use this layer
  to add your own design tokens.

The generated CSS for the tokens layer looks like this:

```css
@layer tokens {
  :root {
    --color-primary: #000;
    --color-secondary: #fff;
    --color-tertiary: #ccc;
    --shadow-sm: 0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  /* ... */
}
```

- `@layer utilities` - Styles that are scoped to a specific utility class. These styles are only applied to elements
  that have the utility class applied.

## Layer Order

The cascade layers are applied in the following order:

- `@layer utilities` (Highest priority)
- `@layer recipes`
- `@layer tokens`
- `@layer base`
- `@layer reset` (Lowest priority)

This means that styles defined in the `@layer utilities` will take precedence over styles defined in the
`@layer recipes`. This is useful when you want to override the default styles of a component.

## Layer CSS

The generated CSS in Panda is organized into layers. This allows you to define styles in a modular way, using CSS rules
that are scoped to specific components or elements.

Here's what the first line of the generated CSS looks like:

```css
@layer reset, base, tokens, recipes, utilities;
```

Adding this line to the top of your CSS file will determine the order in which the layers are applied. This is the most
exciting feature of CSS cascade layers.

## Customize layers

Panda lets you customize the cascade layers, so your project can coexist with other solutions. Learn more about customizing layers [here](/docs/reference/config#layers).

## Migrating alongside unlayered CSS

Per the CSS spec, **any unlayered rule beats every layered rule**, regardless of selector specificity or load
order. Most existing CSS is unlayered: plain stylesheets, most CSS-in-JS libraries. So while you migrate to Panda
one component at a time, your legacy styles win over Panda's by default. If a converted component still shows its
old styles, this is almost always why, not a specificity bug.

Two ways to fix it, depending on which side you want to win:

- **Let Panda's new styles win.** Turn on the [polyfill](#polyfills) below. Panda's CSS then competes as unlayered
  CSS against your legacy styles instead of automatically losing to them.
- **Keep legacy styles as the fallback.** Leave both as they are, and delete each component's legacy override once
  it's fully on Panda. Layering alone won't make Panda's version win.

If the other tool also ships its own `@layer` rules, the fix is different: rename Panda's layers with
[`layers`](/docs/reference/config#layers) so the names don't collide, then declare both tools' `@layer` statements
in one explicit order at the top of your CSS. That declaration, not import order, decides priority between two
layered sources.

## Polyfills

Need older browsers, or want unlayered CSS unable to override Panda? Turn on the built-in polyfill:

```js
export default defineConfig({
  // ...
  polyfill: true
})
```

Or pass `--polyfill` to `panda` / `panda cssgen`. Emit replaces `@layer` with `:not(#\#)` specificity boosts (same idea
as `@csstools/postcss-cascade-layers`). Keep `@layer reset, base, …;` in your entry CSS so PostCSS / Vite / webpack can
find the stylesheet root — hosts strip that Panda order line when polyfill is on.


---


## Color opacity modifier

Append /{opacity} to color tokens so Panda emits color-mix; omit it for plain token references.

Append `/{opacity}` to a color token, for example `red.300/40`, `{colors.black/50}`, or `red/half`. Panda emits
[`color-mix`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) only when the suffix is present;
plain values like `white` stay as token references. Works on color-connected utilities from `@pandacss/preset-base`:
`background`, `color`, `borderColor`, and others. Browsers without `color-mix` use the solid token.

## Examples

### Basic example

```ts
css({
  bg: 'red.300/40',
  color: 'white'
})
```

```css
@layer utilities {
  .bg_red\.300\/40 {
    --mix-background: color-mix(in srgb, var(--colors-red-300) 40%, transparent);
    background: var(--mix-background, var(--colors-red-300));
  }

  .text_white {
    color: var(--colors-white);
  }
}
```

### Using a custom property

For `--*` variables in `css()`, wrap the token path in curly braces and reference it with `var()`:

```ts
css({
  '--overlay': '{colors.black/50}',
  bg: 'var(--overlay)'
})
```

```ts
// ❌ Not resolved
'--overlay': 'colors.black/50'

// ✅ Resolved to color-mix
'--overlay': '{colors.black/50}'
```

### Usage with virtual colors

Opacity modifiers work on [virtual colors](/docs/styling/virtual-color) in any color property:

```ts
css({
  colorPalette: 'blue',
  bg: 'colorPalette.500/50'
})
```

To use one inside another value, like a shadow or a gradient, store it in a CSS variable:

```ts
css({
  colorPalette: 'blue',
  '--ring': '{colors.colorPalette.500/50}',
  boxShadow: '0 0 0 2px var(--ring)'
})
```

## Usage in custom utilities

Support `{color}/{opacity}` on your own utilities through the `colorMix` helper on `utils`:

```ts
export default defineConfig({
  utilities: {
    background: {
      shorthand: 'bg',
      className: 'bg',
      values: 'colors',
      transform(value, args) {
        const mix = args.utils.colorMix(value)
        if (mix.invalid) return { background: value }

        return {
          background: mix.value
        }
      }
    }
  }
})
```

### Using createColorMixTransform

```ts
import type { PropertyTransform } from '@pandacss/types'

export const createColorMixTransform =
  (prop: string): PropertyTransform =>
  (value, args) => {
    const mix = args.utils.colorMix(value)
    if (mix.invalid) return { [prop]: value }
    const cssVar = '--mix-' + prop
    return {
      [cssVar]: mix.value,
      [prop]: `var(${cssVar}, ${mix.color})`
    }
  }
```

```ts
export default defineConfig({
  utilities: {
    background: {
      shorthand: 'bg',
      className: 'bg',
      values: 'colors',
      transform: createColorMixTransform('background')
    }
  }
})
```


---


## Conditional Styles

Learn how to use conditional and responsive styles in Panda.

When writing styles, you might need to apply specific changes depending on a specific condition, whether it's based on
breakpoint, css pseudo state, media query or custom data attributes.

Panda allows you to write conditional styles, and provides common condition shortcuts to make your life easier. Let's
say you want to change the background color of a button when it's hovered. You can do it like this:

```jsx
<button
  className={css({
    bg: 'red.500',
    _hover: { bg: 'red.700' }
  })}
>
  Hover me
</button>
```

## Overview

### Property based condition

This works great, but might be a bit verbose. You can apply the condition `_hover` directly to the `bg` property,
leading to a more concise syntax:

```diff
<button
  className={css({
-   bg: 'red.500',
-   _hover: { bg: 'red.700' }
+   bg: { base: 'red.500', _hover: 'red.700' }
  })}
>
  Hover me
</button>
```

> Note: The `base` key is used to define the default value of the property, without any condition.

### Nested condition

Conditions in Panda can be nested, which means you can apply multiple conditions to a single property or another
condition.

Let's say you want to change the background color of a button when it's focused and hovered. You can do it like this:

```jsx
<button
  className={css({
    bg: { base: 'red.500', _hover: { _focus: 'red.700' } }
  })}
>
  Hover me
</button>
```

### Built-in conditions

Panda includes a set of common pseudo states that you can use to style your components:

- Pseudo Class: `_hover`, `_active`, `_focus`, `_focusVisible`, `_focusWithin`, `_disabled`
- Pseudo Element: `_before`, `_after`
- Media Query: `sm`, `md`, `lg`, `xl`, `2xl`
- Data Attribute Selector: `_horizontal`, `_vertical`, `_portrait`, `_landscape`

## Arbitrary selectors

What if you need a one-off selector that is not defined in your config's conditions? You can use the `css` function to
generate classes for arbitrary selectors:

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return (
    <div
      className={css({
        '&[data-state=closed]': { color: 'red.300' },
        '& > *': { margin: '2' }
      })}
    />
  )
}
```

This also works with the supported at-rules (`@media`, `@layer`, `@container`, `@supports`, and `@page`):

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return (
    <div className={css({ display: 'flex', containerType: 'size' })}>
      <div
        className={css({
          '@media (min-width: 768px)': {
            color: 'red.300'
          },
          '@container (min-width: 10px)': {
            color: 'green.300'
          },
          '@supports (display: flex)': {
            fontSize: '3xl',
            color: 'blue.300'
          }
        })}
      />
    </div>
  )
}
```

## Pseudo Classes

### Hover, Active, Focus, and Disabled

You can style the hover, active, focus, and disabled states of an element using their `_` modifier:

```jsx
<button
  className={css({
    bg: 'red.500',
    _hover: { bg: 'red.700' },
    _active: { bg: 'red.900' }
  })}
>
  Hover me
</button>
```

### First, Last, Odd, Even

You can style the first, last, odd, and even elements of a group using their `_` modifier:

```jsx
<ul>
  {items.map(item => (
    <li key={item} className={css({ _first: { color: 'red.500' } })}>
      {item}
    </li>
  ))}
</ul>
```

You can also style even and odd elements using the `_even` and `_odd` modifier:

```jsx
<table>
  <tbody>
    {items.map(item => (
      <tr
        key={item}
        className={css({
          _even: { bg: 'gray.100' },
          _odd: { bg: 'white' }
        })}
      >
        <td>{item}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Pseudo Elements

### Before and After

You can style the `::before` and `::after` pseudo elements of an element using their `_before` and `_after` modifier:

```jsx
<div
  className={css({
    _before: { content: '"👋"' }
  })}
>
  Hello
</div>
```

#### Notes

- **Before and After**: Ensure you wrap the content value in double quotes.
- **Mixing with Conditions**: When using condition and pseudo elements, prefer to place the condition **before** the
  pseudo element.

```jsx
css({
  // This works ✅
  _dark: { _backdrop: { color: 'red' } }
  // This doesn't work ❌
  _backdrop: { _dark: { color: 'red' } }
})
```

The reason `_backdrop: { _dark: { color: 'red' } }` doesn't work is because it generated an invalid CSS structure that
looks like:

```css
&::backdrop {
  &.dark,
  .dark & {
    color: red;
  }
}
```

### Placeholder

Style the placeholder text of any input or textarea using the `_placeholder` modifier:

```jsx
<input
  placeholder="Enter your name"
  className={css({
    _placeholder: { color: 'gray.500' }
  })}
/>
```

### File Inputs

Style the file input button using the `_file` modifier:

```jsx
<input
  type="file"
  className={css({
    _file: { bg: 'gray.500', px: '4', py: '2', marginEnd: '3' }
  })}
/>
```

## Media Queries

### Reduced Motion

Use the `_motionReduce` and `_motionSafe` modifiers to style an element based on the user's motion preference:

```jsx
<div
  className={css({
    _motionReduce: { transition: 'none' },
    _motionSafe: { transition: 'all 0.3s' }
  })}
>
  Hello
</div>
```

### Color Scheme

The `prefers-color-scheme` media feature is used to detect if the user has requested the system use a light or dark
color theme.

Use the `_osLight` and `_osDark` modifiers to style an element based on the user's color scheme preference:

```jsx
<div
  className={css({
    bg: 'white',
    _osDark: { bg: 'black' }
  })}
>
  Hello
</div>
```

Let's say your app is dark by default, but you want to allow users to switch to a light theme. You can do it like this:

```jsx
<div
  className={css({
    bg: 'black',
    _osLight: { bg: 'white' }
  })}
>
  Hello
</div>
```

### Color Contrast

The `prefers-contrast` media feature is used to detect if the user has requested the system use a high or low contrast
theme.

Use the `_highContrast` and `_lessContrast` modifiers to style an element based on the user's color contrast preference:

```jsx
<div
  className={css({
    bg: 'white',
    _highContrast: { bg: 'black' }
  })}
>
  Hello
</div>
```

### Orientation

The `orientation` media feature is used to detect if the user has a device in portrait or landscape mode.

Use the `_portrait` and `_landscape` modifiers to style an element based on the user's device orientation:

```jsx
<div
  className={css({
    pb: '4',
    _portrait: { pb: '8' }
  })}
>
  Hello
</div>
```

## Group Selectors

When you need to style an element based on its parent element's state or attribute, you can add the `group` class to the
parent element, and use any of the `_group*` modifiers on the child element.

```jsx
<div className="group">
  <p className={css({ _groupHover: { bg: 'red.500' } })}>Hover me</p>
</div>
```

This modifer for every pseudo class modifiers like `_groupHover`, `_groupActive`, `_groupFocus`, and `_groupDisabled`,
etc.

## Sibling Selectors

When you need to style an element based on its sibling element's state or attribute, you can add the `peer` class to the
sibling element, and use any of the `_peer*` modifiers on the target element.

```jsx
<div>
  <p className="peer">Hover me</p>
  <p className={css({ _peerHover: { bg: 'red.500' } })}>I'll change by bg</p>
</div>
```

> Note: This only works for when the element marked with `peer` is a previous siblings, that is, it comes before the
> element you want to start.

## Data Attribute

### LTR and RTL

You can style an element based on the direction of the text using the `_ltr` and `_rtl` modifiers:

```jsx
<div dir="ltr">
  <div
    className={css({
      _ltr: { ml: '3' },
      _rtl: { mr: '3' }
    })}
  >
    Hello
  </div>
</div>
```

For this to work, you need to set the `dir` attribute on the parent element. In most cases,you can set this on the
`html` element.

> **Note:** Consider using logical css properties like `marginInlineStart` and `marginInlineEnd` instead their physical
> counterparts like `marginLeft` and `marginRight`. This will reduce the need to use the `_ltr` and `_rtl` modifiers.

### State

You can style an element based on its `data-{state}` attribute using the corresponding `_{state}` modifier:

```jsx
<div
  data-loading
  className={css({
    _loading: { bg: 'gray.500' }
  })}
>
  Hello
</div>
```

This also works for common states like `data-active`, `data-disabled`, `data-focus`, `data-hover`, `data-invalid`,
`data-required`, and `data-valid`.

```jsx
<div
  data-active
  className={css({
    _active: { bg: 'gray.500' }
  })}
>
  Hello
</div>
```

> Most of the `data-{state}` attributes typically mirror the corresponding browser pseudo class. For example,
> `data-hover` is equivalent to `:hover`, `data-focus` is equivalent to `:focus`, and `data-active` is equivalent to
> `:active`.

### Orientation

You can style an element based on its `data-orientation` attribute using the `_horizontal` and `_vertical` modifiers:

```jsx
<div
  data-orientation="horizontal"
  className={css({
    _horizontal: { bg: 'red.500' },
    _vertical: { bg: 'blue.500' }
  })}
>
  Hello
</div>
```

## ARIA Attribute

You can style an element based on its `aria-{state}=true` attribute using the corresponding `_{state}` modifier:

```jsx
<div
  aria-expanded="true"
  className={css({
    _expanded: { bg: 'gray.500' }
  })}
>
  Hello
</div>
```

> Most of the `aria-{state}` attributes typically mirror the support ARIA states in the browser pseudo class. For
> example, `aria-checked=true` is styled with `_checked`, `aria-disabled=true` is styled with `_disabled`.

## Container queries

You can define container names and sizes in your theme configuration and use them in your styles.

```ts
export default defineConfig({
  // ...
  theme: {
    extend: {
      containerNames: ['sidebar', 'content'],
      containers: {
        xs: '40em',
        sm: '60em',
        md: '80em'
      }
    }
  }
})
```

The default container sizes in the `@pandacss/preset-panda` preset are shown below:

```ts
export const containers = {
  xs: '320px',
  sm: '384px',
  md: '448px',
  lg: '512px',
  xl: '576px',
  '2xl': '672px',
  '3xl': '768px',
  '4xl': '896px',
  '5xl': '1024px',
  '6xl': '1152px',
  '7xl': '1280px',
  '8xl': '1440px'
}
```

Then use them in your styles by referencing using `@<container-name>/<container-size>` syntax:

> The default container syntax is `@/<container-size>`.

```ts
import { css } from '/styled-system/css'

function Demo() {
  return (
    <nav className={css({ containerType: 'inline-size' })}>
      <div
        className={css({
          fontSize: { '@/sm': 'md' }
        })}
      />
    </nav>
  )
}
```

This will generate the following CSS:

```css
.cq-type_inline-size {
  container-type: inline-size;
}

@container (min-width: 60em) {
  .\@\/sm:fs_md {
    container-type: inline-size;
  }
}
```

You can also named container queries:

```ts
import { cq } from 'styled-system/patterns'

function Demo() {
  return (
    <nav className={cq({ name: 'sidebar' })}>
      <div
        className={css({
          fontSize: { base: 'lg', '@sidebar/sm': 'md' }
        })}
      />
    </nav>
  )
}
```

## Reference

Here's a list of all the condition shortcuts you can use in Panda:

| Condition name         | Selector                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------|
| \_hover                | `&:is(:hover, [data-hover])`                                                                     |
| \_focus                | `&:is(:focus, [data-focus])`                                                                     |
| \_focusWithin          | `&:focus-within`                                                                                 |
| \_focusVisible         | `&:is(:focus-visible, [data-focus-visible])`                                                     |
| \_disabled             | `&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])`                             |
| \_active               | `&:is(:active, [data-active])`                                                                   |
| \_visited              | `&:visited`                                                                                      |
| \_target               | `&:target`                                                                                       |
| \_readOnly             | `&:is(:read-only, [data-read-only], [aria-readonly=true])`                                       |
| \_readWrite            | `&:read-write`                                                                                   |
| \_empty                | `&:is(:empty, [data-empty])`                                                                     |
| \_checked              | `&:is(:checked, [data-checked], [aria-checked=true], [data-state="checked"])`                    |
| \_enabled              | `&:enabled`                                                                                      |
| \_expanded             | `&:is([aria-expanded=true], [data-expanded], [data-state="expanded"])`                           |
| \_highlighted          | `&[data-highlighted]`                                                                            |
| \_complete             | `&[data-complete]`                                                                               |
| \_incomplete           | `&[data-incomplete]`                                                                             |
| \_dragging             | `&[data-dragging]`                                                                               |
| \_before               | `&::before`                                                                                      |
| \_after                | `&::after`                                                                                       |
| \_firstLetter          | `&::first-letter`                                                                                |
| \_firstLine            | `&::first-line`                                                                                  |
| \_marker               | `&::marker, &::-webkit-details-marker`                                                           |
| \_selection            | `&::selection`                                                                                   |
| \_file                 | `&::file-selector-button`                                                                        |
| \_backdrop             | `&::backdrop`                                                                                    |
| \_first                | `&:first-child`                                                                                  |
| \_last                 | `&:last-child`                                                                                   |
| \_only                 | `&:only-child`                                                                                   |
| \_even                 | `&:nth-child(even)`                                                                              |
| \_odd                  | `&:nth-child(odd)`                                                                               |
| \_firstOfType          | `&:first-of-type`                                                                                |
| \_lastOfType           | `&:last-of-type`                                                                                 |
| \_onlyOfType           | `&:only-of-type`                                                                                 |
| \_peerFocus            | `.peer:is(:focus, [data-focus]) ~ &`                                                             |
| \_peerHover            | `.peer:is(:hover, [data-hover]) ~ &`                                                             |
| \_peerActive           | `.peer:is(:active, [data-active]) ~ &`                                                           |
| \_peerFocusWithin      | `.peer:focus-within ~ &`                                                                         |
| \_peerFocusVisible     | `.peer:is(:focus-visible, [data-focus-visible]) ~ &`                                             |
| \_peerDisabled         | `.peer:is(:disabled, [disabled], [data-disabled], [aria-disabled=true]) ~ &`                     |
| \_peerChecked          | `.peer:is(:checked, [data-checked], [aria-checked=true], [data-state="checked"]) ~ &`            |
| \_peerInvalid          | `.peer:is(:invalid, [data-invalid], [aria-invalid=true]) ~ &`                                    |
| \_peerExpanded         | `.peer:is([aria-expanded=true], [data-expanded], [data-state="expanded"]) ~ &`                   |
| \_peerPlaceholderShown | `.peer:placeholder-shown ~ &`                                                                    |
| \_groupFocus           | `.group:is(:focus, [data-focus]) &`                                                              |
| \_groupHover           | `.group:is(:hover, [data-hover]) &`                                                              |
| \_groupActive          | `.group:is(:active, [data-active]) &`                                                            |
| \_groupFocusWithin     | `.group:focus-within &`                                                                          |
| \_groupFocusVisible    | `.group:is(:focus-visible, [data-focus-visible]) &`                                              |
| \_groupDisabled        | `.group:is(:disabled, [disabled], [data-disabled], [aria-disabled=true]) &`                      |
| \_groupChecked         | `.group:is(:checked, [data-checked], [aria-checked=true], [data-state="checked"]) &`             |
| \_groupExpanded        | `.group:is([aria-expanded=true], [data-expanded], [data-state="expanded"]) &`                    |
| \_groupInvalid         | `.group:is(:invalid, [data-invalid], [aria-invalid=true]) &`                                     |
| \_indeterminate        | `&:is(:indeterminate, [data-indeterminate], [aria-checked=mixed], [data-state="indeterminate"])` |
| \_required             | `&:is(:required, [data-required], [aria-required=true])`                                         |
| \_valid                | `&:is(:valid, [data-valid])`                                                                     |
| \_invalid              | `&:is(:invalid, [data-invalid], [aria-invalid=true])`                                            |
| \_userValid            | `&:is(:user-valid, [data-user-valid])`                                                           |
| \_userInvalid          | `&:is(:user-invalid, [data-user-invalid])`                                                       |
| \_autofill             | `&:autofill`                                                                                     |
| \_inRange              | `&:is(:in-range, [data-in-range])`                                                               |
| \_outOfRange           | `&:is(:out-of-range, [data-outside-range])`                                                      |
| \_placeholder          | `&::placeholder, &[data-placeholder]`                                                            |
| \_placeholderShown     | `&:is(:placeholder-shown, [data-placeholder-shown])`                                             |
| \_pressed              | `&:is([aria-pressed=true], [data-pressed])`                                                      |
| \_selected             | `&:is([aria-selected=true], [data-selected])`                                                    |
| \_grabbed              | `&:is([aria-grabbed=true], [data-grabbed])`                                                      |
| \_underValue           | `&[data-state=under-value]`                                                                      |
| \_overValue            | `&[data-state=over-value]`                                                                       |
| \_atValue              | `&[data-state=at-value]`                                                                         |
| \_default              | `&:default`                                                                                      |
| \_optional             | `&:optional`                                                                                     |
| \_open                 | `&:is([open], [data-open], [data-state="open"], :popover-open)`                                  |
| \_closed               | `&:is([closed], [data-closed], [data-state="closed"])`                                           |
| \_fullscreen           | `&:is(:fullscreen, [data-fullscreen])`                                                           |
| \_loading              | `&:is([data-loading], [aria-busy=true])`                                                         |
| \_hidden               | `&:is([hidden], [data-hidden])`                                                                  |
| \_inert                | `&:is([inert], [data-inert])`                                                                    |
| \_current              | `&:is([aria-current=true], [data-current])`                                                      |
| \_currentPage          | `&[aria-current=page]`                                                                           |
| \_currentStep          | `&[aria-current=step]`                                                                           |
| \_today                | `&[data-today]`                                                                                  |
| \_unavailable          | `&[data-unavailable]`                                                                            |
| \_rangeStart           | `&[data-range-start]`                                                                            |
| \_rangeEnd             | `&[data-range-end]`                                                                              |
| \_now                  | `&[data-now]`                                                                                    |
| \_topmost              | `&[data-topmost]`                                                                                |
| \_motionReduce         | `@media (prefers-reduced-motion: reduce)`                                                        |
| \_motionSafe           | `@media (prefers-reduced-motion: no-preference)`                                                 |
| \_print                | `@media print`                                                                                   |
| \_landscape            | `@media (orientation: landscape)`                                                                |
| \_portrait             | `@media (orientation: portrait)`                                                                 |
| \_dark                 | `.dark &`                                                                                        |
| \_light                | `.light &`                                                                                       |
| \_osDark               | `@media (prefers-color-scheme: dark)`                                                            |
| \_osLight              | `@media (prefers-color-scheme: light)`                                                           |
| \_highContrast         | `@media (forced-colors: active)`                                                                 |
| \_lessContrast         | `@media (prefers-contrast: less)`                                                                |
| \_moreContrast         | `@media (prefers-contrast: more)`                                                                |
| \_ltr                  | `:where([dir=ltr], :dir(ltr)) &`                                                                 |
| \_rtl                  | `:where([dir=rtl], :dir(rtl)) &`                                                                 |
| \_scrollbar            | `&::-webkit-scrollbar`                                                                           |
| \_scrollbarThumb       | `&::-webkit-scrollbar-thumb`                                                                     |
| \_scrollbarTrack       | `&::-webkit-scrollbar-track`                                                                     |
| \_horizontal           | `&[data-orientation=horizontal]`                                                                 |
| \_vertical             | `&[data-orientation=vertical]`                                                                   |
| \_icon                 | `& :where(svg)`                                                                                  |
| \_starting             | `@starting-style`                                                                                |
| \_noscript             | `@media (scripting: none)`                                                                       |
| \_invertedColors       | `@media (inverted-colors: inverted)`                                                             |
| \_pointerFine          | `@media (pointer: fine)`                                                                         |
| \_pointerCoarse        | `@media (pointer: coarse)`                                                                       |
| \_pointerNone          | `@media (pointer: none)`                                                                         |
| \_anyPointerFine       | `@media (any-pointer: fine)`                                                                     |
| \_anyPointerCoarse     | `@media (any-pointer: coarse)`                                                                   |
| \_anyPointerNone       | `@media (any-pointer: none)`                                                                     |

## Custom conditions

Panda lets you create your own conditions, so you're not limited to the ones in the default preset. Learn more about
customizing conditions [here](/docs/theming/conditions).


---


## Dynamic styling

How to manage dynamic styling in Panda

While Panda is mainly focused on the statically analyzable styles, you might need to handle dynamic styles in your
project.

> We recommend that you **avoid relying on runtime values for your styles** . Consider using recipes, css variables or
> `data-*` attributes instead.

Here are some ways you can handle dynamic styles in Panda:

## Runtime values

Using a value that is not statically analyzable at build-time will not work in Panda due to the inability to determine
the style values.

```tsx filename="App.tsx"
import { useState } from 'react'
import { css } from '../styled-system/css'

const App = () => {
  const [color, setColor] = useState('red.300')

  return (
    <div
      className={css({
        // ❌ Avoid: Panda can't determine the value of color at build-time
        color
      })}
    />
  )
}
```

The example above will not work because Panda can't determine the value of `color` at build-time. Here are some ways to
fix this:

### Using Static CSS

Panda supports a [`staticCss`](/docs/styling/static) option in the config you can use to pre-generate some styles ahead
of time.

```tsx filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  staticCss: {
    css: [
      {
        properties: {
          // ✅ Good: Pre-generate the styles for the color
          color: ['red.300']
        }
      }
    ]
  }
})
```

```tsx filename="Button.tsx"
import { useState } from 'react'
import { styled } from '../styled-system/jsx'

export const Button = () => {
  const [color, setColor] = useState('red.300')

  // ✅ Good: This will work because `red.300` is pre-generated using `staticCss` config
  return <styled.button color={color} />
}
```

### Using `token()`

The `token()` function is generated by Panda and contains an object of all tokens by dot-path, allowing you to query for
token's raw value at runtime.

```tsx filename="App.tsx"
import { useState } from 'react'
import { css } from '../styled-system/css'
import { token } from '../styled-system/tokens'

const Component = props => {
  return (
    <div
      className={css({
        // ✅ Good: Store the value in a CSS custom property
        color: 'var(--color)'
      })}
      style={{
        // ✅ Good: Handle the runtime value in the style attribute
        '--color': token(`colors.${props.color}`)
      }}
    >
      Dynamic color with runtime value
    </div>
  )
}

// App.tsx
const App = () => {
  const [runtimeColor, setRuntimeColor] = useState('pink.300')

  return <Component color={runtimeColor} />
}
```

### Using `token.var()`

You could also directly use the `token.var()` function to get a reference to the underlying CSS custom property for a
given token:

```tsx filename="App.tsx"
import { useState } from 'react'
import { token } from '../styled-system/tokens'

const Component = props => {
  return (
    <div
      style={{
        // ✅ Good: Dynamically generate CSS custom property from the token
        color: token.var(`colors.${props.color}`)
      }}
    >
      Dynamic color with runtime value
    </div>
  )
}

const App = () => {
  const [runtimeColor, setRuntimeColor] = useState('yellow.300')

  return <Component color={runtimeColor} />
}
```

## JSX Style Props

Panda supports forwarding JSX style properties to any element in your codebase.

For example, let's say we create a Card component that accepts a `color` prop:

```tsx filename="Card.tsx"
import { styled } from '../styled-system/jsx'

const Card = props => {
  return <styled.div px="4" py="3" {...props} />
}
```

Then you add more style props to the Card component in a different file:

```tsx filename="App.tsx"
const App = () => {
  return (
    <Card color="blue.300">
      <p>Some content</p>
    </Card>
  )
}
```

As long as all prop-value pairs are statically extractable, Panda will automatically generate the CSS, so avoid using
runtime values:

```tsx filename="App.tsx"
import { useState } from 'react'

const App = () => {
  const [color, setColor] = useState('blue.300')

  // ❌ Avoid: Panda can't determine the value of color at build-time
  return (
    <Card color={color}>
      <p>Some content</p>
    </Card>
  )
}
```

## Property names

Extract reads the prop as written. A rename like `circleSize` to `size` does not emit CSS. Same for a custom name like
`elementWidth`. See [Extraction rules](/docs/styling/extraction-rules).

## Marking objects with raw()

`{fn}.raw()` returns a plain style object and marks it for the compiler to extract.

It can be useful, for example, in Storybook args or custom react props.

```tsx filename="App.tsx"
// mark the object as valid css for the extractor
<Button rootProps={css.raw({ bg: 'red.400' })} />
```

```tsx
export const Funky: Story = {
  // mark this as a button recipe usage
  args: button.raw({
    visual: 'funky',
    shape: 'circle',
    size: 'sm'
  })
}
```

### Enhanced `css.raw` spreading

> **Added in v1.6.1**

You can also spread `css.raw` objects within nested selectors and conditions for better style composition:

```tsx filename="App.tsx"
import { css } from '../styled-system/css'

const baseStyles = css.raw({ margin: 0, padding: 0 })
const interactive = css.raw({ cursor: 'pointer', transition: 'all 0.2s' })

const component = css({
  // Spreading in child selectors
  '& p': { ...baseStyles, fontSize: '1rem' },

  // Spreading in nested conditions
  _hover: {
    ...interactive,
    _dark: { ...interactive, color: 'white' }
  }
})
```

## Static expressions

Panda supports static expressions in your styles, as long as they are statically analyzable.

### Static Composition

You can compose different style objects together using the `css.raw()` function.

```tsx filename="App.tsx"
import { css } from 'styled-system/css'

const paragraphSpacingStyle = css.raw({
  '& p': { marginBlockEnd: '1em' }
})

export const proseCss = css.raw({
  '& h1': paragraphSpacingStyle
})
```

This will result in the following CSS:

```css
/* ... */
@layer utilities {
  .\[\&_p\]\:mb_1em p,
  .\[\&_h1\]\:\[\&_p\]\:mb_1em h1 p {
    margin-block-end: 1em;
  }
}
```

### Supported expressions

Panda resolves an expression when every value it depends on is known at build time.

#### Literals and arithmetic

```ts
import { css } from '../styled-system/css'

const unit = 4

css({ padding: `${unit * 2}px`, opacity: unit > 2 ? 1 : 0.5 })
```

#### Constants and destructuring

```ts
import { css } from '../styled-system/css'

const colors = { text: 'gray.900', muted: 'gray.500' } as const
const { muted } = colors

css({ color: colors.text, borderColor: muted })
```

#### Spreads and computed keys

```ts
import { css } from '../styled-system/css'

const base = { display: 'flex', gap: '2' }
const state = 'hover'

css({ ...base, [`&:${state}`]: { gap: '3' } })
```

#### Enums and `satisfies`

```ts
import { css } from '../styled-system/css'

enum Size {
  Small = '8px',
  Large = '16px'
}
const card = { padding: Size.Large } satisfies { padding: string }

css({ ...card, margin: Size.Small })
```

#### Imports from other files

```ts filename="theme.ts"
export const brand = { primary: 'red.500' }
export const spacing = (step: number) => `${step * 4}px`
```

```ts filename="button.ts"
import { css } from '../styled-system/css'
import { brand, spacing } from './theme'

css({ bg: brand?.primary, paddingInline: spacing(3) })
```

#### Tokens and raw styles

```ts
import { css } from '../styled-system/css'
import { token } from '../styled-system/tokens'

const focus = css.raw({ outlineWidth: '2px' })

css({ ...focus, boxShadow: `0 0 0 1px ${token('colors.blue.500')}` })
```

#### Default values

Panda generates the CSS for a parameter's default value, including destructured props:

```tsx
import { css } from '../styled-system/css'

function Button({ size = 'md' }: { size?: string }) {
  return <button className={css({ fontSize: size })} />
}
```

A value passed by the caller isn't known at build time. Use [recipes](/docs/recipes/overview) or
[`staticCss`](/docs/styling/static) to generate CSS for the other values.

#### Helper functions

A helper can destructure its parameters, declare local `const` or `let` values before its `return`, spread objects, and
call other helpers:

```ts
import { css } from '../styled-system/css'

const rule = (color: string) => ({ color })

function card({ tone, size = 'md' }: { tone: string; size?: string }) {
  const border = `1px solid ${tone}`
  return { border, fontSize: size, ...rule(tone), '& .badge': rule(`${tone}.700`) }
}

css(card({ tone: 'red' }))
```

### Unsupported expressions

Panda does not run a JavaScript interpreter, so it only evaluates helpers made of `const` / `let` declarations and one
`return`. When a helper can't be evaluated, its styles aren't extracted and Panda warns with `pure_helper_unevaluated`.
The rest of the style object still works.

#### Control flow

`if` statements, loops, and more than one `return` aren't evaluated. Use a ternary instead:

```ts
// ❌
function card(tone: string) {
  if (!tone) return {}
  return { color: tone }
}

// ✅
const card = (tone: string) => (tone ? { color: tone } : {})
```

#### Rest and array patterns

Destructuring with `...rest` or an array pattern isn't evaluated. Name each value instead:

```ts
// ❌
const badge = ({ tone, ...rest }: { tone: string; size: string }) => ({ color: tone, fontSize: rest.size })

// ✅
const badge = ({ tone, size }: { tone: string; size: string }) => ({ color: tone, fontSize: size })
```

#### Built-in functions

Calls to built-ins such as `Object.entries`, `Object.fromEntries`, `Array.prototype.map`, and `Math.max` aren't
evaluated. Write the styles out instead:

```ts
import { cva } from '../styled-system/css'

// ❌
const sizes = (keys: string[]) => Object.fromEntries(keys.map(key => [key, { paddingX: key }]))
const recipe = cva({ variants: { size: sizes(['1', '2']) } })

// ✅
const recipe = cva({
  variants: {
    size: {
      sm: { paddingX: '1' },
      md: { paddingX: '2' }
    }
  }
})
```

This limit applies to styles in your source files. Your `panda.config.ts` runs in Node, so you can still use built-ins
there to construct configuration values.

## Runtime conditions

Even though we recommend that you first look for better alternatives (such as using
[recipe variants](/docs/recipes/atomic-recipe)), you may still occasionally need runtime conditions.

When encountering a runtime condition, Panda will first try to resolve it statically. If it can't, it will fallback to
the generating the corresponding CSS for each possible branches.

```tsx
import { useState } from 'react'
import { css } from '../styled-system/css'
import { Stack } from '../styled-system/jsx'

const App = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Stack
      color={isHovered ? { _hover: 'red.100' } : 'red.200'}
      _hover={{
        color: { base: 'red.300', md: isHovered ? 'red.400' : undefined }
      }}
    >
      <div className={css({ color: isHovered ? 'red.500' : 'red.600' })} />
    </Stack>
  )
}
```

Since none of the conditions above are statically extractable, Panda will generate css for all possible code path,
resulting in a css that looks like this:

```css
/* ... */
@layer utilities {
  .hover\:text_red\.100:where(:hover, [data-hover]) {
    color: var(--colors-red-100);
  }

  .text_red\.200 {
    color: var(--colors-red-200);
  }

  .hover\:text_red\.300:where(:hover, [data-hover]) {
    color: var(--colors-red-300);
  }

  @media (width >= 48rem) {
    .hover\:md\:text_red\.400:where(:hover, [data-hover]) {
      color: var(--colors-red-400);
    }
  }

  .text_red\.500 {
    color: var(--colors-red-500);
  }

  .text_red\.600 {
    color: var(--colors-red-600);
  }
}
/* ... */
```

## Referenced values

Although you should have your styles inlined most of the time, maybe you want to store a value in a variable and re-use
in multiple places. This should be fine as long as you keep it statically analyzable.

Panda v2 can resolve named imports of static values from other files, including values passed through re-exports. The
imported value must still be statically analyzable:

```ts filename="theme.ts"
export const brand = 'red.300'
export const colorName = 'primary'
```

```ts filename="App.tsx"
import { css } from '../styled-system/css'
import { brand, colorName } from './theme'

const colors = { primary: 'red.300', secondary: 'blue.300' }

const className = css({
  borderColor: brand,
  color: colors[colorName]
})
```

Avoid values supplied by React state, component props, or functions that need runtime data. Being imported from another
file does not make a runtime value extractable.

```tsx
import { css } from '../styled-system/css'

// ✅ Good: All values are statically extractable
const mainColor = 'red.300'
const sizes = { sm: '12px', md: '16px', '2xl': '42px' }

const App = () => {
  return (
    <div
      className={css({
        color: mainColor,
        fontSize: sizes.md,
        width: sizes['2xl']
      })}
    />
  )
}
```

### Runtime reference on known objects

Using a more complex but still common example :

```tsx
import { useState } from 'react'
import { css } from '../styled-system/css'

const colorByType = {
  primary: 'red.300',
  secondary: 'blue.300',
  tertiary: 'green.300'
}

const Section = () => {
  const [type, setType] = useState('primary')

  // ❌ Avoid: since only "gray.100" is statically extractable here
  // This will not work as expected, the color CSS won't be generated
  return <section className={css({ color: colorByType[type] ?? 'gray.100' })}>❌ Will not be extracted</section>
}
```

Even though `colorByType` is statically analyzable, Panda does not _yet_ support this kind of automatic extraction
fallback. This is the perfect opportunity to use the [recipes](/docs/recipes/atomic-recipe).

```tsx
import { useState } from 'react'
import { cva } from '../styled-system/css'

const sectionRecipe = cva({
  base: { color: 'gray.100' },
  variants: {
    type: {
      primary: { color: 'red.300' },
      secondary: { color: 'blue.300' },
      tertiary: { color: 'green.300' }
    }
  }
})

const Section = () => {
  const [type, setType] = useState('primary')

  // ✅ Good: This will work as expected
  return <section className={sectionRecipe({ type })}>✅ With a recipe</section>
}
```

Not only did you get the same end result, but you also got a more readable and maintainable code !

You can now :

- add more variants to your recipe
- add more properties
- use a shorthand or a condition

All of this with complete type-safety and without having to make drastic changes to the component.

> Note that you can also [integrate this recipe directly into your theme](/docs/recipes/config-recipe) if you want to
> only generate the CSS that you use, among other things

## Config recipes

Config recipes only emit CSS for variants Panda can statically analyze. `button({ size })` works at runtime, but you'll
only get `defaultVariants` in the stylesheet unless you add [`staticCss`](/docs/styling/static#recipes) or use string
literals in the call.

See [Dynamic variants](/docs/recipes/dynamic-variants).

## Summary

### What you can do

```tsx
// ✅ Good: Conditional styles
<styled.div color={{ base: "red.100", md: "red.200" }} />

// ✅ Good: Arbitrary value
<styled.div color="#121qsd" />

// ✅ Good: Arbitrary selector
<styled.div css={{ "&[data-thing] > span": { color: "red.100" } }} />

// ✅ Good: Runtime value (with config.`staticCss`)
const Button = () => {
  const [color, setColor] = useState('red.300')
  return <styled.button color={color} />
}

// ✅ Good: Runtime condition
<styled.div color={{ base: "red.100", md: isHovered ? "red.200" : "red.300" }} />

// ✅ Good: Referenced value
<styled.div color={mainColor} />

// ✅ Good: Imported static value (brand is a named constant from another file)
<styled.div color={brand} />

```

### What you can't do

```tsx
// ❌ Avoid: Runtime value (without config.`staticCss`)
const Button = () => {
  const [color, setColor] = useState('red.300')
  return <styled.button color={color} />
}

// ❌ Avoid: Referenced value that depends on runtime data
<styled.div color={getColor()} />
<styled.div color={colors[getColorName()]} />
<styled.div color={colors[runtimeColorName]} />

// ❌ renamed prop. See Extraction rules
<CustomCircle circleSize="4" />
```


---


## Extraction rules

Panda reads the source as written. The tag, the prop, and the value have to be names it already knows.

Panda's compiler matches the names in your source. The tag, the prop, and the value have to be names it already
knows.

The usual miss:

- You rename `Button` to `Random`
- You rename `size` to `circleSize`
- You pass a value from state

The class shows up. The CSS does not.

## Matching the tag

`<Button size="lg" />` only emits the `button` recipe if the tag is `Button`, or a name you listed in `jsx`.

```tsx
export function Random(props) {
  return <button className={button(props)} />
}

<Random size="lg" />
```

Panda sees `Random`, not `Button`. Export it as `Button`, set `jsx: ['Random']`, or
[pregenerate its variants with `staticCss`](/docs/recipes/jsx-tracking#skip-tracking-with-staticcss). That is
[Tracking JSX](/docs/recipes/jsx-tracking).

`cva` and `sva` do not need a matching tag. Defining them already emits every variant.

### Choosing which components Panda reads

Panda reads style props from every capitalized component, so your own wrappers like `<Card px="4">` work. A prop whose
value can't be a style, such as `columns={[{ header: 'Name' }]}`, is skipped.

Use `jsxMatchTag` to skip components, or to limit the props Panda reads from them. The last rule that matches a
component wins.

```ts
export default defineConfig({
  jsxMatchTag: [
    // Never read props from a third-party package
    { from: '@tanstack/react-table', ignore: true },
    // Read only `color` from components ending in Button
    { tag: /Button$/, props: ['color'] },
  ],
})
```

- `tag` matches the name as written, such as `Button` or `UI.Button`.
- `from` matches the import path as written. Aliases and re-exports aren't followed.
- A rule needs `tag`, `from`, or both.

## Matching the prop

Extract reads the prop on the tag. It does not follow a rename.

### Style props

There is no config that turns `elementWidth` into `width`.

```tsx
function Carousel({ elementWidth, ...props }) {
  return <styled.div width={elementWidth} {...props} />
}

<Carousel elementWidth="300px" />
```

Panda sees `elementWidth`, not `width`. Use a utility name, `css`, or a `*Css` prop at the call site:

```tsx
<Carousel width="300px" />
<Carousel css={{ width: '300px' }} />
<Carousel trackCss={{ width: '300px' }} />
```

Extract reads CSS utilities when [`jsxStyleProps`](/docs/styling/style-props#restricting-style-props) is `'all'`, plus
`css` and props that end in `Css`. For any other name, wrap the object in `.raw()` so the call site is visible:

```tsx
<Card style={css.raw({ bg: 'blue' })} />
```

See [passing styles to custom components](/docs/styling/merging-styles#passing-styles-to-custom-components).

### Recipe and pattern props

`circleSize` is not `size`. `buttonSize` is not `size`.

```tsx
function CustomCircle({ circleSize = '3', ...props }) {
  return <Circle size={circleSize} {...props} />
}

<CustomCircle circleSize="4" />
```

```tsx
function Button({ buttonSize, children }) {
  return <button className={button({ size: buttonSize })}>{children}</button>
}

<Button buttonSize="lg" />
```

Panda sees `circleSize` / `buttonSize`, not `size`. Keep the key at the call site.

`cva` and `sva` already emit every variant, so a rename there is a value problem, not a missing class. See
[Matching the value](#matching-the-value).

## Matching the value

A runtime value is invisible, even when the tag and prop are right.

```tsx
function Button({ size, ...props }) {
  return <button className={button({ size })} {...props} />
}

<Button size={size} />
```

The wrapper looks correct. Panda sees `size={size}`, not `size="lg"`. You get `defaultVariants` only.

```tsx
<Button size="lg" />
```

Pre-generate with [`staticCss`](/docs/styling/static), or put a literal at the call site.

See [Dynamic styles](/docs/styling/dynamic-styling) and [Dynamic variants](/docs/recipes/dynamic-variants).

## Composition patterns

Expose a name extract already knows, and merge inside the wrapper. Don't invent `elementWidth`.

### Using css and *Css

The wrapper takes a style object. Extract reads `css` and any prop that ends in `Css` at the call site.

```tsx
function Card({ css: cssProp, ...props }) {
  return <div className={css({ bg: 'red' }, cssProp)} {...props} />
}

<Card css={{ bg: 'blue' }} />
```

Named parts use `rootCss`, `bodyCss`, and so on. Same extract rule, one object per slot.

```tsx
function Card({ rootCss, bodyCss, ...props }) {
  return (
    <div className={css({ bg: 'red' }, rootCss)} {...props}>
      <p className={css(bodyCss)} />
    </div>
  )
}

<Card rootCss={{ bg: 'blue' }} bodyCss={{ color: 'white' }} />
```

### Using className

The consumer already has a class. The wrapper only concatenates.

```tsx
function Card({ className, ...props }) {
  return <div className={cx(card(), className)} {...props} />
}

<Card className={css({ bg: 'blue' })} />
```

Panda sees the `css()` at the call site. The wrapper never has to know `bg`.

Use `css` / `*Css` when the wrapper should merge style objects. Use `className` when the consumer already has a class
(a recipe, `css()`, or something external).

See [Merging styles](/docs/styling/merging-styles).

## See also

- [Style props](/docs/styling/style-props)
- [Tracking JSX](/docs/recipes/jsx-tracking)
- [Dynamic styles](/docs/styling/dynamic-styling)


---


## Value Fallbacks

Ship a modern CSS value with a fallback for browsers that don't support it yet. firstThatWorks() emits both declarations in the order CSS needs.

## Why you need it

Not every browser understands every value. `100dvh` is still new, and `sticky` used to be `-webkit-sticky`. CSS covers
all three with one rule: write the property twice, the safe value first, the one you want second.

```css
.hero {
  min-height: 100vh;
  min-height: 100dvh;
}

.header {
  position: -webkit-sticky;
  position: sticky;
}

.brand {
  color: #0057b8;
  color: color(display-p3 0 0.34 0.72);
}
```

## Usage

The way to do that in Panda is `firstThatWorks()`. It takes an ordered list of fallback values for a style property.

```ts
import { css, firstThatWorks } from 'styled-system/css'

css({
  minHeight: firstThatWorks('100dvh', '100vh'),
})
```

```css
.min-h_firstThatWorks\(100dvh\,_100vh\) {
  min-height: 100vh;
  min-height: 100dvh;
}
```

## Common patterns

- Wide-gamut color with an sRGB fallback:

```ts
css({
  color: firstThatWorks('oklch(55% 0.18 250)', '#0057b8'),
})
```

- Vendor-prefixed values, where each browser keeps the spelling it knows:

```ts
css({
  position: firstThatWorks('sticky', '-webkit-sticky', 'relative'),
})
```

- A newer sizing keyword behind the one every browser has:

```ts
css({
  width: firstThatWorks('fit-content', '-moz-fit-content', 'auto'),
})
```

- Color mixing that falls back to a token:

```ts
css({
  bg: firstThatWorks('color-mix(in oklch, brand, white 20%)', 'brand.light'),
})
```

## `!important`

Mark the whole fallback, not one value:

```ts
css({
  color: `${firstThatWorks('oklch(60% 0.2 30)', 'red')} !important`,
})
```

Marking only some values is rejected and emits nothing. An important declaration wins whatever its position, so the
others could never apply.

## Troubleshooting

`firstThatWorks(...)` isn't real CSS, so a malformed fallback emits nothing for that property rather than a broken
declaration. Each case is reported in the build with its own code.

- **Fewer than two values.** One value has nothing to fall back to:

```ts
// ❌ first_that_works_arity_invalid
css({
  width: firstThatWorks('100dvh'),
})
```

- **An argument that isn't a single value.** Objects, arrays, booleans, and null have no declaration form:

```ts
// ❌ first_that_works_member_invalid
css({
  width: firstThatWorks({ base: '100dvh' }, '100vh'),
})

css({
  width: firstThatWorks(['100dvh', '100svh'], '100vh'),
})
```

- **Unbalanced brackets or quotes** in the written form:

```ts
// ❌ first_that_works_unbalanced
css({
  width: 'firstThatWorks(min(60rem, 100%, 75%)',
})
```

- **A fallback inside a fallback.** One is already ordered, so list every value in it:

```ts
// ❌ first_that_works_nested
css({
  color: firstThatWorks(firstThatWorks('oklch(55% 0.18 250)', '#0057b8'), 'blue'),
})

// ✅
css({
  color: firstThatWorks('oklch(55% 0.18 250)', '#0057b8', 'blue'),
})
```

- **`!important` on only some values.** An important declaration wins whatever its position, so mark the whole fallback:

```ts
// ❌ first_that_works_importance_mixed
css({
  color: firstThatWorks('oklch(60% 0.2 30) !important', 'red'),
})

// ✅
css({
  color: `${firstThatWorks('oklch(60% 0.2 30)', 'red')} !important`,
})
```

- **A custom property.** A variable only fails when it's read, too late to recover, so put the fallback where it's read:

```ts
// ⚠️ first_that_works_custom_property
css({
  '--accent': firstThatWorks('oklch(55% 0.18 250)', '#0057b8'),
})

// ✅
css({
  '--accent': 'oklch(55% 0.18 250)',
  color: 'var(--accent, #0057b8)',
})
```


---


## Global Styles

How to work with resets, global styles, and global CSS variables in Panda.

Panda groups global styles into reset and base layers so you can control defaults predictably and override them safely.

## Layers overview

- **@layer reset**: Preflight/reset styles, enabled with `preflight`.
- **@layer base**: Your additional global styles via `globalCss`.

> See also: [Cascade layers](/docs/styling/cascade-layers)

## Reset (preflight)

Enable or scope the reset styles.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true
})
```

Scope and level:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: { scope: '.extension', level: 'element' }
})
```

## Exposed global CSS variables

These variables are used by the reset and defaults. Set them in `globalCss`:

- `--global-font-body`
- `--global-font-mono`
- `--global-color-border`
- `--global-color-placeholder`
- `--global-color-selection`
- `--global-color-focus-ring`

## Setting global styles (base)

Use `globalCss` to define additional global styles and set variables.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  globalCss: {
    html: {
      '--global-font-body': 'Inter, sans-serif',
      '--global-font-mono': 'Mononoki Nerd Font, monospace',
      '--global-color-border': 'colors.gray.400',
      '--global-color-placeholder': 'rgba(0,0,0,0.5)',
      '--global-color-selection': 'rgba(0,115,255,0.3)',
      '--global-color-focus-ring': 'colors.blue.400'
    }
  }
})
```

### Theming patterns

You can set variables on `:root`, a `.dark` class, or via media queries.

```css
:root {
  --global-color-border: oklch(0.8 0 0);
}
.dark {
  --global-color-border: oklch(0.72 0 0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --global-color-border: oklch(0.72 0 0);
  }
}
```

## Custom global variables (`globalVars`)

Define additional global CSS variables or `@property` entries.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  globalVars: {
    '--button-color': {
      syntax: '<color>',
      inherits: false,
      initialValue: 'blue'
    }
  }
})
```

> Keys from `globalVars` are suggestable in style objects and generated near your tokens at `cssVarRoot`.

### Variables owned by a utility

A utility that writes a CSS variable declares the registration itself, so the two can't drift apart:

```ts filename="panda.config.ts"
export default defineConfig({
  utilities: {
    blur: {
      className: 'blur',
      globalVars: {
        '--blur': { syntax: '*', inherits: false }
      },
      transform: (value) => ({ '--blur': `blur(${value})` })
    }
  }
})
```

Only the utility that *writes* the variable needs to declare it. A second utility that reads it — `filter: 'auto'`
composing `var(--blur, )` — declares nothing.

These merge into `globalVars`, and Panda drops any registration your stylesheet never references. Declaring one
costs nothing until it's used, which is how `preset-base` registers dozens of them without charging projects that
don't mask, transform, or filter.

Two rules keep collisions honest:

- Two utilities registering the same name with different definitions is a config error. A CSS variable has one
  registration for the whole document, so share one definition between them.
- Putting a plain value on a name a utility registered warns, because the value drops the `@property` registration
  and starts the variable inheriting. Pass a full `@property` object if you meant to retune it. The warning only
  appears when your stylesheet actually reads that variable, so reusing a name the preset happens to reserve is
  fine as long as the two never meet.

### Older browsers

`@property` needs Chrome 85+, Safari 16.4+, or Firefox 128+. Engines without it skip the registration entirely, so a
declaration that reads an unregistered variable is dropped — the utility silently does nothing.

Set `optimize.propertyFallback` to also seed the defaults as plain declarations:

```ts filename="panda.config.ts"
export default defineConfig({
  optimize: { propertyFallback: true }
})
```

Panda derives the seeds from the registrations it actually emitted, so you only pay for the variables your project
uses. Modern engines ignore them.

## Troubleshooting

- **Global styles aren't applied:** Confirm `preflight` is enabled (if you expect reset), and ensure your selector
  (`html`, `:root`, `.dark`, etc.) matches the element where variables are set.

- **Global styles are overridden by utilities or component styles:** Verify layer order and specificity. Ensure
  `@layer reset` and `@layer base` are emitted before utilities. If you customize insertion or injection order (SSR,
  framework plugins), preserve `@layer` order so globals are not overridden.


---


## Keyframes

Define inline, component-local CSS animations with the keyframes() factory. It returns the animation name and emits the @keyframes block for you.

## How it works

`keyframes()` names an inline [`@keyframes`](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) block and
returns the animation name to put in `animationName` or the `animation` shorthand. Use it for an ad-hoc, component-local
animation that does not need to live in `theme.keyframes`.

```ts
import { css, keyframes } from 'styled-system/css'

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
})
// → "kf_xxx"

css({ animation: `${spin} 1s linear infinite` })
```

```css
@keyframes kf_xxx {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

Panda folds the call at build time, so a static `keyframes()` inlines to its name and drops the import. Unused inline
keyframes stay out of the CSS, the same way `theme.keyframes` are pruned when `removeUnusedKeyframes` is on.

## Using the result

The returned name is a normal string, so it composes in your own style object. Put it in `animationName`, or interpolate
it into the `animation` shorthand:

```ts
import { css, keyframes } from 'styled-system/css'

const fade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
})

css({ animationName: fade, animationDuration: '0.6s', animationTimingFunction: 'ease-out' })
```

## Object form only

Unlike [`viewTransition()`](/docs/styling/view-transition) and [`positionTry()`](/docs/styling/position-try),
`keyframes()` has no named form. A bare `animationName: 'spin'` already resolves a `theme.keyframes` entry and
tree-shakes, so a `keyframes('spin')` call would be redundant. The factory takes an object and only an object.

## Theme keyframes

Shared, design-system animations still belong in `theme.keyframes`, referenced by name. The factory is additive, for the
inline case a shared theme entry cannot express:

```ts filename="panda.config.ts"
import { defineConfig, defineKeyframes } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      keyframes: defineKeyframes({
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      })
    }
  }
})
```

```ts
import { css } from 'styled-system/css'

css({ animationName: 'spin' })
```

## Design systems

Export an inline animation the same way you'd export a shared `cva`:

```ts
export const spin = keyframes({ to: { transform: 'rotate(360deg)' } })
```

`panda lib` puts it in build info. Consuming apps get the `@keyframes` CSS without re-scanning your source, and
tree-shaking follows imports like recipes. Or register shared animations in a preset's `theme.keyframes`.


---


## Merging Styles

Learn how to merge multiple styles without conflicts.

## Merging `css` objects

You can merge multiple style objects together using the `css` function.

```js
import { css } from 'styled-system/css'

const style1 = {
  bg: 'red',
  color: 'white'
}

const style2 = {
  bg: 'blue'
}

const className = css(style1, style2) // => 'bg_blue text_white'
```

In some cases though, the style object might not be colocated in the same file as the component. In this case, you can
use the `css.raw` function to preserve the original style object.

> All `.raw(...)` signatures are identity functions that return the same value as the input, but serve as a hint to the
> compiler that the value is a style object.

```js
// style.js
import { css } from 'styled-system/css'

export const style1 = css.raw({
  bg: 'red',
  color: 'white'
})

// component.js
import { css } from 'styled-system/css'
import { style1 } from './style.js'

const style2 = css.raw({
  bg: 'blue'
})

const className = css(style1, style2) // => 'bg_blue text_white'
```

## Spreading `css.raw` objects

> **Added in v1.6.1**

You can also spread `css.raw` objects within style declarations. This is particularly useful for reusing styles in
nested selectors, conditions, and complex compositions:

### Child selectors

```js
import { css } from 'styled-system/css'

const baseStyles = css.raw({ margin: 0, padding: 0 })

const component = css({
  '& p': { ...baseStyles, fontSize: '1rem' },
  '& h1': { ...baseStyles, fontSize: '2rem' }
})
```

### Nested conditions

```js
import { css } from 'styled-system/css'

const interactive = css.raw({ cursor: 'pointer', transition: 'all 0.2s' })

const card = css({
  _hover: {
    ...interactive,
    _dark: { ...interactive, color: 'white' }
  }
})
```

## Merging `cva` + `css` styles

The same technique can be used to merge an atomic `cva` recipe and a style object.

```js
import { css, cx, cva } from 'styled-system/css'

const overrideStyles = css.raw({
  bg: 'red',
  color: 'white'
})

const buttonStyles = cva({
  base: {
    bg: 'blue',
    border: '1px solid black'
  },
  variants: {
    size: {
      small: { fontSize: '12px' }
    }
  }
})

const className = css(
  // returns the resolved style object
  buttonStyles.raw({ size: 'small' }),
  // add the override styles
  overrideStyles
)

// => 'bg_red border_1px_solid_black color_white font-size_12px'
```

## Merging `sva` + `css` styles

The same technique can be used to merge an atomic `sva` recipe and a style object.

```js
import { css, sva } from 'styled-system/css'

const overrideStyles = css.raw({
  bg: 'red',
  color: 'white'
})

const buttonStyles = sva({
  slots: ['root']
  base: {
    root: {
      bg: 'blue',
      border: '1px solid black'
    }
  },
  variants: {
    size: {
      root: {
        small: { fontSize: '12px' }
      }
    }
  }
})

// returns the resolved style object for all slots
const { root } = buttonStyles.raw({ size: 'small' })

const className = css(
  root,
  // add the override styles
  overrideStyles
)

// => 'bg_red border_1px_solid_black color_white font-size_12px'
```

## Merging config recipe and style object

Due to the fact that the generated styles of a config recipe are saved in the `@layer recipe` cascade layer, they can be
overridden with any atomic styles. Use the `cx` function to achieve that.

> The `utilties` layer has more precedence than the `recipe` layer.

```js
import { css, cx } from 'styled-system/css'
import { button } from 'styled-system/recipes'

const className = cx(
  // returns the resolved class name: `button button--size-small`
  button({ size: 'small' }),
  // add the override styles
  css({ bg: 'red' }) // => 'bg_red'
)

// => 'button button--size-small bg_red'
```

## Passing styles to custom components

Expose `css`, a `*Css` prop, or `css.raw()` on a custom prop name. Panda extracts styles at the call site.

> **Note:** Set `jsxFramework` in your config for JSX extraction.

```jsx
const cardStyles = css.raw({
  bg: 'red',
  color: 'white'
})

function Card({ title, description, css: cssProp }) {
  return (
    <div className={css(cardStyles, cssProp)}>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

// usage
<Card title="Hello World" description="This is a card component" css={{ bg: 'blue' }} />
```

Props ending in `Css` work the same way, which is useful for named slots:

```jsx
function Card({ title, description, rootCss, bodyCss }) {
  return (
    <div className={css(cardStyles, rootCss)}>
      <h1>{title}</h1>
      <p className={css(bodyCss)}>{description}</p>
    </div>
  )
}

<Card rootCss={{ bg: 'blue' }} bodyCss={{ color: 'white' }} />
```

For any other prop name, wrap the value in `css.raw()`:

```jsx
function Card({ title, description, style }) {
  return (
    <div className={css(cardStyles, style)}>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

<Card title="Hello World" description="This is a card component" style={css.raw({ bg: 'blue' })} />
```

See [Extraction rules](/docs/styling/extraction-rules).


---


## Optimization

Shrink the CSS Panda emits. Every optimize flag is opt-in.

Panda already extracts only the styles it finds in your source. The `optimize` block goes further: unused tokens, unused
keyframes, unused compound variants, unused design-system modules.

Nothing here changes how you write styles. All of it is off by default.

## CSS cleanup

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  optimize: {
    removeUnusedTokens: true,
    removeUnusedKeyframes: true,
    smartCompoundVariants: true,
    treeshakeDesignSystem: true
  }
})
```

### Unused tokens

By default the tokens layer ships every `--*` from your theme. With `removeUnusedTokens`, a variable stays only if
something uses it: extracted styles, recipes, `staticCss`, `globalCss`, and `token()` / `token.var()` calls Panda can
see.

```ts filename="panda.config.ts"
export default defineConfig({
  optimize: { removeUnusedTokens: true }
})
```

```ts
import { token } from 'styled-system/tokens'

// ✅ Panda sees this — `--colors-red` stays
export const brand = token.var('colors.red')

// ❌ Built at runtime — invisible; use staticCss or leave the flag off
export const dynamic = token.var(path)
```

`staticCss.themes` always keeps those theme variables, so a themed sheet doesn't get pruned empty.

### Unused keyframes

Same idea for `@keyframes`. A name stays if `animation` or `animation-name` references it.

### Compound variants

Once a recipe is used, Panda emits **every** compound variant for that recipe. `smartCompoundVariants` emits only the
compounds that match the variant combinations it extracted.

```ts filename="panda.config.ts"
export default defineConfig({
  optimize: { smartCompoundVariants: true },
  // Runtime-only variants need an explicit list (one variant key per rule)
  staticCss: {
    recipes: {
      button: [{ size: ['sm', 'md'] }, { variant: ['solid'] }]
    }
  }
})
```

See [Static CSS → Recipes](/docs/styling/static#recipes).

### Design systems

When you consume a library with `designSystem`, Panda hydrates every module from its build info. `treeshakeDesignSystem`
scans your `include` files and hydrates only the exports you import.

```ts filename="panda.config.ts"
export default defineConfig({
  designSystem: '@acme/ds',
  optimize: { treeshakeDesignSystem: true }
})
```

Nested design systems are narrowed through the parent chain too. If a selected child module depends on a parent
component, Panda keeps the parent CSS it needs.

`import * as DS from '@acme/ds'`, a side-effect import, or a dynamic `import()` in the app still hydrates every module
from that package. A namespace or side-effect import inside a selected design-system module keeps all modules from that
parent. If the app imports nothing from the package, nothing is hydrated.

When a selected intermediate package has build info from before parent imports were recorded, Panda hydrates the full
parent rather than risk missing CSS. Run `panda lib` in that package to restore narrowing. See
[Consume with Panda](/docs/design-systems/consume-with-panda) for the full setup.

### Older browsers

This is compatibility, not size. v2 registers transform and filter variables with `@property` instead of a reset on
every element. Safari &lt; 16.4 and Firefox &lt; 128 ignore `@property` and drop those utilities.

```ts filename="panda.config.ts"
export default defineConfig({
  optimize: { propertyFallback: true }
})
```

That also writes the defaults as plain declarations, for the variables your project uses.

## Profile the build

Don't guess. Add `--profile` to any Panda command:

```bash
panda --profile
```

That writes `.panda/trace.json` (open it in `chrome://tracing` or [ui.perfetto.dev](https://ui.perfetto.dev)) and a
`.panda/timings.json` summary. See [Debugging](/docs/reference/debugging#performance-profiling).

## Narrow include

Extraction time scales with how many files [`include`](/docs/reference/config#include) matches. A file that never uses
Panda is cheap after parse, but it still gets parsed. Keep the glob tight: skip tests, Storybook, and generated output
unless they call `css()` themselves.

```ts filename="panda.config.ts"
export default defineConfig({
  include: ['./src/**/*.{ts,tsx}'],
  exclude: ['./src/**/*.stories.tsx', './src/**/*.test.tsx']
})
```

`panda debug` lists every file a run scanned.

## Less staticCss

[`staticCss`](/docs/styling/static) is the escape hatch for values Panda can't extract. It generates those classes
unconditionally, so a wide `*` list grows both CSS and build time. Generate only the utilities and recipes you need.

```ts filename="panda.config.ts"
export default defineConfig({
  // ❌ Ships every color utility
  // staticCss: { css: [{ properties: { color: ['*'] } }] }

  // ✅ Only the values you can't extract
  staticCss: {
    css: [{ properties: { color: ['red.500', 'blue.500'] } }]
  }
})
```

## Smaller JS bundle

The styling runtime (`css()`, `cva()`, the JSX factory) ships as a small fixed cost. The bundler plugins can rewrite
static calls to plain class strings so it drops out entirely. See [Source transforms](/docs/styling/source-transforms).

## Minify

`minify: true` strips whitespace from the emitted CSS. Native minify is not yet a full LightningCSS replacement — check
the result if you depended on that last few percent. Enable it in production only:

```ts filename="panda.config.ts"
export default defineConfig({
  minify: process.env.NODE_ENV === 'production'
})
```

## Editor speed

If the IDE lags only inside `css()` calls or style props, that's TypeScript checking generated unions, not Panda
running.

[`strictTokens`](/docs/styling/writing-styles#stricttokens) is the knob. Off, properties accept a token **or** a string.
On, they accept only the token union — safer, and a larger type for TypeScript to check.

```ts filename="panda.config.ts"
export default defineConfig({
  strictTokens: true
})
```

Try turning it off before assuming something else is wrong.

## See also

- [Config → optimize](/docs/reference/config#optimize) for the full option list.
- [Static CSS Generation](/docs/styling/static) for pre-generating what extraction can't see.
- [Debugging](/docs/reference/debugging) for `--profile` and `panda debug`.


---


## Styling

Write styles next to your markup. Panda turns them into atomic CSS at build time.

Panda looks like CSS-in-JS when you write it. You write style objects in TypeScript, and the build emits plain atomic
CSS. Nothing in the browser computes those styles.

```tsx
import { css } from 'styled-system/css'

function Button() {
  return (
    <button
      className={css({
        bg: 'blue.500',
        color: 'white',
        px: '4',
        py: '2',
        borderRadius: 'md',
        _hover: { bg: 'blue.600' }
      })}
    >
      Click me
    </button>
  )
}
```

There is more than one way to author styles in Panda. While the above syntax holds true, `css()` is only one entry
point. Every API below compiles down to the same CSS.

## Pick an API

Most styles start as a quick **`css()`** call. Reach for **patterns** when you need layout primitives, **style props**
if you want JSX-prop ergonomics, and **recipes** once a component actually has variants.

<Cards columns={2}>
  <Card
    title="css()"
    href="/docs/styling/writing-styles"
    description="Object styles on a className. The default for one-off and colocated styles."
    cta="Write a style"
  />
  <Card
    title="Style props"
    href="/docs/styling/style-props"
    description="Pass CSS as JSX props on styled.* elements when you want Chakra-like ergonomics."
    cta="Use style props"
  />
  <Card
    title="Patterns"
    href="/docs/styling/patterns"
    description="Layout primitives like stack, grid, and container, typed and responsive."
    cta="Browse patterns"
  />
  <Card
    title="Recipes"
    href="/docs/recipes/overview"
    description="Variants and compound variants for components. Lives in the Recipes tab."
    cta="Write a recipe"
  />
</Cards>


---


## Layout Patterns

Stack, grid, center, container and friends. The layouts every app writes by hand, as typed functions and components.

Most layout code is the same handful of ideas: put these in a column with a gap, line those up in a row and center
them, cap the page width and center it, lay cards out in a grid. Written by hand, each one is four or five flex or
grid properties, and every screen writes them again.

```tsx
<div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
  <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
    <h2>Orders</h2>
    <button>Export</button>
  </div>
  <div className={css({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '4' })}>
    {cards}
  </div>
</div>
```

Patterns name those ideas. Each one is a function that takes a few layout props and returns a class name, so the
same screen reads as what it is:

```tsx
<div className={stack({ gap: '6' })}>
  <div className={hstack({ justify: 'space-between' })}>
    <h2>Orders</h2>
    <button>Export</button>
  </div>
  <div className={grid({ columns: 3, gap: '4' })}>{cards}</div>
</div>
```

Nothing changes underneath. A pattern call is extracted at build time and produces the same atomic CSS as the `css()`
call it replaces. There is no runtime, no wrapper element, and no new class of thing to learn: any style property
still works alongside the pattern props.

## What you get

- **Typed props.** `gap` takes spacing tokens, `align` takes the `align-items` keywords, `columns` takes a number.
  Autocomplete shows what a pattern accepts.
- **Responsive values.** Every prop accepts breakpoint objects, so `direction={{ base: 'column', md: 'row' }}` just
  works.
- **Two forms.** A function under `styled-system/patterns` for class names, and with `jsxFramework` set, a
  component under `styled-system/jsx`.
- **Zero cost.** Extracted like `css()`, emitting the same atomic classes.
- **Yours to shape.** Change a default, narrow a prop, or write your own. See
  [Patterns](/docs/theming/patterns).

```tsx
import { stack } from '../styled-system/patterns'
import { Stack } from '../styled-system/jsx'

<div className={stack({ gap: '4' })} />
<Stack gap="4" />
```

The rest of this page uses the function form. Every example has a JSX twin with the same props.

## Pick a pattern

- **Stacking**: [`stack`](#stack) for a column or row with a gap, [`hstack`](#hstack) and [`vstack`](#vstack) for the
  two common cases with items centered, [`spacer`](#spacer) to push siblings apart.
- **Wrapping and grids**: [`wrap`](#wrap) for items that flow onto new lines, [`grid`](#grid) and
  [`gridItem`](#grid-item) for columns and spans.
- **Sizing and centering**: [`container`](#container) for a capped, centered page, [`center`](#center) to center
  children, [`square`](#square) and [`circle`](#circle) for fixed boxes, [`aspectRatio`](#aspect-ratio) for media.
- **Positioning**: [`float`](#float) to pin a badge to a corner, [`bleed`](#bleed) to break out of a parent's padding,
  [`linkOverlay`](#link-overlay) to make a whole card clickable.
- **Utilities**: [`box`](#box) for style props with no opinion, [`visuallyHidden`](#visually-hidden) for screen-reader
  only content, [`divider`](#divider) for a rule, [`cq`](#container-query) to declare a container query.

## Stacking

### Stack

A flex container with a gap. Defaults to a column.

- `direction`: `column` by default, or `row`.
- `gap`: spacing between children. Defaults to `8px`.
- `align`, `justify`: `align-items` and `justify-content`.

```tsx
import { stack } from '../styled-system/patterns'

<form className={stack({ gap: '4' })}>
  <input />
  <input />
  <button>Save</button>
</form>
```

### HStack

A row with children vertically centered. The everyday toolbar.

- `gap`: defaults to `8px`.
- `justify`: `justify-content`.

```tsx
import { hstack } from '../styled-system/patterns'

<header className={hstack({ justify: 'space-between' })}>
  <Logo />
  <nav className={hstack({ gap: '6' })}>{links}</nav>
</header>
```

### VStack

A column with children horizontally centered.

- `gap`: defaults to `8px`.
- `justify`: `justify-content`.

```tsx
import { vstack } from '../styled-system/patterns'

<div className={vstack({ gap: '2' })}>
  <Avatar />
  <span>Segun</span>
</div>
```

### Spacer

Fills the free space in a stack so what comes after it sits at the far end.

- `size`: a fixed spacing token instead of filling. Without it the spacer grows.

```tsx
import { hstack, spacer } from '../styled-system/patterns'

<div className={hstack()}>
  <Logo />
  <div className={spacer()} />
  <button>Sign in</button>
</div>
```

## Wrapping and grids

### Wrap

A row that flows onto new lines when it runs out of room. Tags, chips, filter pills.

- `gap`, `rowGap`, `columnGap`: `gap` defaults to `8px` unless one of the axis gaps is set.
- `align`, `justify`: `align-items` and `justify-content`.

```tsx
import { wrap } from '../styled-system/patterns'

<ul className={wrap({ gap: '2' })}>{tags}</ul>
```

### Grid

Equal columns, or as many columns as fit.

- `columns`: a fixed count.
- `minChildWidth`: a size token or length. The grid fits as many columns of at least that width as it can. Use it
  instead of `columns`, not with it.
- `gap`, `rowGap`, `columnGap`: `gap` defaults to `8px` unless an axis gap is set.

```tsx
import { grid } from '../styled-system/patterns'

<div className={grid({ columns: { base: 1, md: 3 }, gap: '6' })}>{cards}</div>
<div className={grid({ minChildWidth: '64', gap: '6' })}>{cards}</div>
```

### Grid Item

Spans and placement for a child of `grid`.

- `colSpan`, `rowSpan`: how many tracks to cover.
- `colStart`, `colEnd`, `rowStart`, `rowEnd`: explicit lines.

```tsx
import { grid, gridItem } from '../styled-system/patterns'

<div className={grid({ columns: 3, gap: '6' })}>
  <article className={gridItem({ colSpan: 2 })}>Feature</article>
  <aside>Sidebar</aside>
</div>
```

## Sizing and centering

### Container

Caps the width, centers the block, and adds responsive side padding. One per page.

It sets `maxWidth: '8xl'`, `marginX: 'auto'`, and `paddingX: { base: '4', md: '6', lg: '8' }`. Override any of them
as a style prop.

```tsx
import { container } from '../styled-system/patterns'

<main className={container({ maxWidth: '4xl' })}>{children}</main>
```

### Center

Centers children on both axes.

- `inline`: use `inline-flex` so the box sizes to its content.

```tsx
import { center } from '../styled-system/patterns'

<button className={center({ w: '10', h: '10', rounded: 'full' })}>
  <Icon />
</button>
```

### Square

A box with equal width and height, children centered.

- `size`: a size token or length.

```tsx
import { square } from '../styled-system/patterns'

<div className={square({ size: '12', bg: 'gray.100' })}>
  <Icon />
</div>
```

### Circle

The same as `square`, rounded. Avatars, status dots, icon buttons.

- `size`: a size token or length.

```tsx
import { circle } from '../styled-system/patterns'

<div className={circle({ size: '10', bg: 'green.500' })} />
```

### Aspect Ratio

Holds a box at a ratio and fits its child to it. Images, video, maps.

- `ratio`: a number. Defaults to `4 / 3`.

For a plain box, the `aspectRatio` style property is enough. Reach for the pattern when the child is an `iframe` or
an image that must fill and crop.

```tsx
import { aspectRatio } from '../styled-system/patterns'

<div className={aspectRatio({ ratio: 16 / 9 })}>
  <iframe src={mapUrl} title="Map" />
</div>
```

## Positioning

### Float

Pins an element to a corner or edge of its nearest positioned ancestor. Badges, close buttons, counters.

- `placement`: `top-start`, `top-center`, `top-end`, `middle-start`, `middle-center`, `middle-end`, `bottom-start`,
  `bottom-center`, or `bottom-end`. Defaults to `top-end`.
- `offset`, `offsetX`, `offsetY`: distance from the edge, as a spacing token.

The parent needs `position: relative`.

```tsx
import { css } from '../styled-system/css'
import { float } from '../styled-system/patterns'

<button className={css({ position: 'relative' })}>
  <BellIcon />
  <span className={float({ placement: 'top-end', offset: '1' })}>3</span>
</button>
```

### Bleed

Pulls an element out past its parent's padding so it runs edge to edge.

- `inline`, `block`: how far to bleed on each axis. Match the parent's padding.

```tsx
import { css } from '../styled-system/css'
import { bleed } from '../styled-system/patterns'

<article className={css({ px: '6' })}>
  <img className={bleed({ inline: '6' })} src={hero} alt="" />
  <p>Body copy stays inside the padding.</p>
</article>
```

### Link Overlay

Stretches a link's clickable area over its nearest positioned ancestor, so a whole card is clickable while the
markup keeps one real link.

```tsx
import { css } from '../styled-system/css'
import { linkOverlay } from '../styled-system/patterns'

<article className={css({ position: 'relative' })}>
  <img src={cover} alt="" />
  <h3>
    <a href="/post/1" className={linkOverlay()}>
      Read the post
    </a>
  </h3>
</article>
```

Keep one link per card. A second clickable element inside the card would sit under the overlay.

## Utilities

### Box

No styles of its own. As a function it is `css()`. As a component it is a `div` that takes style props, which is
the reason it exists.

```tsx
import { Box } from '../styled-system/jsx'

<Box p="4" bg="bg.subtle" rounded="md">
  {children}
</Box>
```

### Visually Hidden

Removes an element from view but not from the accessibility tree. Labels for icon buttons, skip links, the input
behind a custom checkbox.

```tsx
import { visuallyHidden } from '../styled-system/patterns'

<button>
  <TrashIcon />
  <span className={visuallyHidden()}>Delete</span>
</button>
```

### Divider

A horizontal or vertical rule that fills its axis.

- `orientation`: `horizontal` by default, or `vertical`.
- `thickness`: a size token or length. Defaults to `1px`.
- `color`: a color token.

```tsx
import { divider, hstack } from '../styled-system/patterns'

<div className={hstack({ gap: '4', h: '6' })}>
  <a href="/docs">Docs</a>
  <div className={divider({ orientation: 'vertical', color: 'border' })} />
  <a href="/blog">Blog</a>
</div>
```

### Container Query

Declares the element as a container, so children can respond to its width instead of the viewport's.

- `type`: `containerType`. Defaults to `inline-size`.
- `name`: a name from `theme.containerNames`, for `@name/size` conditions.

```tsx
import { css } from '../styled-system/css'
import { cq } from '../styled-system/patterns'

<aside className={cq({ name: 'sidebar' })}>
  <p className={css({ fontSize: { base: 'sm', '@sidebar/md': 'md' } })}>{text}</p>
</aside>
```

The size conditions come from `theme.containers`. See
[container queries](/docs/styling/conditional-styles#container-queries).

## Responsive props

A pattern prop takes the same breakpoint object as any style property. Put the breakpoints on the prop itself:

```tsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: '4', md: '6' }} />
<Stack direction={{ base: 'column', md: 'row' }} />
```

Nesting a pattern prop inside a breakpoint key skips the pattern, so nothing changes at that breakpoint:

```tsx
// ❌ `columns` inside `md` is never transformed
<Grid columns={1} md={{ columns: 2 }} />

// ✅
<Grid columns={{ base: 1, md: 2 }} />
```

Style props on the same element still accept breakpoint keys the usual way.

## Wrapping a pattern component

Patterns are found by name when Panda scans your files. Wrap `Stack` in your own `Section` component and the props
passed to `Section` are invisible to extraction, because nothing tells Panda that `Section` is a stack.

The `jsx` option on the pattern's config adds names for Panda to treat as that pattern:

```ts filename="panda.config.ts"
patterns: {
  extend: {
    stack: { jsx: ['Stack', 'Section'] }
  }
}
```

Now `<Section gap="8" />` is extracted like `<Stack gap="8" />`. Regexes work too, for a family of wrappers. See
[Patterns](/docs/theming/patterns#jsx-hints) for the full option.

## Make your own

The built-ins cover the layouts every app has. The ones your app repeats that these don't cover, a scrollable
region, a two-pane sidebar, a sticky header that clears the nav, are the case for
[writing a pattern](/docs/theming/patterns).


---


## Position Try

Define CSS anchor-positioning fallbacks with a typed factory. positionTry() returns the dashed-ident you put in position-try-fallbacks.

## How it works

CSS anchor positioning lets an element fall back to another position when it runs out of room. You name each fallback in
an [`@position-try`](https://developer.mozilla.org/en-US/docs/Web/CSS/@position-try) block, then reference it by that
name in [`position-try-fallbacks`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks).

`positionTry()` returns the dashed-ident and emits the `@position-try` block for you.

```ts
import { css, positionTry } from 'styled-system/css'

const bottom = positionTry({
  top: 'anchor(bottom)',
  insetInlineStart: 'anchor(start)'
})
// → "--pt_xxx"

css({ positionAnchor: '--trigger', positionTryFallbacks: bottom })
```

```css
@position-try --pt_xxx {
  top: anchor(bottom);
  inset-inline-start: anchor(start);
}
```

Unlike [`viewTransition()`](/docs/styling/view-transition), which returns a class for `className`, `positionTry()`
returns a value. An anchor fallback is named in a property value, the same way `@keyframes` is named by
`animation-name`, so the factory hands you the dashed-ident that `position-try-fallbacks` consumes.

## Using the result

The returned ident is a normal string, so it composes in your own style object. Panda folds the call at build time, so
`css()` emits a real `position-try-fallbacks` declaration:

```ts
import { css, positionTry } from 'styled-system/css'

const bottom = positionTry({ top: 'anchor(bottom)' })
const flip = positionTry({ bottom: 'anchor(top)' })

css({
  positionAnchor: '--trigger',
  positionTryFallbacks: `${bottom}, ${flip}`
})
```

```css
.position-try-fallbacks_--pt_xxx\,_--pt_yyy {
  position-try-fallbacks: --pt_xxx, --pt_yyy;
}
```

You still set `anchor-name` on the anchor element and `position-anchor` on the positioned element yourself. Those are
per-element and Panda does not manage them.

## Named fallbacks

Register reusable fallbacks in `theme.positionTry`, then call them by name:

```ts filename="panda.config.ts"
import { defineConfig, definePositionTry } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      positionTry: definePositionTry({
        bottom: {
          top: 'anchor(bottom)',
          insetInlineStart: 'anchor(start)'
        }
      })
    }
  }
})
```

```ts
import { css, positionTry } from 'styled-system/css'

css({ positionTryFallbacks: positionTry('bottom') })
```

`positionTry('bottom')` returns `"--pt_bottom"`. A static call inlines at build time and drops the import. Unused names
stay out of the CSS.

## Design systems

Export a fallback the same way you'd export a shared `cva`:

```ts
export const bottom = positionTry({ top: 'anchor(bottom)' })
```

`panda lib` puts it in build info. Consuming apps get the `@position-try` CSS without re-scanning your source, and
tree-shaking follows imports like recipes. Or register the same fallbacks in a preset's `theme.positionTry` and let apps
call `positionTry('bottom')`.

## Migrating from `globalPositionTry`

`globalPositionTry` is removed. Move its entries to `theme.positionTry` and reference them through `positionTry()`,
which is typed, tree-shaken, and referenced by name:

```ts
// ❌ removed
globalPositionTry: {
  '--bottom': { top: 'anchor(bottom)' }
}
css({ positionTryFallbacks: '--bottom' })

// ✅ v2
theme: {
  extend: {
    positionTry: { bottom: { top: 'anchor(bottom)' } }
  }
}
css({ positionTryFallbacks: positionTry('bottom') })
```

A block that must always emit under a hand-authored name, for a fallback referenced from CSS Panda does not scan,
belongs in a plain `.css` file.


---


## Responsive Design

How to write mobile responsive designs in your CSS in Panda

Responsive design is a fundamental aspect of modern web development, allowing websites and applications to adapt
seamlessly to different screen sizes and devices.

Panda provides a comprehensive set of responsive utilities and features to facilitate the creation of responsive
layouts. It lets you do this through conditional styles for different breakpoints.

Let's say you want to change the font weight of a text on large screens, you can do it like this:

```jsx
<span
  className={css({
    fontWeight: 'medium',
    lg: { fontWeight: 'bold' }
  })}
>
  Text
</span>
```

> Panda uses a mobile-first breakpoint system and leverages min-width media queries `@media(min-width)` when you write
> responsive styles.

Panda provides five breakpoints by default:

```ts
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

## Overview

### Property based modifier

Panda allows you apply the responsive condition directly to a style property, resulting in a more concise syntax:

```diff
<span
  className={css({
-   fontWeight: 'medium',
-   lg: { fontWeight: 'bold' }
+   fontWeight: { base: 'medium', lg: 'bold' }
  })}
>
  Text
</span>
```

### The Array syntax

Panda also accepts arrays as values for responsive styles. Pass the corresponding value for each breakpoint in the
array. Using our previous code as an example:

```jsx
<span
  className={css({
    fontWeight: ['medium', undefined, undefined, 'bold']
  })}
>
  Text
</span>
```

> We're leaving the corresponding values of the unused breakpoints `md` and `lg` as undefined.

### Targeting a breakpoint range

By default, styles assigned to a specific breakpoint will be effective at that breakpoint and will persist as applied
styles at larger breakpoints.

If you wish to apply a utility exclusively when a particular range of breakpoints is active, Panda offers properties
that restrict the style to that specific range. To construct the property, combine the minimum and maximum breakpoints
using the "To" notation in camelCase format.

Let's say we want to apply styles between the `md` and `xl` breakpoints, we use the `mdToXl` property:

```jsx
<span
  className={css({
    fontWeight: { mdToXl: 'bold' }
  })}
>
  Text
</span>
```

> This text will only be bold in `md`, `lg` and `xl` breakpoints.

### Targeting a single breakpoint

To target a single breakpoint, you can easily achieve this by simply adding the suffix "Only" to the breakpoint name in
camelCase format.

Let's say we want to apply styles only in the `lg` breakpoint, we use the `lgOnly` property:

```jsx
<span
  className={css({
    fontWeight: { lgOnly: 'bold' }
  })}
>
  Text
</span>
```

### Customizing Breakpoints

When encountering certain scenarios, it may become necessary to establish custom breakpoints tailored to your
application's needs. It is advisable to utilize commonly used aliases such as `sm`, `md`, `lg`, and `xl` for this
purpose.

In order to define custom breakpoints, you can easily accomplish this by passing them as an object within your Panda
config.

> Note: Make sure that the CSS units of your breakpoints are consistent. Use either all pixels (`px`) or all `em`, but
> do not mix them.

```js filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  theme: {
    extend: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    }
  }
})
```

### Patterns and recipes

In `css()`, breakpoint keys like `md` and `lg` work on CSS utilities.

Pattern props are different. Props like `columns`, `colSpan`, and `direction` are compiled by the pattern, not passed
to CSS as-is. Put the breakpoint on the prop: `columns={{ base: 1, md: 2 }}`.

See [responsive pattern props](/docs/styling/patterns#responsive-props).

### Hiding elements by breakpoint

If you need to limit the visibility of an element to any breakpoint, Panda provides
[display utilities](/docs/reference/display) to help you achieve this.


---


## Source Transforms

Rewrite css(), pattern and recipe calls into plain class strings at build time, so the styling runtime never ships.

Panda always generates CSS at build time. By default it leaves the JavaScript alone: `css({ color: 'red.300' })`
stays a function call, and Panda's runtime resolves it to a class string in the browser.

Source transforms remove that last step. Turn them on and the bundler rewrites each call site to the class string
Panda already computed:

```tsx
// you write
<div className={css({ color: 'red.300', fontSize: '2xl', padding: '4' })} />

// your bundle ships
<div className="c_red.300 fs_2xl p_4" />
```

Nothing is left to resolve at runtime, so the styling runtime drops out of the bundle entirely.

## Enabling it

Source transforms are opt-in, behind `transform: true` on the bundler plugin.

<Tabs items={['Vite', 'webpack', 'Rollup', 'Bun']}>
  <Tab>
```ts filename="vite.config.ts"
import pandacss from '@pandacss/vite'

export default defineConfig({
  plugins: [pandacss({ transform: true })]
})
```
  </Tab>
  <Tab>
```js filename="webpack.config.js"
const { PandaWebpackPlugin } = require('@pandacss/webpack')

module.exports = {
  plugins: [new PandaWebpackPlugin({ transform: true })]
}
```
  </Tab>
  <Tab>
```ts filename="rollup.config.ts"
import pandacss from '@pandacss/rollup'

export default { plugins: [pandacss({ transform: true })] }
```
  </Tab>
  <Tab>
```ts filename="build.ts"
import { pandacss } from '@pandacss/bun'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  plugins: [pandacss({ transform: true })],
})
```

For `bun run` and `bun test`, `await register({ transform: true })` from a preload file. See [Using Bun](/docs/get-started/bun).
  </Tab>
</Tabs>

Rspack and Rolldown work through the webpack and Rollup adapters respectively.

## What gets rewritten

`css()` calls, [pattern](/docs/styling/patterns) calls, [recipe](/docs/recipes/atomic-recipe) calls, and JSX style props
on the styled factory. Patterns and factory elements are inlined too, so `<Stack gap="4">` becomes a plain `<div>`
with a class string and the pattern function disappears.

## What stays at runtime

A call Panda cannot resolve to a literal keeps its runtime form. This is by design, not a failure:

```tsx
const tone = await getTone()

// stays a runtime call — the value isn't knowable at build time
<div className={css({ color: tone })} />
```

When a call site mixes static styles with a runtime class name, Panda rewrites what it can and joins the rest:

```tsx
// you write
<styled.div className={external} color="red.500" padding="4" />

// becomes
<div className={external + " c_red.500 p_4"} />
```

Where the merge needs real class-conflict resolution, Panda emits a `cx` import from your generated
`styled-system` rather than inlining a copy.

## Turbopack

The bundler plugins above cover Vite, webpack, Rollup, Bun, Rspack and Rolldown. Turbopack has no plugin API — only
loaders — so there is no first-party Turbopack adapter yet.

Next.js 16 defaults to Turbopack and fails the build when a webpack config is present, so `withPandaCss` users
need the webpack builder explicitly:

```json filename="package.json"
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack"
  }
}
```

If you'd rather stay on Turbopack, keep source transforms off. Everything else about Panda is unchanged: CSS is
still generated at build time, and only the class-resolution step happens at runtime.

## Should you turn it on?

The win is a smaller bundle and less work in the browser, and it is a fixed win: the runtime is a constant cost,
so the saving does not grow with your app. On a small app the difference is a few kilobytes gzipped. Measure your
own bundle before and after rather than assuming.

Leave it off if you rely on `css()` in code paths Panda cannot see statically, or if switching your builder costs
more than the bundle saves.


---


## Static CSS Generation

Pre-generate CSS that Panda can't extract from your source.

Panda only emits styles it can prove at build time. A literal in `css({ color: 'red.300' })` is fine. A value that
only exists at runtime is invisible.

`staticCss` is the list of styles you want in the sheet anyway. Panda expands that list into the same atoms and recipe
classes extraction would have produced, then merges them into the emit.

```
your source  →  extract what it can see
staticCss    →  always-on utilities, recipes, patterns
                    ↓
                 merge → CSS
```

It does **not** rewrite your JS. For turning static `css()` calls into plain class strings, see
[Source transforms](/docs/styling/source-transforms).

## When to reach for it

Use `staticCss` when the class name still has to be a Panda utility or recipe class, but the value isn't a string
literal in source:

- A color (or other token) chosen from state, Storybook knobs, or a URL param
- A [config recipe](/docs/recipes/config-recipe) variant passed as a prop Panda can't follow
- Storybook or visual tests that need every recipe variant, whether or not a story calls it
- [`colorPalette`](/docs/styling/virtual-color#pregenerating-palettes) swapped at runtime
- Theme token vars you still need after [`removeUnusedTokens`](/docs/styling/optimization#unused-tokens)

## When not to

- **Open-ended values.** Prefer a CSS variable and [`token()`](/docs/styling/dynamic-styling#using-token) /
  [`token.var()`](/docs/styling/dynamic-styling#using-tokenvar). Don't pre-generate a whole category "just in case."
- **Literals already in source.** Extraction already covers `css({ color: 'red.300' })` and
  `<Button size="sm" />`. Adding those to `staticCss` only duplicates work.
- **`recipes: '*'` in a production app.** Fine for Storybook. Heavy for shipping CSS.

## Config shape

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  staticCss: {
    css: [], // utility classes
    recipes: {}, // config / slot recipes
    patterns: {}, // pattern props
    themes: [] // theme token vars to keep
  }
})
```

Every key is optional. Use only what you need.

### Utilities (`css`)

Each rule lists properties and values. `'*'` means every value that utility knows (token keys or enum values).

```ts filename="panda.config.ts"
export default defineConfig({
  staticCss: {
    css: [
      {
        properties: {
          color: ['red.300', 'blue.500'],
          padding: ['*', '50px']
        },
        conditions: ['hover'],
        responsive: true
      }
    ]
  }
})
```

- **`conditions`** — also emit under these states. Bare names like `'hover'` become `_hover` unless they already match
  a configured condition key. The base (unconditioned) class is always included.
- **`responsive: true`** — also emit under every breakpoint. That multiplies output, so reserve it for layout props.

With that config, a runtime value can pick a class that already exists:

```tsx
const [color, setColor] = useState('red.300')

// Works: `red.300` was pre-generated
<styled.button color={color} />
```

### Recipes

Use this when a config recipe's variant comes from a prop Panda can't extract. See
[dynamic variants](/docs/recipes/dynamic-variants).

Each rule lists **one variant key at a time**. `{ size: ['sm', 'md'] }` emits `size=sm` and `size=md` as separate
usages. Other variants fall back to `defaultVariants`.

```ts filename="panda.config.ts"
export default defineConfig({
  staticCss: {
    recipes: {
      button: [
        { size: ['sm', 'md'] },
        { variant: ['*'] } // every value of `variant`
      ],
      // Every variant on this recipe
      tooltip: ['*']
    }
  }
})
```

Declare it on the recipe instead of the top-level config if you prefer:

```ts
import { defineRecipe } from '@pandacss/dev'

const card = defineRecipe({
  className: 'card',
  base: { color: 'white' },
  variants: {
    size: {
      small: { fontSize: '14px' },
      large: { fontSize: '18px' }
    }
  },
  staticCss: [{ size: ['*'] }]
})
```

Generate every variant of every config and slot recipe (Storybook):

```ts filename="panda.config.ts"
export default defineConfig({
  staticCss: {
    recipes: '*'
  }
})
```

`recipes: '*'` at the root wins over per-recipe `staticCss`.

With [`smartCompoundVariants`](/docs/styling/optimization#compound-variants), only compounds that match an emitted
usage (including defaults) land in the sheet. List the variants you need, or leave smart compounds off.

### Patterns

Same idea as `css`, keyed by pattern name. The pattern's transform runs, then the result is encoded as atoms.

```ts filename="panda.config.ts"
export default defineConfig({
  staticCss: {
    patterns: {
      stack: [
        {
          properties: { gap: ['4', '8'] },
          responsive: true
        }
      ]
    }
  }
})
```

### Themes

If you use [multiple themes](/docs/theming/multiple-themes), list the theme names whose token CSS variables should
always ship. That matters when [`removeUnusedTokens`](/docs/styling/optimization#unused-tokens) is on: theme vars
listed here survive pruning even if extraction never saw them.

```ts filename="panda.config.ts"
export default defineConfig({
  staticCss: {
    themes: ['light', 'dark'],
    css: [{ properties: { color: ['fg', 'bg'] } }]
  }
})
```

## Keep it small

`staticCss` generates unconditionally. Anything you list can end up in the sheet whether a page uses it or not.

```ts filename="panda.config.ts"
export default defineConfig({
  // ❌ Every color × every condition × every breakpoint
  // staticCss: {
  //   css: [{
  //     conditions: ['hover', 'focus'],
  //     responsive: true,
  //     properties: { color: ['*'], backgroundColor: ['*'] }
  //   }]
  // }

  // ✅ Only values a runtime path can actually pick
  staticCss: {
    css: [
      {
        properties: {
          color: ['red.500', 'blue.500', 'gray.600']
        }
      }
    ],
    recipes: {
      button: [{ size: ['sm', 'md', 'lg'] }]
    }
  }
})
```

Wildcards are fine when the set is small (`fontWeight: ['*']`) or when Storybook truly needs every recipe variant.
`responsive: true` belongs on layout props (`display`, `width`, `flexDirection`), not on colors.

Panda warns when a `'*'` expands to a large set, and when a property, recipe, or variant name is unknown. See
[Diagnostics](/docs/reference/diagnostics).

For the broader CSS-size toolkit, see [Optimization](/docs/styling/optimization).

## See also

- [Dynamic Styles](/docs/styling/dynamic-styling) for the other runtime escapes (`token`, CSS variables, data attrs).
- [Optimization](/docs/styling/optimization) for `optimize` flags that pair with `staticCss`.
- [Storybook](/docs/get-started/storybook) for `recipes: '*'`.


---


## Style isolation

Load multiple Panda-built bundles on one page without class or token collisions.

Two independently built Panda bundles on the same page can emit the same class name, or the same CSS variable, with
different rules behind them. The cascade keeps one and silently drops the other. `prefix` and `cssVarRoot` stop
that.

## When you need this

Any setup that loads two or more independently built Panda stylesheets into one document:

- Webpack Module Federation, single-spa, qiankun, or other micro-frontend orchestrators
- Widgets injected into pages you do not control (Intercom-style embeds, browser extensions)
- Two versions of the same design system on one page, common mid-migration

If the bundles never share a document (iframes, Next.js multi-zone routing), you do not need this page. The cascade
cannot cross documents.

## Two kinds of collision

### Override leakage

Two bundles load the same styles, and one adds a local override:

```css
/* bundle 1 */
.ds-background { background-color: blue; }
.local-override { background-color: red; }

/* bundle 2 */
.ds-background { background-color: blue; }
```

Load order decides whether `.local-override` wins. Fix it with a
[cascade layer](/docs/styling/cascade-layers): unlayered styles always beat layered ones, so the override wins
regardless of load order.

```ts filename="panda.config.ts"
export default defineConfig({
  layers: {
    recipes: 'ds.recipes',
    utilities: 'ds.utilities'
  }
})
```

### Cross-version collision

Bundle A ships `@acme/ds@1`, bundle B ships `@acme/ds@2`. Both emit `.button` and `--colors-brand`, with different
values:

```css
/* v1's bundle */
:root { --colors-brand: #ea580c; }
.button { background: var(--colors-brand); padding: 8px 12px; }

/* v2's bundle */
:root { --colors-brand: #2563eb; }
.button { background: var(--colors-brand); padding: 20px 40px; }
```

Same selector, different rule. Layers do not help here: both versions emit into the same layer, and within a layer
load order still decides. This is what `prefix` is for.

## Set a prefix

Panda prepends `prefix` to every emitted class name and CSS variable:

```ts filename="panda.config.ts"
export default defineConfig({
  prefix: 'acme-v1'
})
```

```css
:where(:root, :host) {
  --acme-v1-colors-brand: #ea580c;
}

.acme-v1-button {
  background: var(--acme-v1-colors-brand);
}
```

A second bundle with `prefix: 'acme-v2'` emits `.acme-v2-button` and `--acme-v2-colors-brand`. Both sit in the same
`<head>` with nothing to fight over. Source code does not change: `css()`, `cva()`, and recipes read `prefix` from
config and emit the namespaced names.

## Derive the prefix

A hardcoded prefix drifts the moment you forget to bump it. Key it to the package name and major version:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'
import pkg from './package.json' with { type: 'json' }

const major = pkg.version.split('.')[0]
const slug = pkg.name.replace(/[@/]/g, '-').replace(/^-/, '')

export default defineConfig({
  prefix: `${slug}-v${major}` // @acme/ds@1.4.2 → acme-ds-v1
})
```

A 2.x release rotates the prefix on its own. Patch and minor releases share one, which matches how you already
reason about breaking changes.

## Who sets the prefix

- **The library ships a static CSS file** ([Consume without Panda](/docs/design-systems/consume-without-panda)):
  the library sets it, keyed to its own package and major version, because the CSS is frozen at the library's build
  time.
- **The apps run Panda** ([Consume with Panda](/docs/design-systems/consume-with-panda)): each app sets its own
  prefix, keyed to the app's identity. The design system does not bake one in. Two apps pinning different design
  system versions then emit `.app1-button` and `.app2-button`, and version isolation falls out without anyone
  tracking versions.

```ts filename="apps/checkout/panda.config.ts"
export default defineConfig({
  designSystem: '@acme/ds',
  prefix: 'checkout' // .button → .checkout-button
})
```

## Scope tokens with cssVarRoot

`prefix` renames the variables. If they should also apply only inside your subtree, set `cssVarRoot`:

```ts filename="panda.config.ts"
export default defineConfig({
  prefix: 'acme-v1',
  cssVarRoot: '.acme-v1-scope'
})
```

```tsx
<div className="acme-v1-scope">
  <Button>Click</Button>
</div>
```

Elements outside `.acme-v1-scope` cannot resolve the tokens. Optional: `prefix` alone covers most setups.

## Tokens still collide

Atomic classes from raw values never collide, because the value is in the name (`.bg_\#ea580c`). Token references
are the trap:

```tsx
const button = cva({
  base: { background: 'brand' }
})
// both versions emit .bg_brand { background: var(--colors-brand) }
```

The class names match across versions, so nothing clashes structurally. But each version declares `--colors-brand`
with a different value, the cascade picks one, and the losing bundle renders with the wrong brand color. `prefix`
fixes this too, by renaming the variable.

## Verify the output

Grep the emitted CSS for the names that used to collide:

```bash
grep -E "^\.button|--colors-brand:" styled-system/styles.css
```

Every match should carry your prefix. If not, check that `prefix` sits at the top level of `defineConfig`, not
inside `theme`, and regenerate.

## What prefix does not solve

- **Same-prefix collisions.** Two bundles that both pick `prefix: 'design'` collide as if neither had one. Choose
  it like a package name.
- **Reset collisions.** Preflight targets raw element selectors, so two resets fight regardless of prefix. Set
  `preflight: false` in bundles that ship into a host page, and let the host own the reset.
- **Hand-written CSS.** `prefix` applies to what Panda emits, nothing else.

For total isolation against an untrusted host, use an iframe or Shadow DOM. Heavier, but bulletproof.

## See also

- [Cascade Layers](/docs/styling/cascade-layers) for single-version override leakage
- [Hashing](/docs/styling/writing-styles#hashing) for short opaque class names instead of namespaces
- [Consume with Panda](/docs/design-systems/consume-with-panda) and
  [Consume without Panda](/docs/design-systems/consume-without-panda) for the design system setups above


---


## Style props

Pass CSS properties as props on styled.* elements. Same atomic CSS as css(), different authoring surface.

Style props are CSS properties on a JSX element. `bg="blue.500"` is the same atomic CSS as `css({ bg: 'blue.500' })`.

```tsx
import { css } from '../styled-system/css'
import { styled } from '../styled-system/jsx'

// className
<button className={css({ bg: 'blue.500', color: 'white', py: '2', px: '4' })} />

// style props
<styled.button bg="blue.500" color="white" py="2" px="4" />
```

`css`, `as`, and `className` are [factory props](#factory-props). Variants on `styled()` are
[Styled factory](/docs/recipes/styled-factory).

<Callout type="info">
  You need [`jsxFramework`](/docs/reference/config#jsxframework) in your config, or `styled-system/jsx` is not
  generated.
</Callout>

## Configure JSX

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  jsxFramework: 'react'
})
```

Panda supports React, Preact, Vue 3, and Solid. Then run `panda codegen`.

You can rename the factory with [`jsxFactory`](/docs/reference/config#jsxfactory).

## Using style props

```tsx
import { styled } from '../styled-system/jsx'

const Button = ({ children }) => (
  <styled.button bg="blue.500" color="white" py="2" px="4" rounded="md">
    {children}
  </styled.button>
)
```

`styled.button` is a shorthand for `styled('button')` when you only need style props.

## Factory props

Besides `bg` and `px`, the factory reads a few props itself. They are not CSS utilities.

### css

An extra style object, merged last among styles. Use it for conditions, selectors, or a style you already have as an
object.

```tsx
<styled.button
  bg="blue.500"
  css={{
    _hover: { bg: 'blue.600' },
    '&[data-active]': { bg: 'blue.700' }
  }}
>
  Click me
</styled.button>
```

One override on a custom component is also `css`. Named parts use `trackCss`, `slideCss`, and so on. See
[passing styles to custom components](/docs/styling/merging-styles#passing-styles-to-custom-components).

### className

Appended after the factory classes. Use it for a class you do not control, or a string from outside Panda.

```tsx
<styled.button bg="blue.500" className="external">
  Click me
</styled.button>
```

### as

Render a different element. Style props still apply.

```tsx
<styled.button as="a" href="https://panda-css.com" bg="blue.500">
  Docs
</styled.button>
```

### HTML attributes

`width`, `height`, `translate`, and `content` are style props, so they do not reach the DOM. Use the `html*` aliases
when you need the HTML attribute.

```tsx
<styled.img htmlWidth="40" htmlHeight="40" src="/logo.png" alt="" />
```

| Prop | Lands on the DOM as |
| --- | --- |
| `htmlWidth` | `width` |
| `htmlHeight` | `height` |
| `htmlTranslate` | `translate` |
| `htmlContent` | `content` |

## Property names

Extract reads the prop on the tag. `circleSize` is not `size`. `elementWidth` is not `width`. See
[Extraction rules](/docs/styling/extraction-rules).

## styled()

`styled()` wraps any element or component. The result accepts style props.

```tsx
import { styled } from '../styled-system/jsx'
import { Button } from 'component-library'

const StyledButton = styled(Button)

<StyledButton bg="blue.500" color="white" py="2" px="4">
  Button
</StyledButton>
```

To pass a recipe as the second argument, use [Styled factory](/docs/recipes/styled-factory).

## Factory options

The third argument is optional.

```ts
interface FactoryOptions<TProps> {
  dataAttr?: boolean
  defaultProps?: TProps
  shouldForwardProp?(prop: string, variantKeys: string[]): boolean
  forwardProps?: string[]
}
```

| Option | What it does |
| --- | --- |
| `dataAttr` | Sets `data-recipe={name}` when the recipe has a name |
| `defaultProps` | Sit under incoming props, so a caller can still override them |
| `shouldForwardProp` | Decides what reaches the DOM. By default, variants and CSS properties are not forwarded |
| `forwardProps` | Allowlist on top of `shouldForwardProp`. A forwarded prop no longer feeds the recipe |

```tsx
const Input = styled('input', {}, { forwardProps: ['size'] })

<Input size={4} />
```

`size` becomes an HTML attribute. It does not feed a recipe. To keep a key as a variant **and** pass it through, use
[`withProvider`](/docs/recipes/slot-recipe-context#forwarding-props).

### shouldForwardProp

Use a function when the list is not fixed, for example Framer Motion:

```tsx
import { styled } from '../styled-system/jsx'
import { motion, isValidMotionProp } from 'framer-motion'

const StyledMotion = styled(
  motion.div,
  {},
  {
    shouldForwardProp: (prop, variantKeys) =>
      isValidMotionProp(prop) || (!variantKeys.includes(prop) && !isCssProperty(prop))
  }
)
```

Recipe defaults and `unstyled` are on [Styled factory](/docs/recipes/styled-factory).

## Restricting style props

[`jsxStyleProps`](/docs/reference/config#jsxstyleprops) controls which props the factory treats as styles. Default is
`all`. Tighten it when you do not want `bg` on every component, or when you want a smaller JSX runtime.

```ts filename="panda.config.ts"
export default defineConfig({
  jsxStyleProps: 'minimal'
})
```

### all

Every style prop. This is the default.

```tsx
<styled.button bg="blue.500" px="4">
  Click me
</styled.button>
```

### minimal

The `css` prop, props that end in `Css`, and a pattern's or recipe's own props (like `gap` on `HStack`). Generic style props like `bg` and `px` no longer work.

```tsx
<styled.button css={{ bg: 'blue.500', px: '4' }}>Click me</styled.button>
<Carousel trackCss={{ width: '300px' }} />
<HStack gap="4" justify="space-between" />
```

### none

Style props are off. `<styled.div />` and `styled('div')` are invalid. `css()` and a recipe on `styled()` still work.

```tsx
<button className={css({ bg: 'blue.500' })}>Click me</button>

const Button = styled('button', {
  base: { bg: 'blue.500' }
})
```

## Making your own styled components

`splitCssProps` pulls style props off a hand-written component.

```tsx
import { css } from '../styled-system/css'
import { splitCssProps } from '../styled-system/jsx'
import type { HTMLStyledProps } from '../styled-system/types'

export function Component(props: HTMLStyledProps<'div'>) {
  const [cssProps, restProps] = splitCssProps(props)
  const { css: cssProp, ...styleProps } = cssProps

  const className = css({ display: 'flex', height: '20', width: '20' }, styleProps, cssProp)

  return <div {...restProps} className={className} />
}

<Component w="2">Click me</Component>
```

## TypeScript

### Style object

`JsxStyleProps` is the style-object shape.

```tsx
import type { JsxStyleProps } from '../styled-system/types'

interface ButtonProps {
  color?: JsxStyleProps['color']
}
```

### Style props

`HTMLStyledProps` is the element plus style props.

```tsx
import type { HTMLStyledProps } from '../styled-system/jsx'

type ButtonProps = HTMLStyledProps<'button'>
```

### Variant props

`StyledVariantProps` reads variants off a `styled()` component.

```tsx
import { styled } from '../styled-system/jsx'
import type { StyledVariantProps } from '../styled-system/jsx'

const Button = styled('button', {
  base: { color: 'black' },
  variants: {
    state: {
      error: { color: 'red' },
      success: { color: 'green' }
    }
  }
})

type ButtonVariantProps = StyledVariantProps<typeof Button>
//   { state?: 'error' | 'success' | undefined }
```

### Patterns

Each pattern has a matching props type.

```tsx
import type { StackProps } from '../styled-system/jsx'
```

## See also

- [Extraction rules](/docs/styling/extraction-rules)
- [Styled factory](/docs/recipes/styled-factory)
- [Patterns](/docs/styling/patterns)
- [jsx/ reference](/docs/reference/jsx)


---


## View Transitions

Style View Transitions API animations with a shared class. You still set a unique name per element.

## How it works

The View Transitions API needs two things:

1. **A unique `view-transition-name`** on each element (duplicates break the transition)
2. **Shared animation CSS** for `::view-transition-old(*)` / `::view-transition-new(*)` and friends

Panda can't own the name. Those have to stay unique, so it can't extract or dedupe them. Instead,
`viewTransition()` returns a class built on
[`view-transition-class`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class).

```ts
import { viewTransition } from 'styled-system/css'

const slide = viewTransition({
  group: {
    animationDuration: '0.4s',
    animationTimingFunction: 'ease-in-out'
  },
  old: { opacity: 0 },
  new: { opacity: 1 }
})
// → "vt_xxx"
```

```css
.vt_xxx {
  view-transition-class: vt_xxx;
}

::view-transition-group(.vt_xxx) {
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
}

::view-transition-old(.vt_xxx) {
  opacity: 0;
}

::view-transition-new(.vt_xxx) {
  opacity: 1;
}
```

## Pseudo-elements

| Option      | Selector                              |
| ----------- | ------------------------------------- |
| `group`     | `::view-transition-group(.vt_*)`      |
| `imagePair` | `::view-transition-image-pair(.vt_*)` |
| `old`       | `::view-transition-old(.vt_*)`        |
| `new`       | `::view-transition-new(.vt_*)`        |

Each option takes a style object, same shape as `css()`. Set `animationName` to a theme keyframe or any animation name.

## Framework usage

`viewTransition()` only returns the class. How you set `view-transition-name` depends on the framework.

### React

Needs a React build that exports `<ViewTransition>` (Canary / Experimental), or Next.js with
`experimental.viewTransition: true`.

```tsx
import { ViewTransition } from 'react'
import { viewTransition } from 'styled-system/css'

const slide = viewTransition({
  group: { animationDuration: '0.4s' },
  old: { opacity: 0 },
  new: { opacity: 1 }
})

<ViewTransition name="hero" share={slide}>
  <img src="/hero.jpg" alt="Hero" />
</ViewTransition>
```

Pass the class into `enter`, `exit`, `share`, `update`, or `default`. Use `name` when elements should morph into each
other.

### Astro

Astro owns the name via `transition:name`. Put the class on the element:

```astro
---
import { viewTransition } from '../styled-system/css'

const slide = viewTransition({
  group: { animationDuration: '0.4s' },
  old: { opacity: 0 },
  new: { opacity: 1 }
})
---

<img class={slide} transition:name="hero" src="/hero.jpg" alt="Hero" />
```

Enable client routing with `<ClientRouter />` from `astro:transitions`, or the browser never starts a transition.

### Other frameworks

Set both the class and the name yourself:

```tsx
<img
  className={slide}
  style={{ viewTransitionName: 'hero' }}
  src="/hero.jpg"
  alt="Hero"
/>
```

## Named transitions

Register reusable bags in `theme.viewTransitions`, then call them by name:

```ts filename="panda.config.ts"
import { defineConfig, defineViewTransitions } from '@pandacss/dev'

export default defineConfig({
  theme: {
    extend: {
      viewTransitions: defineViewTransitions({
        slide: {
          group: { animationDuration: '0.4s' },
          old: { opacity: 0 },
          new: { opacity: 1 }
        }
      })
    }
  }
})
```

```tsx
import { ViewTransition } from 'react'
import { viewTransition } from 'styled-system/css'

<ViewTransition name="hero" share={viewTransition('slide')}>
  <img src="/hero.jpg" alt="Hero" />
</ViewTransition>
```

`viewTransition('slide')` returns `"vt_slide"`. A static name inlines at build time and drops the import. Unused names
stay out of the CSS.

## Design systems

Export a bag the same way you'd export a shared `cva`:

```ts
export const slide = viewTransition({
  old: { opacity: 0 },
  new: { opacity: 1 }
})
```

`panda lib` puts it in build info. Consuming apps get the CSS without re-scanning your source, and tree-shaking follows
imports like recipes. Or register the same bags in a preset's `theme.viewTransitions` and let apps call
`viewTransition('slide')`.


---


## Virtual Color

Panda allows you to create a virtual color or color placeholder in your project.

The `colorPalette` property is how you create virtual colors.

```js
import { css } from '../styled-system/css'

const className = css({
  colorPalette: 'blue',
  bg: 'colorPalette.100',
  _hover: {
    bg: 'colorPalette.500'
  }
})
```

This will translate to the `blue.100` background color and `blue.500` background color on hover.

Virtual colors are useful when creating easily customizable components.

## How Palettes Work

Every color group in your theme is a palette. The examples on this page use this theme:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    tokens: {
      colors: {
        blue: {
          100: { value: '#dbeafe' },
          500: { value: '#3b82f6' },
          700: { value: '#1d4ed8' }
        },
        gray: {
          100: { value: '#f3f4f6' },
          500: { value: '#6b7280' },
          700: { value: '#374151' }
        }
      }
    },
    semanticTokens: {
      colors: {
        blue: {
          solid: {
            bg: { value: '{colors.blue.500}' },
            fg: { value: 'white' }
          }
        },
        gray: {
          solid: {
            bg: { value: '{colors.gray.500}' },
            fg: { value: 'white' }
          }
        }
      }
    }
  }
})
```

Base and semantic tokens under the same name form one palette, so this theme produces four palettes. Each maps every
token below it to a virtual `colorPalette.*` token:

- `blue` and `gray`: `colorPalette.100`, `colorPalette.500`, `colorPalette.700`, `colorPalette.solid.bg`,
  `colorPalette.solid.fg`
- `blue.solid` and `gray.solid`: `colorPalette.bg`, `colorPalette.fg`

Use a top-level palette to reach all of its tokens:

```tsx
css({ colorPalette: 'blue', bg: 'colorPalette.solid.bg', color: 'colorPalette.solid.fg' })
```

Or use a nested group as the palette, so the virtual tokens start from that group:

```tsx
css({ colorPalette: 'blue.solid', bg: 'colorPalette.bg', color: 'colorPalette.fg' })
```

### Default Values

A `DEFAULT` token makes the bare `colorPalette` token resolve to it:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          DEFAULT: { value: '{colors.blue.500}' },
          hover: { value: '{colors.blue.700}' }
        }
      }
    }
  }
})
```

```tsx
css({ colorPalette: 'brand', bg: 'colorPalette', _hover: { bg: 'colorPalette.hover' } })
```

## Usage

### With Recipes

You can also use virtual colors with recipes.

```js
import { cva } from '../styled-system/css'

const button = cva({
  base: {
    padding: 4
    // you can also specify a default colorPalette in the `base` recipe key
    // colorPalette: 'blue',
  },
  variants: {
    variant: {
      primary: { color: 'colorPalette.500' }
    }
  },
  defaultVariants: { variant: 'primary' }
})
```

### With Color Modes

You can also use virtual colors with different conditions, such as color modes.

```js
import { css, cva, cx } from '../styled-system/css'

const someButton = cva({
  base: { padding: 4 },
  variants: {
    variant: {
      primary: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.100' },
        color: { base: 'white', _dark: 'gray.700' }
      }
    }
  },
  defaultVariants: { variant: 'primary' }
})

export const App = () => {
  return (
    <>
      <div className="light">
        <button className={cx(css({ colorPalette: 'blue' }), someButton())}>Click me</button>
        <button className={cx(css({ colorPalette: 'gray' }), someButton())}>Click me</button>
      </div>
      <div className="dark">
        <button className={cx(css({ colorPalette: 'blue' }), someButton())}>Click me</button>
        <button className={cx(css({ colorPalette: 'gray' }), someButton())}>Click me</button>
      </div>
    </>
  )
}
```

### With Opacity Modifiers

Add `/opacity` to a virtual color in any color property:

```js
import { css } from '../styled-system/css'

const className = css({
  colorPalette: 'blue',
  bg: 'colorPalette.500/50',
  color: 'colorPalette.700'
})
```

To use it inside another value, like a shadow or a gradient, store it in a CSS variable with the
[token reference syntax](/docs/styling/color-opacity-modifier#using-a-custom-property):

```js
import { css } from '../styled-system/css'

const className = css({
  colorPalette: 'blue',
  '--ring': '{colors.colorPalette.500/50}',
  boxShadow: '0 0 0 2px var(--ring)'
})
```

## Pregenerating Palettes

Use the `staticCss` option in the config to pre-generate values for the `colorPalette` property. This is useful when you
want to use a color palette that can be changed at runtime (e.g. in Storybook knobs).

> Learn more about [static css generation](/docs/styling/static).

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  staticCss: {
    css: [
      {
        properties: { colorPalette: ['blue', 'gray'] }
      }
    ]
  }
})
```

Then in your code, you can design components that use the `colorPalette` property:

```tsx
import { useState } from 'react'
import { css } from '../styled-system/css'

function ButtonShowcase() {
  const [colorPalette, setColorPalette] = useState('blue')

  return (
    <div>
      <select value={colorPalette} onChange={e => setColorPalette(e.currentTarget.value)}>
        <option value="blue">Blue</option>
        <option value="gray">Gray</option>
      </select>

      <button
        className={css({
          bg: 'colorPalette.100',
          color: 'colorPalette.700',
          colorPalette
        })}
      >
        Click me
      </button>
    </div>
  )
}
```

## Configuration

Use the `colorPalette` property in your theme to choose which palettes are generated.

### Include Palettes

Use `include` to list the palettes you want:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      include: ['gray']
    }
  }
})
```

Only `gray` is a palette now, and it keeps all of its tokens, including the nested ones:

```tsx
css({ colorPalette: 'gray', bg: 'colorPalette.solid.bg', color: 'colorPalette.100' })
```

Nested groups are palettes too. Include them with a glob pattern:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      include: ['gray.*'] // gray and gray.solid
    }
  }
})
```

### Exclude Palettes

Use `exclude` to drop palettes. Excluding a palette also drops its nested groups:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      exclude: ['blue'] // gray and gray.solid remain
    }
  }
})
```

`exclude` wins over `include`:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      include: ['gray', 'blue'],
      exclude: ['blue'] // only gray
    }
  }
})
```

### Keep Only Top-Level Palettes

Every nested group is a palette, so a theme with many nested groups per color (`gray.solid`, `gray.subtle`,
`gray.surface`, …) can produce hundreds of palette names. With `strictTokens`, that union can make TypeScript report
"Expression produces a union type that is too complex to represent" on components with spread props.

Exclude every nested name to keep only the top-level palettes:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      exclude: ['*.*'] // blue and gray, but not blue.solid or gray.solid
    }
  }
})
```

Every virtual token still works through the top-level palette:

```tsx
css({ colorPalette: 'gray', bg: 'colorPalette.solid.bg', color: 'colorPalette.100' })
```

### Disable Palettes

To turn off color palette generation entirely, set `enabled` to `false`:

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    colorPalette: {
      enabled: false
    }
  }
})
```


---


## Writing Styles

Panda generates the utilities you need to style your components with confidence.

Using the object syntax is a fundamental approach to writing styles in Panda. It not only provides a type-safe style
authoring experience, but also improves readability and ensures a consistent experience with style overrides.

> Start here for one-off styles. When a component grows variants, promote to a [recipe](/docs/recipes/atomic-recipe).
> The full ladder is in [Thinking in Panda](/docs/get-started/thinking-in-panda).

## Atomic Styles

When you write styles in Panda, it generates a modern atomic stylesheet that is automatically scoped to the
`@layer utilities` cascade layer.

The atomic stylesheets approach offers several advantages, such as improved code maintainability and reusability, as
well as a smaller overall CSS footprint.

Panda exposes a `css` function that can be used to author styles. It accepts a style object and returns a className
string.

```jsx
import { css } from '../styled-system/css'

const styles = css({
  backgroundColor: 'gainsboro',
  borderRadius: '9999px',
  fontSize: '13px',
  padding: '10px 15px'
})

// Generated className:
// --> bg_gainsboro rounded_9999px fs_13px p_10px_15px

<div className={styles}>
  <p>Hello World</p>
</div>
```

The styles generated at build time end up like this:

```css
@layer utilities {
  .bg_gainsboro {
    background-color: gainsboro;
  }

  .rounded_9999px {
    border-radius: 9999px;
  }

  .fs_13px {
    font-size: 13px;
  }

  .p_10px_15px {
    padding: 10px 15px;
  }
}
```

### Shorthand Properties

Panda provides shorthands for common css properties to help improve the speed of development and reduce the visual
density of your style declarations.

Properties like `borderRadius`, `backgroundColor`, and `padding` can be swapped to their shorthand equivalent `rounded`,
`bg`, and `p`.

```jsx
import { css } from '../styled-system/css'

// BEFORE - Good
const styles = css({
  backgroundColor: 'gainsboro',
  borderRadius: '9999px',
  fontSize: '13px',
  padding: '10px 15px'
})

// AFTER - Better
const styles = css({
  bg: 'gainsboro',
  rounded: '9999px',
  fontSize: '13px',
  p: '10px 15px'
})
```

> Shorthands are documented alongside their respective properties in the [utilities](/docs/reference/background)
> section.

### Type safety

Panda provides TypeScript types for all style properties and shorthands. Most of the style properties are connected to
either the native CSS properties or their respective token value defined as defined in the `theme` object.

```ts
import { css } from '../styled-system/css'

//                       ⤵ you'll get autocomplete for colors
const styles = css({ bg: '|' })
```

> You can also enable the `strictTokens: true` setting in the Panda configuration. This allows only token values and
> prevents the use of custom or raw CSS values.

- `config.strictTokens` will only affect properties that have config tokens, such as `color`, `bg`, `borderColor`, etc.
- `config.strictPropertyValues` will throw for properties that do not have config tokens, such as `display`, `content`,
  `willChange`, etc. when the value is not a predefined CSS value.

> In both cases, you can use the `[xxx]` escape-hatch syntax to use custom or raw CSS values without TypeScript errors.

#### strictTokens

With `config.strictTokens` enabled, you can only use token values in your styles. This prevents the use of custom or raw
CSS values.

```ts filename="panda.config.ts"
import { css } from '../styled-system/css'

css({ bg: 'red' }) // ❌ Error: "red" is not a valid token value
css({ fontSize: '123px' }) // ❌ Error: "123px" is not a valid token value

css({ bg: 'red.400' }) // ✅ Valid
css({ fontSize: '[123px]' }) // ✅ Valid, since `[123px]` is using the escape-hatch syntax
css({ content: 'abc' }) // ✅ Valid, since `content` isn't bound to a config token
```

For one-off styles, you can always use the escape-hatch syntax `[xxx]` to use custom or raw CSS values without
TypeScript errors.

```ts filename="panda.config.ts"
import { css } from '../styled-system/css'

css({ bg: '[red]' }) // ✅ Valid, since `[red]` is using the escape-hatch syntax
css({ fontSize: '[123px]' }) // ✅ Valid, since `[123px]` is using the escape-hatch syntax
```

#### strictPropertyValues

With `config.strictPropertyValues` enabled, you can only use valid CSS values for properties that do have a predefined
list of values in your styles. This prevents the use of custom or raw CSS values.

```ts filename="panda.config.ts"
css({ display: 'flex' }) // ✅ Valid
css({ display: 'block' }) // ✅ Valid

css({ display: 'abc' }) // ❌ will throw error since 'abc' is not part of predefined values of 'display'
css({ pos: 'absolute123' }) // ❌ will throw error since 'absolute123' is not part of predefined values of 'position'
css({ display: '[var(--btn-display)]' }) // ✅ Valid, since `[var(--btn-display)]` is using the escape-hatch syntax

css({ content: '""' }) // ✅ Valid, since `content` does not have a predefined list of values
css({ flex: '0 1' }) // ✅ Valid, since `flex` does not have a predefined list of values
```

The `config.strictPropertyValues` option will only be applied to this exhaustive list of properties:

```ts
type StrictableProps =
  | 'alignContent'
  | 'alignItems'
  | 'alignSelf'
  | 'all'
  | 'animationComposition'
  | 'animationDirection'
  | 'animationFillMode'
  | 'appearance'
  | 'backfaceVisibility'
  | 'backgroundAttachment'
  | 'backgroundClip'
  | 'borderCollapse'
  | 'border'
  | 'borderBlock'
  | 'borderBlockEnd'
  | 'borderBlockStart'
  | 'borderBottom'
  | 'borderInline'
  | 'borderInlineEnd'
  | 'borderInlineStart'
  | 'borderLeft'
  | 'borderRight'
  | 'borderTop'
  | 'borderBlockEndStyle'
  | 'borderBlockStartStyle'
  | 'borderBlockStyle'
  | 'borderBottomStyle'
  | 'borderInlineEndStyle'
  | 'borderInlineStartStyle'
  | 'borderInlineStyle'
  | 'borderLeftStyle'
  | 'borderRightStyle'
  | 'borderTopStyle'
  | 'boxDecorationBreak'
  | 'boxSizing'
  | 'breakAfter'
  | 'breakBefore'
  | 'breakInside'
  | 'captionSide'
  | 'clear'
  | 'columnFill'
  | 'columnRuleStyle'
  | 'contentVisibility'
  | 'direction'
  | 'display'
  | 'emptyCells'
  | 'flexDirection'
  | 'flexWrap'
  | 'float'
  | 'fontKerning'
  | 'forcedColorAdjust'
  | 'isolation'
  | 'lineBreak'
  | 'mixBlendMode'
  | 'objectFit'
  | 'outlineStyle'
  | 'overflow'
  | 'overflowX'
  | 'overflowY'
  | 'overflowBlock'
  | 'overflowInline'
  | 'overflowWrap'
  | 'pointerEvents'
  | 'position'
  | 'resize'
  | 'scrollBehavior'
  | 'touchAction'
  | 'transformBox'
  | 'transformStyle'
  | 'userSelect'
  | 'visibility'
  | 'wordBreak'
  | 'writingMode'
```

## Nested Styles

Panda provides different ways of nesting style declarations. You can use the native css nesting syntax, or the built-in
pseudo props like `_hover` and `_focus`. Pseudo props are covered more in-depth in the next section.

### Native CSS Nesting

Panda supports the native css nesting syntax. You can use the `&` selector to create nested styles.

> **Important:** It is required to use the "&" character when nesting styles.

```jsx
<div
  className={css({
    bg: 'red.400',
    '&:hover': {
      bg: 'orange.400'
    }
  })}
/>
```

You can also target children and siblings using the `&` syntax.

```jsx
<div
  className={css({
    bg: 'red.400',
    '& span': {
      color: 'pink.400'
    }
  })}
/>
```

We recommend not using descendant selectors as they can lead to specificity issues when managing style overrides.
Colocating styles directly on the element is the preferred way of writing styles in Panda.

### Overlapping selectors

When two selectors have the same specificity, Panda orders them the same way every time, not by where you write them.
Nest the more specific one so it always wins.

```jsx
// ❌ both selectors have equal specificity, so the winner doesn't depend on the order you write them
css({
  '& [data-state]': { color: 'gray.500' },
  '& [data-state="open"]': { color: 'green.500' }
})

// ✅ nesting produces `[data-state][data-state="open"]`, which always wins
css({
  '& [data-state]': {
    color: 'gray.500',
    '&[data-state="open"]': { color: 'green.500' }
  }
})
```

### Using Pseudo Props

Panda provides a set of pseudo props that can be used to create nested styles. The pseudo props are prefixed with an
underscore `_` to avoid conflicts with the native pseudo selectors.

For example, to create a hover style, you can use the `_hover` pseudo prop.

```jsx
<div
  className={css({
    bg: 'red.400',
    _hover: {
      bg: 'orange.400'
    }
  })}
/>
```

> See the [pseudo props](/docs/styling/conditional-styles#reference) section for a list of all available pseudo props.

## Global styles

Global styles are useful for applying additional global resets or font faces. Use the `globalCss` property in the
`panda.config.ts` file to define global styles.

Global styles are inserted at the top of the stylesheet and are scoped to the `@layer base` cascade layer.

> For resets, global variables, theming patterns, and more examples, see [Global styles](/docs/styling/global-styles).

```js filename="panda.config.ts"
import { defineConfig, defineGlobalStyles } from '@pandacss/dev'

const globalCss = defineGlobalStyles({
  'html, body': {
    color: 'gray.900',
    lineHeight: '1.5'
  }
})

export default defineConfig({
  // ...
  globalCss
})
```

The styles generated at build time will look like this:

```css
@layer base {
  html,
  body {
    color: var(--colors-gray-900);
    line-height: 1.5;
  }
}
```

## Style Composition

### Merging styles

Passing multiple styles to the `css` function will deeply merge the styles, allowing you to override styles in a
predictable way.

```jsx
import { css } from '../styled-system/css'

const result = css({ mx: '3', paddingTop: '4' }, { mx: '10', pt: '6' })
//    ^? result = "mx_10 pt_6"
```

To design a component that supports style overrides, you can provide the `css` prop as a style object, and it'll be
merged correctly.

```tsx filename="src/components/Button.tsx"
import { css } from '../styled-system/css'

export const Button = ({ css: cssProp = {}, children }) => {
  const className = css({ display: 'flex', alignItems: 'center', color: 'black' }, cssProp)
  return <button className={className}>{children}</button>
}
```

Then you can use the `Button` component like this:

```tsx filename="src/app/page.tsx"
import { Button } from './Button'

export default function Page() {
  return (
    <Button css={{ color: 'pink', _hover: { color: 'red' } }}>
      will result in `class="d_flex items_center text_pink hover:text_red"`
    </Button>
  )
}
```

---

You can use this approach as well with the `{cvaFn}.raw`, `{svaFn.raw}` and `{patternFn}.raw` functions, allowing style
objects to be merged as expected in any situation.

**Pattern Example:**

```tsx filename="src/components/Button.tsx"
import { hstack } from '../styled-system/patterns'
import { css } from '../styled-system/css'

export const Button = ({ css: cssProp = {}, children }) => {
  // using the flex pattern
  const hstackProps = hstack.raw({
    border: '1px solid',
    _hover: { color: 'blue.400' }
  })

  // merging the styles
  const className = css(hstackProps, cssProp)

  return <button className={className}>{children}</button>
}
```

**CVA Example:**

```tsx filename="src/components/Button.tsx"
import { css, cva } from '../styled-system/css'

const buttonRecipe = cva({
  base: { display: 'flex', fontSize: 'lg' },
  variants: {
    variant: {
      primary: { color: 'white', backgroundColor: 'blue.500' }
    }
  }
})

export const Button = ({ css: cssProp = {}, children }) => {
  const className = css(
    // using the button recipe
    buttonRecipe.raw({ variant: 'primary' }),

    // adding style overrides (internal)
    { _hover: { color: 'blue.400' } },

    // adding style overrides (external)
    cssProp
  )

  return <button className={className}>{children}</button>
}
```

**SVA Example:**

```tsx filename="src/components/Button.tsx"
import { css, sva } from '../styled-system/css'

const checkbox = sva({
  slots: ['root', 'control', 'label'],
  base: {
    root: { display: 'flex', alignItems: 'center', gap: '2' },
    control: { borderWidth: '1px', borderRadius: 'sm' },
    label: { marginStart: '2' }
  },
  variants: {
    size: {
      sm: {
        control: { width: '8', height: '8' },
        label: { fontSize: 'sm' }
      },
      md: {
        control: { width: '10', height: '10' },
        label: { fontSize: 'md' }
      }
    }
  },
  defaultVariants: {
    size: 'sm'
  }
})

export const Checkbox = ({ rootProps, controlProps, labelProps }) => {
  // using the checkbox recipe
  const slotStyles = checkbox.raw({ size: 'md' })

  return (
    <label className={css(slotStyles.root, rootProps)}>
      <input type="checkbox" className={css({ srOnly: true })} />
      <div className={css(slotStyles.control, controlProps)} />
      <span className={css(slotStyles.label, labelProps)}>Checkbox Label</span>
    </label>
  )
}

// Usage

const App = () => {
  return (
    <Checkbox
      rootProps={css.raw({ gap: 4 })}
      controlProps={css.raw({ borderColor: 'yellow.400' })}
      labelProps={css.raw({ fontSize: 'lg' })}
    />
  )
}
```

### Classname concatenation

Panda provides a simple `cx` function to join classnames. It accepts a list of classnames and returns a string.

```jsx
import { css, cx } from '../styled-system/css'

const styles = css({
  borderWidth: '1px',
  borderRadius: '8px',
  paddingX: '12px',
  paddingY: '24px'
})

const Card = ({ className, ...props }) => {
  const rootClassName = cx('group', styles, className)
  return <div className={rootClassName} {...props} />
}
```

### Hashing

When debugging or previewing DOM elements in the browser, the length of the generated atomic `className` can get quite
long, and a bit annoying. If you prefer to have terser classnames, use the `hash` option to enable className and css
variable name hashing.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  hash: true
})
```

> You might need to generate a new code artifact by running `panda codegen --clean`

When you write a style like this:

```jsx
import { css } from '../styled-system/css'

const styles = css({
  display: 'flex',
  flexDirection: 'row',
  _hover: {
    bg: 'red.50'
  }
})
```

The hash generated css will look like:

```css
.fPSBzf {
  display: flex;
}

.ksWBqx {
  flex-direction: row;
}

.btpEVp:is(:hover, [data-hover]) {
  background: var(--bINrJX);
}
```

> Use [`hash`](/docs/reference/config#hash) in production only. It makes debugging harder.

## Important styles

Applying important styles works just like CSS

```js
css({
  color: 'red !important'
})
```

You can also apply important using just the exclamation syntax `!`

```js
css({
  color: 'red!'
})
```

## TypeScript

Use the `SystemStyleObject` type if you want to type your styles.

```ts {2}
import { css } from '../styled-system/css'
import type { SystemStyleObject } from '../styled-system/types'

const styles: SystemStyleObject = {
  color: 'red'
}
```

## Property conflicts

When you combine shorthand and longhand properties, Panda resolves them predictably: the longhand wins, whatever order
you write them in. Panda sorts atomic rules by how broad each property is, so the narrower longhand emits last and
overrides the shorthand.

```jsx
import { css } from '../styled-system/css'

const styles = css({
  paddingTop: '20px',
  padding: '10px'
})
```

The styles generated at build time will look like this:

```css
@layer utilities {
  .p_10px {
    padding: 10px;
  }

  .pt_20px {
    padding-top: 20px;
  }
}
```

`.pt_20px` emits after `.p_10px`, so the element gets `10px` padding on three sides and `20px` on top.

## Global vars

You can use the `globalVars` property to define global
[CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) or custom CSS
[`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) definitions.

Panda will automatically generate the corresponding CSS variables and suggest them in your style objects.

> They will be generated in the [`cssVarRoot`](/docs/reference/config#cssvarroot) near your tokens.

This can be especially useful when using a 3rd party library that provides custom CSS variables, like a popper library
that exposes a `--popper-reference-width`.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  globalVars: {
    '--popper-reference-width': '4px',
    // you can also generate a CSS @property
    '--button-color': {
      syntax: '<color>',
      inherits: false,
      initialValue: 'blue'
    }
  }
})
```

> Note: Keys defined in `globalVars` will be available as a value for _every_ utilities, as they're not bound to token
> categories.

```ts
import { css } from '../styled-system/css'

const className = css({
  '--button-color': 'colors.red.300',
  // ^^^^^^^^^^^^  will be suggested

  backgroundColor: 'var(--button-color)'
  //                ^^^^^^^^^^^^^^^^^^  will be suggested
})
```


---

_This content is automatically generated from the official Panda CSS documentation._
