# Panda CSS Reference

> This document contains all reference documentation for Panda CSS

## Table of Contents

- [Background](#background)
- [Border](#border)
- [CLI Reference](#cli-reference)
- [Configuring Panda](#configuring-panda)
- [Config Functions](#config-functions)
- [css/](#css/)
- [Debugging](#debugging)
- [Deprecations](#deprecations)
- [Diagnostics Reference](#diagnostics-reference)
- [Display](#display)
- [Divide](#divide)
- [Effects](#effects)
- [Flex and Grid](#flex-and-grid)
- [Focus Ring](#focus-ring)
- [Gradients](#gradients)
- [Helpers](#helpers)
- [Interactivity](#interactivity)
- [jsx/](#jsx/)
- [Layout](#layout)
- [List](#list)
- [Masks](#masks)
- [Outline](#outline)
- [patterns/](#patterns/)
- [Plugins](#plugins)
- [recipes/](#recipes/)
- [Sizing](#sizing)
- [Spacing](#spacing)
- [Styled System](#styled-system)
- [SVG](#svg)
- [Tables](#tables)
- [tokens/](#tokens/)
- [Transforms](#transforms)
- [Transitions](#transitions)
- [types/](#types/)
- [Typography](#typography)

---


## Background

Panda provides the following utilities or style properties for styling background colors, gradients, and images.

Use these utilities to style background colors, gradients, and images.

## Background Colors

```jsx
<div className={css({ bg: 'red.200' })} />
<div className={css({ bg: 'blue.200/30' })} /> // with alpha
```

| Prop                         | CSS Property       | Token Category |
| ---------------------------- | ------------------ | -------------- |
| `bg`, `background`           | `background`       | `colors`       |
| `bgColor`, `backgroundColor` | `background-color` | `colors`       |
| `bgGradient`                 | `background-image` | `gradients`    |

## Background Gradients

Properties to create a background gradient based on color stops.

```jsx
<div
  className={css({
    bgGradient: 'to-r',
    gradientFrom: 'red.200',
    gradientTo: 'blue.200'
  })}
/>
```

Background and text gradients can be connected to design tokens. Here's how to define a gradient token in your theme.

```ts
const theme = {
  tokens: {
    gradients: {
      // string value
      simple: { value: 'linear-gradient(to right, red, blue)' },
      // composite value
      primary: {
        value: {
          type: 'linear',
          placement: 'to right',
          stops: ['red', 'blue']
        }
      }
    }
  }
}
```

These tokens can be used in the `bgGradient` or `textGradient` properties.

```jsx
<div
  className={css({
    bgGradient: "simple",
  })}
/>

<div
  className={css({
    bgGradient: "primary",
  })}
/>
```

| Prop           | CSS Property       | Token Category |
| -------------- | ------------------ | -------------- |
| `bgGradient`   | `background-image` | `gradients`    |
| `textGradient` | `background-image` | `gradients`    |
| `gradientFrom` | `--gradient-from`  | `colors`       |
| `gradientTo`   | `--gradient-to`    | `colors`       |
| `gradientVia`  | `--gradient-via`   | `colors`       |

## Background Position

Properties for controlling the src and position of a background image.

```jsx
<div
  className={css({
    bgImage: 'url(/images/bg.jpg)',
    bgPosition: 'center'
  })}
/>
```

| Prop                                   | CSS Property        | Token Category |
| -------------------------------------- | ------------------- | -------------- |
| `bgPosition`, `backgroundPosition`     | `background-image`  | none           |
| `bgPositionX`, `backgroundPositionX`   | `background-image`  | none           |
| `bgPositionY`, `backgroundPositionY`   | `background-image`  | none           |
| `bgAttachment` ,`backgroundAttachment` | `background-size`   | none           |
| `bgClip`, `backgroundClip`             | `background-size`   | none           |
| `bgOrigin`, `backgroundOrigin`         | `background-size`   | none           |
| `bgImage`, `backgroundImage`           | `background-size`   | assets         |
| `bgRepeat`, `backgroundRepeat`         | `background-repeat` | none           |
| `bgBlendMode`, `backgroundBlendMode`   | `background-size`   | none           |
| `bgSize`, `backgroundSize`             | `background-size`   | none           |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Background', 'Color']} />


---


## Border

Panda's border utilities.

Panda provides CSS properties for styling borders.

## Compound Properties

The border compound property maps to the `borders` token category.

| Prop                                | CSS Property        | Token Category |
| ----------------------------------- | ------------------- | -------------- |
| `border`                            | `border`            | `borders`      |
| `borderX` , `borderInline`          | `borderInline`      | `borders`      |
| `borderY` , `borderBlock`           | `borderBlock`       | `borders`      |
| `borderStart` , `borderInlineStart` | `borderInlineStart` | `borders`      |
| `borderEnd` , `borderInlineEnd`     | `borderInlineEnd`   | `borders`      |

## Border Radius

### All sides

```jsx
<div className={css({ borderRadius: 'md' })} />
<div className={css({ rounded: 'md' })} /> // shorthand
```

### Specific sides

Use the `border{Left|Right|Top|Bottom}Radius` properties, or the shorthand equivalent to apply border radius on a
specific side of an element.

```jsx
<div className={css({ borderTopRadius: 'md' })} />
<div className={css({ roundedTop: 'md' })} /> // shorthand

<div className={css({ borderLeftRadius: 'md' })} />
<div className={css({ roundedLeft: 'md' })} /> // shorthand
```

### Specific corners

Use the `border{Top|Bottom}{Left|Right}Radius` properties, or the shorthand equivalent to round a specific corner.

```jsx
<div className={css({ borderTopLeftRadius: 'md' })} />
<div className={css({ roundedTopLeft: 'md' })} /> // shorthand
```

| Prop                                     | CSS Property                        | Token Category |
| ---------------------------------------- | ----------------------------------- | -------------- |
| `rounded`,`borderRadius`                 | `border-radius`                     | `radii`        |
| `roundedTopLeft`,`borderTopLeftRadius`   | `border-top-left-radius`            | `radii`        |
| `roundedTopRight`,`borderTopRight`       | `border-top-right-radius`           | `radii`        |
| `roundedBottomRight`,`borderBottomRight` | `border-bottom-right-radius`        | `radii`        |
| `roundedBottomLeft`,`borderBottomLeft`   | `border-bottom-left-radius`         | `radii`        |
| `roundedTop`,`borderTopRadius`           | `border-top-{left+right}-radius`    | `radii`        |
| `roundedRight`,`borderRightRadius`       | `border-{top+bottom}-right-radius`  | `radii`        |
| `roundedBottom`,`borderBottomRadius`     | `border-bottom-{left+right}-radius` | `radii`        |
| `roundedLeft`,`borderLeftRadius`         | `border-{top+bottom}-left-radius`   | `radii`        |

### Logical Properties

Panda also provides the logical properties for border radius, which map to corresponding physical properties based on
the document's writing mode.

> For example, `borderStartRadius` will map to `border-left-radius` in LTR mode, and `border-right-radius` in RTL mode.

```jsx
<div className={css({ borderStartRadius: 'md' })} />
<div className={css({ roundedStart: 'md' })} /> // shorthand
```

| Prop                                         | CSS Property                      | Token Category |
| -------------------------------------------- | --------------------------------- | -------------- |
| `roundedStartStart`,`borderStartStartRadius` | `border-start-start-radius`       | `radii`        |
| `roundedStartEnd`,`borderStartEndRadius`     | `border-start-end-radius`         | `radii`        |
| `roundedStart`,`borderStartRadius`           | `border-{start+end}-start-radius` | `radii`        |
| `roundedEndStart`,`borderEndStartRadius`     | `border-end-start-radius`         | `radii`        |
| `roundedEndEnd`,`borderEndEndRadius`         | `border-end-end-radius`           | `radii`        |
| `roundedEnd` ,`borderEndRadius`              | `border-{start+end}-end-radius`   | `radii`        |

## Border Width

### All sides

```jsx
<div className={css({ borderWidth: '1px' })} />
```

### Specific sides

Use the `border{Left|Right|Top|Bottom}Width` properties, to apply border width on a specific side of an element.

```jsx
<div className={css({ borderTopWidth: '1px' })} />
<div className={css({ borderLeftWidth: '1px' })} />
```

| Prop                                 | CSS Property                |
| ------------------------------------ | --------------------------- |
| `borderWidth`                        | `border-width`              |
| `borderTopWidth`                     | `border-top-width`          |
| `borderLeftWidth`                    | `border-left-width`         |
| `borderRightWidth`                   | `border-right-width`        |
| `borderBottomWidth`                  | `border-bottom-width`       |
| `borderXWidth` , `borderInlineWidth` | `border-{left+right}-width` |
| `borderYWidth` , `borderBlockWidth`  | `border-{top+bottom}-width` |

### Logical Properties

Panda also provides the logical properties for border width, which map to corresponding physical properties based on the
document's writing mode.

> For example, `borderStartWidth` will map to `border-left-width` in LTR mode, and `border-right-width` in RTL mode.

```jsx
<div className={css({ borderStartWidth: '1px' })} />
```

| Prop                                          | CSS Property               |
| --------------------------------------------- | -------------------------- |
| `borderStartWidth` , `borderInlineStartWidth` | `border-{start+end}-width` |
| `borderEndWidth` , `borderInlineEndWidth`     | `border-{start+end}-width` |

## Border Color

The border color utilities are used to set the border color of an element. It references the `colors` token category.

### All sides

```jsx
<div className={css({ borderColor: 'primary' })} />
```

### Specific sides

Use the `border{Left|Right|Top|Bottom}Color` properties to apply border color on a specific side of an element.

```jsx
<div className={css({ borderTopColor: 'primary' })} />
<div className={css({ borderLeftColor: 'primary' })} />
```

| Prop                | CSS Property          | Token Category |
| ------------------- | --------------------- | -------------- |
| `borderColor`       | `border-color`        | `colors`       |
| `borderTopColor`    | `border-top-color`    | `colors`       |
| `borderLeftColor`   | `border-left-color`   | `colors`       |
| `borderRightColor`  | `border-right-color`  | `colors`       |
| `borderBottomColor` | `border-bottom-color` | `colors`       |

### Logical Properties

Panda also provides the logical properties for border color, which map to corresponding physical properties based on the
document's writing mode.

> For example, `borderInlineStartColor` will map to `border-left-color` in LTR mode, and `border-right-color` in RTL
> mode.

```jsx
<div className={css({ borderInlineStartColor: 'red.500' })} />
```

| Prop                                          | CSS Property               | Token Category |
| --------------------------------------------- | -------------------------- | -------------- |
| `borderStartColor` , `borderInlineStartColor` | `border-{start+end}-color` | `colors`       |
| `borderEndColor` , `borderInlineEndColor`     | `border-{start+end}-color` | `colors`       |
| `borderXColor`, `borderInlineColor`           | `border-inline-color`      | `colors`       |
| `borderYColor`, `borderBlockColor`            | `border-block-color`       | `colors`       |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Border', 'Border Radius']} />


---


## CLI Reference

Use the Panda command-line interface to scaffold a project, generate your styled-system and CSS, and inspect what your project uses.

Use the `panda` CLI to scaffold a project, generate your styled-system and CSS, and inspect what your project uses.

The commands are:

| Command           | What it does                                                 |
| ----------------- | ------------------------------------------------------------ |
| `panda init`      | Scaffold `panda.config.ts` and run the first codegen         |
| `panda dev`       | Watch files and rebuild the system and CSS on change         |
| `panda build`     | Generate the system and CSS once (bare `panda` runs this)    |
| `panda check`     | Check generated files without writing (use in CI)            |
| `panda codegen`   | Generate the `styled-system` output only                     |
| `panda cssgen`    | Generate CSS only                                            |
| `panda analyze`   | Report token, recipe, and utility usage across your sources  |
| `panda doctor`    | Validate your setup and print a project summary              |
| `panda debug`     | Dump resolved config and per-file extraction for bug reports |
| `panda lib`       | Publish a design system other apps can consume               |
| `panda buildinfo` | Write a portable `panda.buildinfo.json` only                 |

## Shared flags

Most commands accept these flags.

| Flag                   | Description                                                                      | Related                              |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| `--cwd <dir>`          | Current working directory                                                        |                                      |
| `--config, -c <path>`  | Path to the Panda config file                                                    |                                      |
| `--json`               | Print the result as JSON (for scripts)                                           |                                      |
| `--format <format>`    | Diagnostic output format: `human`, `pretty`, `json`, or `github`                 |                                      |
| `--log-level <level>`  | Output level: `silent`, `error`, `warn`, `info`, or `debug`                      |                                      |
| `--max-warnings <n>`   | Fail when warning diagnostics exceed this count                                  |                                      |
| `--logfile <file>`     | Write human output to a log file                                                 |                                      |
| `--no-color`           | Disable ANSI colors (or set the `NO_COLOR` environment variable)                 |                                      |
| `--profile`            | Capture compiler timings — see [Profiling a slow build](#profiling-a-slow-build) |                                      |
| `--spec <path>`        | Also write the design system spec, optionally to a path                          | [JSON Spec](/docs/theming/json-spec) |
| `--trace`              | Enable compiler tracing                                                          |                                      |
| `--trace-output <fmt>` | Trace output: `fmt` or `chrome-json`                                             |                                      |
| `--trace-file <file>`  | Trace output file for `chrome-json` tracing                                      |                                      |

Commands that scan your source files (`dev`, `build`, `check`, `cssgen`, `analyze`, `debug`, `lib`, `buildinfo`) also
take `--include`:

| Flag               | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `--include <glob>` | Source globs to scan, replacing the config `include` list (repeat for more globs) |

Commands that watch (`dev`, `build`, `codegen`, `cssgen`, `lib`) also take:

| Flag                    | Description                              |
| ----------------------- | ---------------------------------------- |
| `--watch, -w`           | Watch files and rebuild on change        |
| `--watch-debounce <ms>` | Debounce watch rebuilds, in milliseconds |

`panda init` is the exception: it doesn't take `--watch`, `--max-warnings`, or the tracing flags.

---

## init

Scaffold Panda in a project. It creates `panda.config.ts` with the default presets, installs those presets, updates
`.gitignore`, and runs the first codegen into your `outdir`.

```bash
pnpm panda init

# Run the setup wizard
pnpm panda init --interactive

# Also emit a PostCSS config file
pnpm panda init --postcss
```

| Flag                          | Description                                            | Related                                                      |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `--interactive, -i`           | Run the setup wizard                                   | -                                                            |
| `--force, -f`                 | Overwrite an existing config file                      | -                                                            |
| `--postcss, -p`               | Emit a [PostCSS](https://postcss.org/) config file     | -                                                            |
| `--outdir <dir>`              | Output directory for generated files                   | [`config.outdir`](/docs/reference/config#outdir)             |
| `--out-extension <ext>`       | Generated runtime file extension: `ts`, `js`, or `mjs` | [`config.outExtension`](/docs/reference/config#outextension) |
| `--jsx-framework <framework>` | JSX framework: `react`, `preact`, `vue`, or `solid`    | [`config.jsxFramework`](/docs/reference/config#jsxframework) |
| `--jsx-style-props <mode>`    | JSX style props: `all`, `minimal`, or `none`           | -                                                            |
| `--strict-tokens`             | Set `strictTokens` to `true`                           | [`config.strictTokens`](/docs/reference/config#stricttokens) |
| `--skip-presets`              | Skip adding and installing the default presets         | -                                                            |
| `--no-gitignore`              | Don't update `.gitignore` with the output directory    | -                                                            |
| `--no-codegen`                | Don't run codegen after setup                          | -                                                            |

`panda init` also accepts the [shared flags](#shared-flags), except `--watch`, `--max-warnings`, and the tracing flags.

---

## dev

Watch your source files and rebuild the system and CSS on every change. This is `panda build --watch` under one name.

```bash
pnpm panda dev

# Restrict the scan to specific files
pnpm panda dev --include "./src/**/*.tsx"
```

| Flag                   | Description                                                  | Related                                              |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `--outdir <dir>`       | Output directory for generated files                         | [`config.outdir`](/docs/reference/config#outdir)     |
| `--outfile, -o <file>` | Output file for extracted CSS                                | -                                                    |
| `--splitting`          | Emit split CSS files (one per layer and recipe)              | -                                                    |
| `--clean`              | Clean the output directory before generating                 | -                                                    |
| `--polyfill`           | Polyfill cascade layers with `:not(#\\#)` for older browsers | [`config.polyfill`](/docs/reference/config#polyfill) |

`panda dev` also accepts the [shared flags](#shared-flags), `--include`, and `--watch-debounce`.

---

## build

Generate the system and CSS once. This is the default — bare `panda` runs `panda build`.

By default it scans and generates CSS for the whole project, following the `include` and `exclude` options in your
config.

```bash
pnpm panda

# Same thing, spelled out
pnpm panda build

# Scan a subset of files
pnpm panda build --include "./src/components/**"

# Split output into separate files per layer and recipe
pnpm panda build --splitting
```

| Flag                   | Description                                                  | Related                                              |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `--watch, -w`          | Watch files and rebuild on change                            | -                                                    |
| `--outdir <dir>`       | Output directory for generated files                         | [`config.outdir`](/docs/reference/config#outdir)     |
| `--outfile, -o <file>` | Output file for extracted CSS                                | -                                                    |
| `--splitting`          | Emit split CSS files (one per layer and recipe)              | -                                                    |
| `--clean`              | Clean the output directory before generating                 | -                                                    |
| `--polyfill`           | Polyfill cascade layers with `:not(#\\#)` for older browsers | [`config.polyfill`](/docs/reference/config#polyfill) |
| `--check`              | Check generated files without writing                        | -                                                    |

`panda build` also accepts the [shared flags](#shared-flags), `--include`, and `--watch-debounce`.

---

## check

Check that generated files are up to date without writing anything. It exits non-zero if the output is missing or stale,
so use it in CI to catch a `styled-system` that drifted from your config or source.

```bash
pnpm panda check
```

| Flag                   | Description                                          | Related                                              |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `--outdir <dir>`       | Output directory to check                            | [`config.outdir`](/docs/reference/config#outdir)     |
| `--outfile, -o <file>` | CSS file to check                                    | -                                                    |
| `--splitting`          | Check split CSS output instead of a single file      | -                                                    |
| `--polyfill`           | Account for the cascade-layer polyfill when checking | [`config.polyfill`](/docs/reference/config#polyfill) |

`panda check` also accepts the [shared flags](#shared-flags) and `--include`.

---

## codegen

Generate the `styled-system` output only, based on your config. This skips the source scan and CSS extraction — use it
when you only need the generated functions and types.

```bash
pnpm panda codegen

# Clean the output directory first
pnpm panda codegen --clean

# Rebuild when the config changes
pnpm panda codegen --watch
```

| Flag             | Description                                  | Related                                          |
| ---------------- | -------------------------------------------- | ------------------------------------------------ |
| `--watch, -w`    | Watch the config and rebuild on change       | -                                                |
| `--outdir <dir>` | Output directory for generated files         | [`config.outdir`](/docs/reference/config#outdir) |
| `--clean`        | Clean the output directory before generating | -                                                |
| `--check`        | Check generated files without writing        | -                                                |

`panda codegen` also accepts the [shared flags](#shared-flags) and `--watch-debounce`.

---

## cssgen

Generate CSS from your source files only. This skips codegen — use it when your `styled-system` already exists.

```bash
pnpm panda cssgen

# Only usage CSS (recipes and utilities), no reset/base/tokens
pnpm panda cssgen --minimal

# Split output into separate files per layer and recipe
pnpm panda cssgen --splitting
```

| Flag                   | Description                                                          | Related                                              |
| ---------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `--watch, -w`          | Watch files and rebuild on change                                    | -                                                    |
| `--outfile, -o <file>` | Output file for extracted CSS (default `./styled-system/styles.css`) | -                                                    |
| `--minimal`            | Emit usage CSS only (recipes and utilities)                          | -                                                    |
| `--minify, -m`         | Minify the emitted CSS (overrides `config.minify`)                   | [`config.minify`](/docs/reference/config#minify)     |
| `--splitting`          | Emit split CSS files (one per layer and recipe)                      | -                                                    |
| `--polyfill`           | Polyfill cascade layers with `:not(#\\#)` for older browsers         | [`config.polyfill`](/docs/reference/config#polyfill) |
| `--check`              | Check that the CSS is up to date without writing                     | -                                                    |

`panda cssgen` also accepts the [shared flags](#shared-flags), `--include`, and `--watch-debounce`.

### CSS output for monorepos

`--minimal` emits a package's usage CSS (recipes and utilities) without duplicating reset, base, and tokens. Emit the
full stylesheet once from the app or root:

1. **App or root:** `panda build` or `panda cssgen` for the full stylesheet.
2. **Per package:** `panda cssgen --minimal` for local usage CSS.
3. **Published libraries:** [`panda lib`](#lib), then consumers wire it in with `designSystem`.

### Splitting CSS into files

`--splitting` writes separate CSS files instead of one stylesheet, so you can load only the CSS a page needs or trace
which layer or recipe produced a rule.

With `--splitting`, Panda emits this structure:

```
styled-system/
├── styles.css              # @layer declarations + @imports for all layers
└── styles/
    ├── reset.css           # Preflight/reset CSS
    ├── global.css          # Global CSS styles
    ├── tokens.css          # Design token CSS variables
    ├── utilities.css       # Atomic utility classes
    ├── recipes.css         # @imports for all recipe files
    ├── recipes/
    │   ├── button.css      # Individual recipe: button
    │   ├── card.css        # Individual recipe: card
    │   └── ...             # Other recipes as separate files
    └── themes/
        ├── dark.css        # Theme-specific tokens (not auto-imported)
        └── light.css       # Theme-specific tokens (not auto-imported)
```

The main `styles.css` declares the layers and imports each layer file (but not the themes):

```css
/* styled-system/styles.css */
@layer reset, base, tokens, recipes, utilities;

@import './styles/reset.css';
@import './styles/global.css';
@import './styles/tokens.css';
@import './styles/recipes.css';
@import './styles/utilities.css';
```

You then choose how to import them:

```css
/* Option 1: Import everything (default) */
@import './styled-system/styles.css';

/* Option 2: Import specific layers only */
@import './styled-system/styles/tokens.css';
@import './styled-system/styles/utilities.css';

/* Option 3: Import specific recipes */
@import './styled-system/styles/recipes/button.css';
@import './styled-system/styles/recipes/card.css';

/* Option 4: Import a specific theme (when using multiple themes) */
@import './styled-system/styles/themes/oceanic.css';
```

---

## analyze

Report which tokens, recipes, utilities, patterns, and keyframes your project uses, and which configured ones no scanned
file touches. It scans the whole project, following your `include` and `exclude` options, and prints a summary followed
by one section per category. For what to do with the report, see [Find what nobody uses](/docs/design-systems/analyze).

```bash
pnpm panda analyze

# One section
pnpm panda analyze --scope utilities

# Only the configured names nobody uses, one per line
pnpm panda analyze --unused

# Write a JSON report
pnpm panda analyze --outfile analyze.json
```

| Flag               | Description                                                                                                    | Related |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ------- |
| `--scope <scope>`  | Print one section: `tokens`, `recipes`, `utilities`, `patterns`, or `keyframes` (`token`/`recipe` are aliases) | -       |
| `--limit <n>`      | Maximum rows per section in the terminal report                                                                | -       |
| `--unused`         | List only the configured names no scanned file uses, one per line; with `--scope`, names only                  | -       |
| `--outfile <path>` | Write the report as JSON to this path                                                                          | -       |

`panda analyze` also accepts the [shared flags](#shared-flags) and `--include`.

---

## doctor

Validate your setup and print a project summary — config path, source count, generated artifacts, conditions, token
categories, and utilities. It reports any config or diagnostic errors and exits non-zero when it finds them.

```bash
pnpm panda doctor

# Machine-readable output for scripts
pnpm panda doctor --json
```

`panda doctor` accepts the [shared flags](#shared-flags).

---

## debug

Dump the resolved config and per-file extraction results, useful for bug reports. More detail in the
[Debugging](/docs/reference/debugging) docs.

```bash
pnpm panda debug

# Print to stdout without writing files
pnpm panda debug --dry

# Only dump the resolved config
pnpm panda debug --only-config

# Bundle the dump into one archive to attach to an issue
pnpm panda debug --zip
```

| Flag             | Description                                              | Related |
| ---------------- | -------------------------------------------------------- | ------- |
| `--outdir <dir>` | Debug output directory (default `<styled-system>/debug`) | -       |
| `--dry`          | Print the dump to stdout instead of writing files        | -       |
| `--zip`          | Write the dump as a single `<outdir>.zip` archive        | -       |
| `--only-config`  | Only dump the resolved config, skip per-file extraction  | -       |

`panda debug` also accepts the [shared flags](#shared-flags) and `--include`. `--profile` writes files to disk, so it
can't be combined with `--dry`. `--zip` can't be combined with `--dry` or `--profile`.

---

## lib

Publish a design system so other apps share your tokens, recipes, and CSS without re-scanning your source. It writes
machine artifacts under `panda/` and syncs your package `exports`. This replaces the v1 `ship` command.

See [Build a design system](/docs/design-systems/build-a-design-system) and
[Consume with Panda](/docs/design-systems/consume-with-panda).

```bash
pnpm panda lib

# Built-only package: set the re-extract fallback globs yourself
pnpm panda lib --files './**/*.{js,mjs}'

# Stamp an explicit peer Panda range
pnpm panda lib --panda '^2.0.0'
```

| Flag                 | Description                                                                                     | Related |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| `--outdir, -o <dir>` | Output directory for the artifacts (default `dist`)                                             | -       |
| `--panda <range>`    | Peer Panda version range to stamp (defaults to your `@pandacss/dev` peer, or the running major) | -       |
| `--files <globs>`    | Re-extract fallback globs for consumers, relative to the output dir (repeat or comma-separate)  | -       |
| `--minify, -m`       | Minify the generated build-info JSON                                                            | -       |

`panda lib` also accepts the [shared flags](#shared-flags), `--include`, and `--watch` / `--watch-debounce`.

---

## buildinfo

Write a portable `panda.buildinfo.json` only. Prefer [`panda lib`](#lib) for shipping a library — this command is the
lower-level piece for cases where you just need the build-info artifact.

```bash
pnpm panda buildinfo

# Custom output path
pnpm panda buildinfo --outfile ./dist/panda.buildinfo.json
```

| Flag                   | Description                                                               | Related |
| ---------------------- | ------------------------------------------------------------------------- | ------- |
| `--outfile, -o <path>` | Output path (default `./<outdir>/panda.buildinfo.json`)                   | -       |
| `--panda <range>`      | Peer Panda version range to stamp (defaults to the running Panda's major) | -       |
| `--minify, -m`         | Minify the generated JSON                                                 | -       |

`panda buildinfo` also accepts the [shared flags](#shared-flags) and `--include`.

---

## Profiling a slow build

Add `--profile` to any command to capture where time goes, including time inside the Rust engine:

```bash
panda build --profile
```

It writes two files:

- `.panda/trace.json` — open it in `chrome://tracing` or [ui.perfetto.dev](https://ui.perfetto.dev)
- `.panda/timings.json` — per-span totals and the slowest files

## MCP server

The MCP (Model Context Protocol) server is no longer a `panda` subcommand. It ships as its own package, so you run it
directly:

```bash
npx -y @pandacss/mcp
```

See the [MCP Server guide](/docs/get-started/mcp-server) for setup and available tools.


---


## Configuring Panda

Customize how Panda works via the `panda.config.ts` file in your project.

Customize how Panda works via the `panda.config.ts` file in your project.

```js
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // your configuration options here...
})
```

## Output css options

### presets

**Type**: `(string | Preset | Promise<Preset>)[]`

**Default**: `[]`

The set of reusable and shareable configuration presets. Presets are explicit — Panda does not auto-inject any preset.
For the default utilities, tokens, and conditions, add `@pandacss/preset-base` and `@pandacss/preset-panda` yourself
(`panda init` scaffolds this for you). Without them you get a bare system.

Each preset you add is smartly merged with your config, with your own config acting as a set of overrides and
extensions.

```json
{
  "presets": ["@pandacss/preset-base", "@pandacss/preset-panda"]
}
```

### preflight

**Type**: `boolean` | `{ scope: string; }`

**Default**: `false`

Whether to enable css reset styles. See also [Global styles](/docs/styling/global-styles) for how reset interacts with
global variables and layering.

Enable preflight:

```json
{
  "preflight": true
}
```

You can also scope the preflight; Especially useful for being able to scope the CSS reset to only a part of the app for
some reason.

Enable preflight and customize the scope:

```json
{
  "preflight": { "scope": ".extension" }
}
```

The resulting `reset` css would look like this:

```css
.extension button,
.extension select {
  text-transform: none;
}

.extension table {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}
```

You can also set the level to `element` (defaults to `parent`) to only reset the elements that have the scope class
assigned.

```json
{
  "preflight": { "scope": ".extension", "level": "element" }
}
```

The resulting `reset` css would look like this:

```css
button.extension,
select.extension {
  text-transform: none;
}

table.extension {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}
```

### prefix

**Type**: `string | { cssVar?: string; className?: string }`

The namespace prefix for the generated css classes and css variables. Pass a string to prefix both, or an object to set
the css variable and class name prefixes separately.

Ex: when using a prefix of `panda-`

```json
{
  "prefix": "panda"
}
```

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return <div className={css({ color: 'blue.500' })} />
}
```

would result in:

```css
.panda-text_blue\.500 {
  color: var(--panda-colors-blue-500);
}
```

### layers

**Type**: `Partial<Layer>`

Cascade layers used in generated css.

Ex: when customizing the utilities layer

```json
{
  "layers": {
    "utilities": "panda_utilities"
  }
}
```

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return <div className={css({ color: 'blue.500' })} />
}
```

would result in:

```css
@layer panda_utilities {
  .text_blue\.500 {
    color: var(--colors-blue-500);
  }
}
```

You should update the layer in your root css also.

### separator

**Type**: `'_' | '=' | '-'`

**Default**: `'_'`

The separator for the generated css classes.

```json
{
  "separator": "_"
}
```

Using a `=` with:

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return <div className={css({ color: 'blue.500' })} />
}
```

would result in:

```css
.text\=blue\.500 {
  color: var(--colors-blue-500);
}
```

### minify

**Type**: `boolean`

**Default**: `false`

Whether to minify the generated css. This can be set to `true` to reduce the size of the generated css. Usually enabled
in production only:

```ts filename="panda.config.ts"
minify: process.env.NODE_ENV === 'production'
```

```json
{
  "minify": false
}
```

### hash

**Type**: `boolean | { cssVar: boolean; className: boolean }`

**Default**: `false`

Whether to hash the generated class names / css variables. This is useful if want to shorten the class names or css
variables. Usually enabled in production only, since hashed names are harder to read in DevTools:

```ts filename="panda.config.ts"
hash: process.env.NODE_ENV === 'production'
```

Hash the class names and css variables:

```json
{
  "hash": true
}
```

This

```tsx
import { css } from '../styled-system/css'

const App = () => {
  return <div className={css({ color: 'blue.500' })} />
}
```

would result in something that looks like:

```css
.dOFUTE {
  color: var(--cgpxvS);
}
```

You can also hash them individually.

E.g. only hash the css variables:

```json
{
  "hash": { "cssVar": true, "className": false }
}
```

Then the result looks like this:

```css
.text_blue\.500 {
  color: var(--cgpxvS);
}
```

Now only hash the class names:

```json
{
  "hash": { "cssVar": false, "className": true }
}
```

Then the result looks like this:

```css
.dOFUTE {
  color: var(--colors-blue-500);
}
```

### optimize

**Type**: `OptimizeOptions`

**Default**: `{}`

CSS emission optimizations. Every optimization is opt-in. See [Optimization](/docs/styling/optimization) for when to
turn each flag on.

```json
{
  "optimize": {
    "removeUnusedTokens": true,
    "removeUnusedKeyframes": true,
    "smartCompoundVariants": true,
    "treeshakeDesignSystem": true,
    "propertyFallback": true
  }
}
```

- `removeUnusedTokens` — remove unused token declarations based on extracted project usage.
- `removeUnusedKeyframes` — remove unused keyframes based on extracted project usage.
- `smartCompoundVariants` — narrow compound variant CSS to the variant combinations you actually use, instead of
  emitting every permutation.
- `treeshakeDesignSystem` — hydrate only the build-info modules for the design-system exports your app imports.
  Namespace and side-effect imports still hydrate everything.
- `propertyFallback` — also seed `@property` registrations as plain declarations, for engines that ignore `@property`
  (Safari &lt; 16.4, Firefox &lt; 128) and would otherwise drop declarations that read an unregistered variable.

`removeUnusedTokens` and `removeUnusedKeyframes` replace the cleanup people used to do in a `cssgen:done` hook.

## File system options

### cwd

**Type**: `string`

**Default**: `process.cwd()`

The current working directory.

```json
{
  "cwd": "src"
}
```

### outdir

**Type**: `string`

**Default**: `styled-system`

The output directory for the generated css.

```json
{
  "outdir": "styled-system"
}
```

### importMap

**Type**: `string | Partial<OutdirImportMap> | Array<string | Partial<OutdirImportMap>>`

**Default**:
`{ "css": "styled-system/css", "recipes": "styled-system/recipes", "patterns": "styled-system/patterns", "jsx": "styled-system/jsx" }`

Allows you to customize the import paths for the generated outdir.

```json
{
  "importMap": {
    "css": "@acme/styled-system",
    "recipes": "@acme/styled-system",
    "patterns": "@acme/styled-system",
    "jsx": "@acme/styled-system"
  }
}
```

You can also use a string to customize the base import path and keep the default entrypoints:

```json
{
  "importMap": "@scope/styled-system"
}
```

is the equivalent of:

```json
{
  "importMap": {
    "css": "@scope/styled-system/css",
    "recipes": "@scope/styled-system/recipes",
    "patterns": "@scope/styled-system/patterns",
    "jsx": "@scope/styled-system/jsx"
  }
}
```

Pass an array to match imports from more than one root, for example a shared design system package alongside the app's
own local `styled-system` output:

```json
{
  "importMap": ["@acme/styled-system", "./styled-system"]
}
```

Individual fields also accept an array of paths when only some categories need more than one root:

```json
{
  "importMap": {
    "css": ["@acme/styled-system/css", "./styled-system/css"],
    "recipes": "@acme/styled-system/recipes"
  }
}
```

A published design system uses [`designSystem`](#designsystem), not `importMap`. See
[Consume with Panda](/docs/design-systems/consume-with-panda). Use `importMap` when the package is a shared
styled-system that is **not** a `panda lib` manifest.

### designSystem

**Type**: `string`

Consume a published design system. Point this at the package and Panda resolves its manifest, merges its preset, and
applies its build info — you don't set `importMap` or list build info in `include`.

```json
{
  "designSystem": "@acme/design-system"
}
```

See [Consume with Panda](/docs/design-systems/consume-with-panda).

### include

**Type**: `string[]`

**Default**: `[]`

List of files glob to watch for changes.

```json
{
  "include": ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"]
}
```

### exclude

**Type**: `string[]`

**Default**: `[]`

List of files glob to ignore.

```json
{
  "exclude": []
}
```

### dependencies

**Type**: `string[]`

**Default**: `[]`

Explicit list of config related files that should trigger a context reload on change.

> We automatically track the config file and (transitive) files imported by the config file as much as possible, but
> sometimes we might miss some. You can use this option as a workaround for those edge cases.

```json
{
  "dependencies": ["path/to/files/**.ts"]
}
```

### outExtension

**Type**: `'ts' | 'js' | 'mjs'`

**Default**: `js`

File extension for generated javascript files.

```json
{
  "outExtension": "js"
}
```

### forceImportExtension

**Type**: `boolean`

**Default**: `false`

Whether generated import specifiers include the runtime file extension. When `outExtension` is `mjs`, this also emits
`.d.mts` instead of `.d.ts`.

```json
{
  "forceImportExtension": true
}
```

### polyfill

**Type**: `boolean`

**Default**: `false`

Polyfill CSS @layers at-rules for older browsers.

```json
{
  "polyfill": true
}
```

## Design token options

### shorthands

**Type**: `boolean`

**Default**: `true`

Whether to allow shorthand properties

```json
{
  "shorthands": true
}
```

Ex `true`:

```tsx
const styles = css({
  bgColor: 'gainsboro',
  p: '10px 15px'
})
```

Ex false:

```tsx
const styles = css({
  backgroundColor: 'gainsboro',
  padding: '10px 15px'
})
```

### cssVarRoot

**Type**: `string`

**Default**: `:where(:host, :root)`

The root selector for the css variables.

```json
{
  "cssVarRoot": ":where(:host, :root)"
}
```

### conditions

**Type**: `Extendable<Conditions>`

**Default**: `{}`

The css selectors or media queries shortcuts.

```json
{
  "conditions": { "hover": "&:hover" }
}
```

### globalCss

**Type**: `Extendable<GlobalStyleObject>`

**Default**: `{}`

The global styles for your project.

```json
{
  "globalCss": {
    "html, body": {
      "margin": 0,
      "padding": 0
    }
  }
}
```

### theme

**Type**: `Extendable<Theme>`

**Default**: `{}`

The theme configuration for your project.

```json
{
  "theme": {
    "tokens": {
      "colors": {
        "red": { "value": "#EE0F0F" },
        "green": { "value": "#0FEE0F" }
      }
    },
    "semanticTokens": {
      "colors": {
        "danger": { "value": "{colors.red}" },
        "success": { "value": "{colors.green}" }
      }
    }
  }
}
```

### themes

**Type**: `Extendable<ThemeVariantsMap>`

**Default**: `{}`

The theme variants configuration for your project.

```json
{
  "themes": {
    "primary": {
      "tokens": {
        "colors": {
          "text": { "value": "red" }
        }
      },
      "semanticTokens": {
        "colors": {
          "muted": { "value": "{colors.red.200}" },
          "body": {
            "value": {
              "base": "{colors.red.600}",
              "_osDark": "{colors.red.400}"
            }
          }
        }
      }
    },
    "secondary": {
      "tokens": {
        "colors": {
          "text": { "value": "blue" }
        }
      },
      "semanticTokens": {
        "colors": {
          "muted": { "value": "{colors.blue.200}" },
          "body": {
            "value": {
              "base": "{colors.blue.600}",
              "_osDark": "{colors.blue.400}"
            }
          }
        }
      }
    }
  }
}
```

### utilities

**Type**: `Extendable<UtilityConfig>`

**Default**: `{}`

The css utility definitions.

```js
{
  "utilities": {
    extend: {
      borderX: {
        values: ['1px', '2px', '4px'],
        shorthand: 'bx', // `bx` or `borderX` can be used
        transform(value, token) {
          return {
            borderInlineWidth: value,
            borderColor: token('colors.red.200'), // read the css variable for red.200
          }
        },
      },
    },
  }
}
```

### patterns

**Type**: `Extendable<Record<string, AnyPatternConfig>>`

**Default**: `{}`

Common styling or layout patterns for your project.

```js
{
  "patterns": {
    extend: {
      // Extend the default `flex` pattern
      flex: {
        properties: {
          // only allow row and column
          direction: { type: 'enum', value: ['row', 'column'] },
        },
      },
    },
  },
}
```

### staticCss

**Type**: `StaticCssOptions`

**Default**: `{}`

Used to generate css utility classes for your project.

```js
{
  "staticCss": {
    css: [
      {
        properties: {
          margin: ['*'],
          padding: ['*', '50px', '80px'],
        },
        responsive: true,
      },
      {
        properties: {
          color: ['*'],
          backgroundColor: ['green.200', 'red.400'],
        },
        conditions: ['light', 'dark'],
      },
    ],
  },
}
```

### strictTokens

**Type**: `boolean`

**Default**: `false`

Only allow token values and prevent custom or raw CSS values. Will only affect properties that have config tokens, such
as `color`, `bg`, `borderColor`, etc. [Learn more.](/docs/styling/writing-styles#type-safety)

```json
{
  "strictTokens": false
}
```

### strictPropertyValues

**Type**: `boolean`

**Default**: `false`

Only use valid CSS values for properties that do have a predefined list of values. Will throw for properties that do not
have config tokens, such as `display`, `content`, `willChange`, etc.
[Learn more.](/docs/styling/writing-styles#type-safety)

```json
{
  "strictPropertyValues": false
}
```

### globalFontface

**Type**: `GlobalFontfaceDefinition`

**Default**: `{}`

Global font face definitions.

```json
{
  "globalFontface": {
    "Inter": {
      "src": "url(/fonts/inter.woff2) format('woff2')",
      "fontWeight": "400",
      "fontStyle": "normal"
    },
    "Roboto": {
      "src": "url(/fonts/roboto.woff2) format('woff2')",
      "fontWeight": "400",
      "fontStyle": "normal"
    }
  }
}
```

Check out the [Custom Fonts](/docs/theming/fonts#global-font-face) guide for more information on how to use the
`globalFontface` option.

### globalVars

**Type**: `Extendable<GlobalVarsDefinition>`

**Default**: `{}`

The global CSS variables for your project. A plain string emits the variable directly; an object registers it with
`@property`, and only reaches the output if the stylesheet reads or writes it.

```json
{
  "globalVars": {
    "--some-color": "red",
    "--button-color": {
      "syntax": "<color>",
      "inherits": false,
      "initialValue": "blue"
    }
  }
}
```

## JSX options

### jsxFramework

**Type**: `'react' | 'solid' | 'preact' | 'vue' | (string & {})`

JS Framework for generated JSX elements.

```json
{
  "jsxFramework": "react"
}
```

### jsxFactory

**Type**: `string`

The factory name of the element

```json
{
  "jsxFactory": "panda"
}
```

Ex:

```tsx
<panda.button marginTop="40px">Click me</panda.button>
```

### jsxStyleProps

**Type**: `all` | `minimal` | `none`

**Default**: `all`

The style props allowed on generated JSX components

- When set to 'all', all style props are allowed.
- When set to 'minimal', only the `css` prop, props ending in `Css`, and a pattern's or recipe's own props are allowed. Generic style props like `bg` or `px` are not.
- When set to 'none', no style props are allowed and therefore the `jsxFactory` will not be usable as a component:
  - `<styled.div />` and `styled("div")` aren't valid
  - but the recipe usage is still valid `styled("div", { base: { color: "red.300" }, variants: { ...} })`

Ex with 'all':

```jsx
<styled.button marginTop="40px">Click me</styled.button>
```

Ex with 'minimal':

```jsx
<styled.button css={{ marginTop: '40px' }}>Click me</styled.button>
<HStack gap="4">...</HStack>
```

Ex with 'none':

```jsx
<button className={css({ marginTop: '40px' })}>Click me</button>
```

### jsxMatchTag

**Type**: `Array<{ tag?: string | RegExp; from?: string | RegExp; props?: string[]; ignore?: boolean }>`

Rules for which JSX components Panda reads style props from. The last rule that matches a component wins, over Panda's
own detection.

- `tag`: the component name as written, such as `Button` or `UI.Button`
- `from`: the import path as written
- `props`: read only these style props
- `ignore`: never read style props from the component

```js
{
  jsxMatchTag: [
    { from: '@tanstack/react-table', ignore: true },
    { tag: /Button$/, props: ['color'] }
  ]
}
```

See [extraction rules](/docs/styling/extraction-rules#choosing-which-components-panda-reads).

## Documentation options

### log level

**Type**: `'debug' | 'info' | 'warn' | 'error' | 'silent'`

**Default**: `info`

The log level for the built-in logger.

```json
{
  "logLevel": "info"
}
```

### validation

**Type**: `'none' | 'warn' | 'error'`

**Default**: `warn`

The validation strictness to use when validating the config.

- When set to 'none', no validation will be performed.
- When set to 'warn', warnings will be logged when validation fails.
- When set to 'error', errors will be thrown when validation fails.

```json
{
  "validation": "error"
}
```

## Other options

### plugins

**Type**: `PandaPlugin[]`

Plugins are objects with a `name` and a `hooks` map. There is no root-level `hooks` option. See the
[plugins reference](/docs/reference/plugins) for every hook, and [Plugins](/docs/theming/plugins) for how to write and
share one.

Plugins are called in sequence in the order they are defined in the `plugins` array, with the user's config called last.

```ts
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // ...
  plugins: [
    {
      name: 'local',
      hooks: {
        'cssgen:done': ({ content, path }) => {
          report({ bytes: content.length, path })
        }
      }
    }
  ]
})
```


---


## Config Functions

The define* helpers for authoring config, recipes, tokens, and themes in their own files with full type checking.

Use the `define*` helpers when you split your config across files. They give you autocomplete and type errors in files
that never import `defineConfig`.

## Why wrap?

Inside `defineConfig`, TypeScript knows what shape each object should have. Move a recipe into its own file and that
knowledge is gone:

```ts filename="recipes/button.ts"
// No autocomplete, and this mistake passes silently
export const button = {
  variants: { size: { sm: {}, md: {} } },
  defaultVariants: { size: 'lg' }
}
```

Wrap it and the editor checks it again:

```ts filename="recipes/button.ts"
import { defineRecipe } from '@pandacss/dev'

export const button = defineRecipe({
  variants: { size: { sm: {}, md: {} } },
  defaultVariants: { size: 'lg' } // ❌ '"lg"' is not assignable to '"sm" | "md"'
})
```

Each helper returns its argument unchanged, so there's no runtime cost.

## Config

### `defineConfig`

Wraps the [config](/docs/reference/config) object itself.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {},
  include: ['src/**/*.{js,jsx,ts,tsx}']
})
```

### `definePreset`

For a [preset](/docs/theming/presets#creating-a-preset).

```ts
import { definePreset } from '@pandacss/dev'

export const pandaPreset = definePreset({
  theme: {
    extend: {
      tokens: {
        colors: { primary: { value: 'blue.500' } }
      }
    }
  }
})
```

### `definePlugin`

For a [plugin](/docs/theming/plugins#share-a-plugin) that carries a shareable `hooks` map.

```ts
import { definePlugin } from '@pandacss/dev'

export const plugin = definePlugin({
  name: 'css-report',
  hooks: {
    'cssgen:done': ({ path, content }) => {
      console.log(`generated ${content.length} bytes`, path)
    }
  }
})
```

## Recipes and patterns

### `defineRecipe`

For a [config recipe](/docs/recipes/config-recipe).

```ts
import { defineRecipe } from '@pandacss/dev'

export const buttonRecipe = defineRecipe({
  className: 'button',
  description: 'The styles for the Button component',
  base: {
    display: 'flex'
  },
  variants: {
    visual: {
      funky: { bg: 'red.200', color: 'white' },
      edgy: { border: '1px solid {colors.red.500}' }
    }
  },
  defaultVariants: {
    visual: 'funky'
  }
})
```

### `defineSlotRecipe`

For a [config slot recipe](/docs/recipes/config-recipe#config-slot-recipe).

```ts
import { defineSlotRecipe } from '@pandacss/dev'

export const checkboxRecipe = defineSlotRecipe({
  className: 'checkbox',
  description: 'The styles for the Checkbox component',
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
```

### `defineStyles`

For a style object you want to reuse. Spread it into each variant instead of repeating the properties:

```ts {3, 14, 18} filename="recipes/button.ts"
import { defineRecipe, defineStyles } from '@pandacss/dev'

const buttonVisualStyles = defineStyles({
  borderRadius: 'lg',
  boxShadow: 'sm'
})

export const buttonRecipe = defineRecipe({
  // ...
  variants: {
    visual: {
      funky: {
        bg: 'red.200',
        color: 'white',
        ...buttonVisualStyles
      },
      edgy: {
        border: '1px solid {colors.red.500}',
        ...buttonVisualStyles
      }
    }
  }
})
```

### `definePattern`

For a [pattern](/docs/theming/patterns).

```ts
import { definePattern } from '@pandacss/dev'

const visuallyHidden = definePattern({
  transform(props) {
    return {
      srOnly: true,
      ...props
    }
  }
})
```

## Tokens

### `defineTokens`

```ts
import { defineTokens } from '@pandacss/dev'

const theme = {
  tokens: defineTokens({
    colors: {
      primary: { value: '#ff0000' }
    }
  })
}
```

Keeping one category per file? Use `defineTokens.colors(...)` to check against just the `colors` shape:

```ts filename="tokens/colors.ts"
import { defineTokens } from '@pandacss/dev'

export const colors = defineTokens.colors({
  primary: { value: '#ff0000' }
})
```

### `defineSemanticTokens`

For tokens whose value depends on a condition, like color mode.

```ts
import { defineSemanticTokens } from '@pandacss/dev'

const theme = {
  semanticTokens: defineSemanticTokens({
    colors: {
      primary: {
        value: { _light: '{colors.blue.400}', _dark: '{colors.blue.200}' }
      }
    }
  })
}
```

The per-category form works here too:

```ts filename="tokens/colors.semantic.ts"
import { defineSemanticTokens } from '@pandacss/dev'

export const colors = defineSemanticTokens.colors({
  primary: {
    value: { _light: '{colors.blue.400}', _dark: '{colors.blue.200}' }
  }
})
```

## Theme and global styles

### `defineKeyframes`

For [`@keyframes`](/docs/theming/theme#keyframes).

```ts
import { defineKeyframes } from '@pandacss/dev'

export const keyframes = defineKeyframes({
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' }
  }
})
```

### `defineGlobalStyles`

For [global styles](/docs/styling/global-styles).

```ts
import { defineGlobalStyles } from '@pandacss/dev'

const globalCss = defineGlobalStyles({
  'html, body': {
    color: 'gray.900',
    lineHeight: '1.5'
  }
})
```

### `defineGlobalFontface`

For [`globalFontface`](/docs/theming/fonts#global-font-face).

```ts
import { defineGlobalFontface } from '@pandacss/dev'

export const fonts = defineGlobalFontface({
  Inter: {
    src: 'url(/fonts/inter.woff2) format("woff2")',
    fontWeight: 400,
    fontStyle: 'normal'
  }
})
```

### `defineConditions`

For custom [conditions](/docs/theming/conditions).

```ts
import { defineConditions } from '@pandacss/dev'

export const conditions = defineConditions({
  groupHover: '.group:hover &',
  cardHover: '[data-card]:hover &'
})
```

### `defineUtility`

For a custom [utility](/docs/theming/utilities).

```ts
import { defineUtility } from '@pandacss/dev'

export const br = defineUtility({
  className: 'rounded',
  values: 'radii',
  transform(value) {
    return { borderRadius: value }
  }
})
```

### `defineViewTransitions`

For named [view transitions](/docs/styling/view-transition).

```ts
import { defineViewTransitions } from '@pandacss/dev'

export const viewTransitions = defineViewTransitions({
  slide: {
    group: { animationDuration: '0.4s' },
    old: { opacity: 0 },
    new: { opacity: 1 }
  }
})
```

### `definePositionTry`

For named [position-try fallbacks](/docs/styling/position-try).

```ts
import { definePositionTry } from '@pandacss/dev'

export const positionTry = definePositionTry({
  bottom: {
    top: 'anchor(bottom)',
    insetInlineStart: 'anchor(start)'
  }
})
```

### Text, layer, and animation styles

These have their own pages:

- [`defineTextStyles`](/docs/theming/text-styles)
- [`defineLayerStyles`](/docs/theming/layer-styles)
- [`defineAnimationStyles`](/docs/theming/animation-styles)

## Multiple themes

### `defineThemeVariant`

For a single theme variant, using the `{ tokens, semanticTokens }` shape from
[multi-theme tokens](/docs/theming/multiple-themes).

```ts
import { defineThemeVariant } from '@pandacss/dev'

export const darkTheme = defineThemeVariant({
  tokens: {
    colors: { bg: { value: '{colors.gray.900}' } }
  }
})
```

### `defineThemeContract`

Declare the tokens every theme must provide. It returns a stricter `defineThemeVariant` that rejects a theme missing any
of them. See [Theme contract](/docs/theming/multiple-themes#theme-contract).


---


## css/

The css/ folder — css(), cx(), cva(), sva(), viewTransition(), positionTry(), and keyframes().

**Folder:** `styled-system/css/`  
**Import:** `import { css, cx, cva, sva, viewTransition, positionTry, keyframes } from '../styled-system/css'`

Codegen writes one module per helper (`css/css.ts`, `css/cva.ts`, …) plus `css/index.ts` as the barrel. Every helper
maps a style object to a class name string. Panda extracts those styles at build time and emits atomic CSS. At runtime,
the helpers only resolve class names: no `<style>` tags, no theme context, no work on render. See
[How it works](/docs/get-started/why-panda#how-it-works).

## css()

Pass a style object, or several to merge, and get back a class name string.

```ts
import { css } from '../styled-system/css'

const className = css({
  bg: 'blue.500',
  color: 'white',
  px: '4',
  py: '2',
  rounded: 'md',
  _hover: { bg: 'blue.600' },
  md: { px: '5' }
})
// => "bg_blue.500 text_white px_4 py_2 rounded_md ..."
```

```tsx
<button className={className}>Save</button>
```

Multiple arguments, or arrays, merge in order. Later styles win for the same property:

```ts
css({ color: 'red.500' }, { color: 'blue.500' }) // blue wins
css([{ color: 'red.500' }, condition && { fontWeight: 'bold' }])
```

`css.raw()` returns the merged style object instead of a class name. Use it to pass styles into another helper, a
pattern, or a component without generating a class yet:

```ts
const base = css.raw({ display: 'flex', gap: '2' })
const styles = css(base, { p: '4' })
```

Guides: [Writing Styles](/docs/styling/writing-styles), [Merging Styles](/docs/styling/merging-styles),
[Conditional Styles](/docs/styling/conditional-styles).

## cx()

Joins class name strings into one, skipping `false`, `null`, and `undefined`:

```ts
import { css, cx } from '../styled-system/css'

const base = css({ display: 'flex', gap: '2' })
const active = css({ bg: 'blue.500', color: 'white' })

cx(base, isActive && active, className)
```

`cx()` does not merge style objects or resolve conflicts between utilities. Merge with `css()` first, then join the
result with other class strings:

```ts
// ❌ cx does not merge style objects
cx({ color: 'red' }, { color: 'blue' })

// ✅ merge with css, then join with cx
cx(css({ color: 'red' }, { color: 'blue' }), otherClassName)
```

## cva()

An atomic recipe: base styles plus named variants, colocated in the component file. Call the result with a variant map
and get a class name.

```ts
import { cva } from '../styled-system/css'

const button = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    rounded: 'md',
    fontWeight: 'semibold'
  },
  variants: {
    visual: {
      solid: { bg: 'blue.500', color: 'white' },
      outline: { borderWidth: '1px', borderColor: 'blue.500' }
    },
    size: {
      sm: { px: '2', py: '1', fontSize: 'sm' },
      md: { px: '4', py: '2', fontSize: 'md' }
    }
  },
  defaultVariants: {
    visual: 'solid',
    size: 'md'
  }
})

button({ visual: 'outline', size: 'sm' }) // => class name string
```

The recipe object takes:

- `base`: styles that always apply.
- `variants`: named axes (`size`, `visual`, …) and the styles for each value.
- `compoundVariants`: styles for specific combinations of variant values.
- `defaultVariants`: values used when a variant is omitted.

Variant props are typed from the definition:

```ts
import { cva, type RecipeVariantProps } from '../styled-system/css'

type ButtonProps = RecipeVariantProps<typeof button>
```

Use `cva` for variants local to one component. For a recipe shared across a design system, define it in config and
import it from [`recipes/`](/docs/reference/recipes) instead. Guides: [Atomic recipes](/docs/recipes/atomic-recipe),
[Config recipes](/docs/recipes/config-recipe), [Thinking in Panda](/docs/get-started/thinking-in-panda).

## sva()

`cva` for components with several parts. One variant map drives every slot, and the call returns a class name per slot.

```ts
import { sva } from '../styled-system/css'

const card = sva({
  slots: ['root', 'title', 'body'],
  base: {
    root: { rounded: 'lg', borderWidth: '1px', p: '4' },
    title: { fontWeight: 'semibold', mb: '2' },
    body: { color: 'fg.muted' }
  },
  variants: {
    size: {
      sm: {
        root: { p: '3' },
        title: { fontSize: 'sm' }
      },
      md: {
        root: { p: '4' },
        title: { fontSize: 'md' }
      }
    }
  },
  defaultVariants: { size: 'md' }
})

const classes = card({ size: 'sm' })
// classes.root, classes.title, classes.body
```

```tsx
<div className={classes.root}>
  <h2 className={classes.title}>Title</h2>
  <p className={classes.body}>Body</p>
</div>
```

The recipe object takes the same keys as `cva`, plus `slots`, the list of part names. `base`, `variants`, and
`compoundVariants` are then written per slot.

A slot recipe shared across packages belongs in config as `defineSlotRecipe`, imported from
[`recipes/`](/docs/reference/recipes). Guides: [Slot recipes](/docs/recipes/slot-recipes),
[Config slot recipe](/docs/recipes/config-recipe#config-slot-recipe),
[Slot recipe context](/docs/recipes/slot-recipe-context).

## viewTransition()

Returns a shared class built on `view-transition-class`, so Panda can extract and dedupe view transition styles like any
other atomic style. You still set a unique `view-transition-name` on each element yourself.

```ts
import { viewTransition } from '../styled-system/css'

const slide = viewTransition({
  group: {
    animationDuration: '0.4s',
    animationTimingFunction: 'ease-in-out'
  },
  imagePair: { isolation: 'isolate' },
  old: { opacity: 0 },
  new: { opacity: 1 }
})
// => "vt_xxx"
```

The keys `group`, `imagePair`, `old`, and `new` map to the matching `::view-transition-*` pseudo-elements.

View transition names must be unique per element, so keying styles on the name would leave nothing to share.
`view-transition-class` is the CSS feature built for shared animation styles, and this helper emits that class. Guide:
[View Transitions](/docs/styling/view-transition).

## positionTry()

Returns the dashed-ident for a CSS anchor-positioning fallback and emits its `@position-try` block. Unlike
`viewTransition()`, which returns a class, this returns a value you put in `position-try-fallbacks`.

```ts
import { css, positionTry } from '../styled-system/css'

const bottom = positionTry({ top: 'anchor(bottom)', insetInlineStart: 'anchor(start)' })
// => "--pt_xxx"

css({ positionTryFallbacks: positionTry('bottom') })
```

A string argument resolves a named `theme.positionTry` bag (`positionTry('bottom')` => `"--pt_bottom"`); an object
hashes to `--pt_<hash>`. The call folds inside `css()`, so a fallback list composes in your own style object. Guide:
[Position Try](/docs/styling/position-try).

## keyframes()

Names an inline `@keyframes` block and returns the animation name for `animationName` or the `animation` shorthand.
Object form only — a bare `animationName: 'spin'` already resolves a `theme.keyframes` entry.

```ts
import { css, keyframes } from '../styled-system/css'

const spin = keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } })
// => "kf_xxx"

css({ animation: `${spin} 1s linear infinite` })
```

The block emits only when its name is referenced, tree-shaken like `theme.keyframes`. Guide:
[Keyframes](/docs/styling/keyframes).

## See also

- [patterns/](/docs/reference/patterns) and [jsx/](/docs/reference/jsx), which call `css()` under the hood
- [recipes/](/docs/reference/recipes), the config-recipe counterpart to `cva` and `sva`
- [Styled System overview](/docs/reference/styled-system)


---


## Debugging

See what Panda extracted from your files, read its logs, and trace or profile a slow build.

Most styling bugs come down to one question: did Panda see your style? Start with `panda debug` to find out. Reach for
logs, tracing, or a profile when the question is about speed.

## See what Panda extracted

`panda debug` writes what Panda found in each file, the CSS it generated, and your resolved config.

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  {/* <!-- prettier-ignore-start --> */}
  <Tab>
    ```bash
    pnpm panda debug
    # Only scan some files
    pnpm panda debug --include "src/components/**"
    ```
  </Tab>
  <Tab>
    ```bash
    npx panda debug
    # Only scan some files
    npx panda debug --include "src/components/**"
    ```
  </Tab>
  <Tab>
    ```bash
    yarn panda debug
    # Only scan some files
    yarn panda debug --include "src/components/**"
    ```
  </Tab>
  <Tab>
    ```bash
    bun panda debug
    # Only scan some files
    bun panda debug --include "src/components/**"
    ```
  </Tab>
  {/* <!-- prettier-ignore-end --> */}
</Tabs>

It writes a `debug` folder inside your `outdir`:

<FileTree>
  <FileTree.Folder name="styled-system" defaultOpen>
    <FileTree.Folder name="debug" defaultOpen>
      <FileTree.File name="config.json" />
      <FileTree.File name="src__components__Button.tsx.extract.json" />
      <FileTree.File name="styles.css" />
      <FileTree.File name="system-info.json" />
    </FileTree.Folder>
  </FileTree.Folder>
</FileTree>

- **`<file>.extract.json`**, one per source file: every `css()`, recipe, pattern, and JSX style Panda extracted, with
  its source position.
- **`styles.css`**: the CSS generated from the scanned files.
- **`config.json`**: your config after presets are merged. Check that it has the tokens and recipes you expect.
- **`system-info.json`**: your platform, Node version, config path, and how many files were scanned.

A file whose styles are missing usually shows up here first. If `calls` is empty, Panda didn't match your import or
couldn't read the value:

```json filename="src__components__Button.tsx.extract.json"
{
  "calls": [
    {
      "category": "css",
      "name": "css",
      "alias": "css",
      "data": [
        {
          "kind": "value",
          "value": {
            "color": "gray.600",
            "p": "1.5",
            "_hover": { "color": "gray.900" }
          }
        }
      ],
      "span": { "start": 98, "end": 165 }
    }
  ],
  "jsx": [],
  "diagnostics": []
}
```

Useful flags:

- `--include <glob>` scans only the matching files. Repeat it for more globs.
- `--onlyConfig` writes just `config.json` and `system-info.json`.
- `--dry` prints everything to the terminal instead of writing files.
- `--zip` writes a single `debug.zip`, ready to attach to a bug report.

## Read more log output

Add `--log-level debug` to any command to see where the time went:

```bash
panda cssgen --log-level debug
```

```
cssgen: parsed 2 files, wrote 21624 bytes to styled-system/styles.css, diagnostics: 0
cssgen: timings
config: 35ms
parse: 1ms
write: 1ms
```

The levels are `silent`, `error`, `warn`, `info` (the default), and `debug`.

## Trace the compiler

`--trace` prints how long each step inside the Rust compiler took:

```bash
panda cssgen --trace
```

```
trace summary
total spans: 30
total span time: 6.32ms

span                                 count         total
--------------------------------------------------------
compile_config                           1        2.59ms
compile_css                              1      742.54us
load_tokens                              1      708.00us
stylesheet                               1      656.21us
file_parse                               2      274.63us
...
```

To see every step on a timeline, write a Chrome trace instead and open it in [ui.perfetto.dev](https://ui.perfetto.dev)
or `chrome://tracing`:

```bash
panda cssgen --trace --trace-output chrome-json --trace-file trace.json
```

### Tracing in Vite or PostCSS

Bundler plugins don't take CLI flags, so turn tracing on with environment variables:

```bash
PANDA_TRACE=trace PANDA_TRACE_OUTPUT=chrome-json PANDA_TRACE_FILE=trace.json vite build
```

- `PANDA_TRACE` sets what to record. `trace` records everything.
- `PANDA_TRACE_OUTPUT` is `fmt` (the default, a summary printed when the process exits) or `chrome-json`.
- `PANDA_TRACE_FILE` is where the Chrome trace is written. It defaults to `.panda/trace.json`.

## Profile a slow build

`--profile` captures a full trace and a summary in one step. Use it when a build is slow and you want to share the
result with us:

```bash
panda --profile
```

It writes two files:

- `.panda/trace.json`: the full timeline. Open it in [ui.perfetto.dev](https://ui.perfetto.dev) or `chrome://tracing`.
- `.panda/timings.json`: the total time per step, plus the slowest files.

`--profile` works with `panda`, `panda cssgen`, `panda codegen`, and `panda debug`.

## Warnings and errors

Every warning and error Panda reports has a code. The [Diagnostics reference](/docs/reference/diagnostics) explains each
one and how to fix it. To use them in CI, add `--format json` or `--format github`, and `--max-warnings <count>` to fail
the build when there are too many warnings.

## FAQ

### Why are my styles not applied?

Check that the [`@layer` rules](/docs/styling/cascade-layers#layer-css) are set and that the CSS file is loaded.
[If you're not using PostCSS](/docs/get-started/cli), make sure `styled-system/styles.css` is imported and that `panda`
has run, or is running with `--watch`.

### Why are one file's styles missing?

Run `panda debug --include` on that file and open its `.extract.json`:

- **`calls` is empty.** Panda didn't recognize the import. See the next question.
- **The property is missing from `value`.** Panda couldn't read the value at build time, for example a prop or state.
  See [Dynamic styling](/docs/styling/dynamic-styling).
- **`diagnostics` isn't empty.** The message explains what went wrong.

### Do I need `importMap` for tsconfig path aliases?

Usually not. Panda reads the `paths` in your `tsconfig.json`, so an import like `~/styled-system/css` works without
extra config.

If you do set `importMap`, it replaces the default matching, so list every way you import the `outdir`:

```ts filename="panda.config.ts"
export default defineConfig({
  // `~/styled-system/css` and `../styled-system/css`
  importMap: ['~/styled-system', 'styled-system']
})
```

### Why is my IDE not showing `styled-system` imports?

Include the `styled-system` directory in your `tsconfig.json` so your editor picks up its types.

### Why does the PostCSS plugin run so often?

Your bundler decides when to rerun PostCSS, and some rerun it more than needed. Panda caches its work and skips files
that haven't changed, but if it still feels slow, run the [CLI](/docs/get-started/cli) in watch mode next to your dev
server instead:

```json filename="package.json"
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"panda --watch\""
  }
}
```

If none of this helps, search the [issues](https://github.com/chakra-ui/panda/issues) or ask on
[Discord](https://discord.gg/VQrkpsgSx7). When you open a
[new issue](https://github.com/chakra-ui/panda/issues/new/choose), attach the `debug.zip` from `panda debug --zip`.


---


## Deprecations

Deprecating tokens, utilities, patterns and config recipes.

Deprecations are mostly relevant for large teams that want to deprecate certain utilities, patterns, recipes, or tokens
before removing them from the codebase.

## Deprecating a Utility

To deprecate a utility, set the `deprecated` property to `true` in the `utility` object.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  utilities: {
    ta: {
      deprecated: true,
      transform(value) {
        return { textAlign: value }
      }
    }
  }
})
```

## Deprecating a Token

To deprecate a token, set the `deprecated` property to `true` in the `token` object.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    tokens: {
      spacing: {
        lg: { value: '8px', deprecated: true }
      }
    }
  }
})
```

## Deprecating a Pattern

To deprecate a pattern, set the `deprecated` property to true in the `pattern` definition.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  patterns: {
    customStack: {
      deprecated: true
    }
  }
})
```

## Deprecating a Recipe

To deprecate a recipe, set the `deprecated` property to true in the `recipe` definition.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    recipes: {
      btn: {
        deprecated: true
      }
    }
  }
})
```

## Custom Deprecation Messages

You can also provide a custom deprecation message by setting the `deprecated` property to a string. i.e. the migration
message.

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: 'blue.500', deprecated: 'use `blue.600` instead' }
      }
    }
  }
})
```

```ts filename="panda.config.ts"
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  theme: {
    recipes: {
      btn: {
        deprecated: 'will be removed in v2.0'
      }
    }
  }
})
```


---


## Diagnostics Reference

What Panda's warnings and errors mean, how to control them, and how to fix each one.

When Panda finds a problem in your config or source files, it reports a diagnostic instead of stopping:

```
warning unknown_condition src/App.tsx:4:9 unknown condition `_hovr`, did you mean `_hover`?
```

Each line gives you a severity, a code, a location, and a message. Look up the code below to see what caused it and how
to fix it.

## Severity

- **`error`** fails the build. No CSS is emitted for the broken part.
- **`warning`** means the build continued, but some CSS may be missing or different from what you expect.
- **`info`** is a heads-up. Nothing is wrong yet.

A config file that can't load at all (syntax error, missing preset) also stops the build. The CLI reports it as an
`error` diagnostic like the others.

## Controlling diagnostics

### In the CLI

Fail CI on any warning:

```bash
panda --max-warnings 0
```

Warnings never change the exit code on their own. `--max-warnings <n>` fails the run when there are more than `n`.

Other useful flags:

- `--format github` prints annotations that show up inline on GitHub pull requests.
- `--json` prints a `diagnostics` array you can process in scripts.
- `--log-level error` hides warnings and info. It only changes what's printed, not the exit code.

### In your config

The `validation` option controls the config checks (the `config_*` codes):

```ts filename="panda.config.ts"
export default defineConfig({
  validation: 'error' // 'none' | 'warn' (default) | 'error'
})
```

- `'warn'` reports them as warnings.
- `'error'` turns them into build failures.
- `'none'` skips them.

It doesn't affect extraction, `staticCss`, or design system codes. You can't silence individual codes.

### In bundler plugins

- **PostCSS**: errors fail the build, warnings go to `result.warn()`, info isn't printed.
- **Vite**: everything is reported as a warning and the build never fails. Run `panda --max-warnings 0` in CI if you
  need a gate.

## Codes

The `code` is stable. Messages may be reworded between releases, so match on the code in any tooling you build.

### Your source files

- `unknown_condition` (warning): a condition like `_hovr` doesn't exist. The message suggests the closest match.
- `nested_property` (warning): a style is nested under a key that isn't a condition or selector, like
  `css({ has: { svg: { color: 'red' } } })`. Panda reads `has` as the CSS property, so the styles never apply. Use a
  condition (`_hover`) or a selector with `&` (`'&:has(svg)'`, `'& svg'`). Also reported for config recipes.
- `panda_call_unextractable` (warning): a style call got a value Panda can't read at build time, like
  `css(props.styles)` or `css({ [key]: 'red' })`. Pass a literal object instead, or generate the CSS with
  [`staticCss`](/docs/styling/static). Turned off when `jsxFramework` is set, since components often pass styles through
  props.
- `pure_helper_unevaluated` (warning): a helper called with static arguments, like `css(card('red'))`, has a body Panda
  can't evaluate, such as an `if` statement or a call to `Array.prototype.map`. Its styles are skipped. Keep the helper
  to `const` declarations and one `return`, or write the styles inline. See
  [unsupported expressions](/docs/styling/dynamic-styling#unsupported-expressions).
- `imported_recipe_raw_dynamic` (warning): `button.raw({ size })` with a dynamic `size`, where `button` is a `cva` from
  another file. Pass literal variant values, or call `.raw()` in the file that defines the recipe.
- `invalid_color_opacity_modifier` (warning): `bg: 'red/abc'`. Use a number (`red/40`) or an opacity token (`red/half`).
- `deprecated_utility_used` (warning): you used a utility marked `deprecated` in the config.
- `deprecated_token_used` (warning): `token('…')` refers to a token marked `deprecated`.
- `js_parse_error` (warning): the file has a syntax error. Panda extracted what it could, so some styles may be missing.
- `transform_callback_failed` (warning): a utility or pattern `transform`, or a `parser:before` hook, threw or returned
  something that isn't a style object. The message names the utility and value.
- `source_not_found`, `source_read_failed` (warning): an included file was deleted or couldn't be read. Panda keeps its
  last CSS for that file.

### `firstThatWorks`

These cover [`firstThatWorks`](/docs/styling/first-that-works) fallbacks. No CSS is emitted for an error.

- `first_that_works_arity_invalid` (error): fewer than 2 values. One value has nothing to fall back to.
- `first_that_works_member_invalid` (error): a value is an object, array, boolean, or `null`. Each must be a single CSS
  value.
- `first_that_works_unbalanced` (error): a string like `'firstThatWorks(red, blue'` is missing a parenthesis.
- `first_that_works_nested` (error): `firstThatWorks` inside `firstThatWorks`.
- `first_that_works_importance_mixed` (error): only some values are `!important`. Mark all or none.
- `first_that_works_custom_property` (warning): used on a `--custom-property`. Write the fallback as
  `var(--x, fallback)` instead.
- `first_that_works_transform_unsupported` (warning): the values expand to different CSS properties through a utility,
  so they can't fall back to each other.

### Tokens

- `config_token_missing_value` (warning): a token has no `value`. Write `red: { value: '#f00' }`, not `red: '#f00'`.
- `config_token_nested_value` (warning): a semantic token has `value: { value: … }`.
- `config_token_key_contains_space` (warning): a token name contains a space.
- `config_token_missing_reference` (warning): `{colors.brand}` points to a token that doesn't exist.
- `config_token_unknown_reference` (warning): a reference can't be resolved.
- `config_token_self_reference` (warning): a token refers to itself.
- `config_token_circular_reference` (warning): tokens refer to each other in a loop. The message shows the chain.

### Config

- `config_hooks_removed` (error): root `hooks` was removed in v2. Move them to
  `plugins: [{ name: 'local', hooks: { … } }]`.
- `config_artifact_name_conflict` (warning): a recipe, slot recipe, and pattern share a name. Rename one.
- `config_breakpoint_units_mixed` (warning): breakpoints mix units, like `px` and `rem`. Use one.
- `config_condition_selector_invalid` (warning): a condition selector is missing `&`, or a block condition doesn't end
  in `'@slot'`.
- `config_condition_array_unsupported` (warning): array conditions are deprecated in v2 and converted automatically. Use
  the block form ending in `'@slot'`.
- `config_utility_values_invalid` (warning): a utility's `values` object contains style objects. Values must be strings,
  numbers, or booleans. Return styles from `transform`.
- `config_theme_name_invalid` (warning): a `themes` key uses characters other than letters, digits, `-`, and `_`.
- `config_container_invalid` (warning): `containerNames` isn't an array, or `containers` isn't an object of string
  sizes.
- `config_container_name_invalid` (warning): a container name or size contains a space, `/`, or `@`.
- `config_container_units_mixed` (warning): container sizes mix units.
- `config_container_condition_conflict` (warning): two container definitions produce the same condition with different
  queries.
- `preset_resolution_failed` (error): a preset couldn't be imported. Check that it's installed.
- `include_package_resolution_failed` (error): a package in `include` couldn't be resolved.
- `config_load_error` (error, CLI): the config file failed to load. The message has the underlying error.

### Stylesheet output

- `layer_name_collision` (warning): two `layers` entries use the same name, so the cascade order is ambiguous.
- `global_var_utility_conflict` (warning): a plain `globalVars` value overrides a utility's `@property` registration.
  Pass an `@property` object instead.

### `staticCss`

See [Static CSS Generation](/docs/styling/static).

- `static_css_property_unknown` (warning): `staticCss.css` names a property with no utility.
- `static_css_token_reference_unknown` (warning): a custom property refers to a token that doesn't exist.
- `static_css_recipe_unknown` (warning): `staticCss.recipes` names a recipe that doesn't exist.
- `static_css_recipe_variant_unknown`, `static_css_recipe_variant_value_unknown` (warning): the recipe exists but the
  variant or value doesn't.
- `static_css_pattern_unknown` (warning): `staticCss.patterns` names a pattern that doesn't exist.
- `static_css_wildcard_empty` (warning): a `'*'` wildcard matched no values, so nothing was generated.
- `static_css_wildcard_large` (info): a wildcard expands to more than 250 values. Consider listing the ones you use.

### Design systems

See [Consume with Panda](/docs/design-systems/consume-with-panda).

Setup (all errors):

- `design_system_in_include`: a design system is listed in `include`. Move it to `designSystem`.
- `design_system_manifest_not_found`: the package isn't installed, or wasn't built with `panda lib`.
- `design_system_manifest_not_exported`: the package doesn't export `./panda/*`.
- `design_system_manifest_invalid`: the package's `panda/lib.json` is malformed. Rebuild it with `panda lib`.
- `design_system_resolve_failed`, `design_system_preset_load_failed`: the package or its preset couldn't be loaded.
- `design_system_parent_not_found`: the design system extends another that isn't installed.
- `design_system_cycle`: two design systems extend each other.
- `design_system_duplicate_name`, `design_system_name_collision`: two design systems have the same name.
- `design_system_unsupported_specifier`: a specifier like `workspace:` isn't supported.
- `design_system_export_missing`: the package is missing one of its generated `styled-system` exports. Rebuild it with
  `panda lib`. Which exports are needed depends on the app: `./jsx` only when `jsxFramework` is set.
- `design_system_version_mismatch`: the package was built with an incompatible version of `panda lib`. Upgrade or
  rebuild it.
- `design_system_peer_range_unsatisfied`: the package requires a Panda version you don't have installed.

Build compatibility:

- `design_system_buildinfo_stale` (warning or error): the design system's build is out of date. Run `panda lib` in its
  package. It's a warning when Panda could fall back to the source files.
- `design_system_option_mismatch` (warning or error): the design system was built with different options than your
  project.
- `design_system_utility_unregistered` (warning): the design system uses a utility your config doesn't define. Add its
  preset.
- `design_system_artifact_conflict` (warning): your config and the design system define a recipe or pattern with the
  same name. Yours is merged over theirs.
- `design_system_token_conflict` (info): your config and the design system define the same tokens. Yours win.

When running `panda lib` (all warnings):

- `design_system_spec_not_publishable`, `design_system_files_not_publishable`, `design_system_export_overwritten`: the
  package output won't publish correctly. The message says what to change.

## See also

- [Debugging](/docs/reference/debugging) for inspecting what Panda extracted.
- [Linting](/docs/get-started/linting) for catching mistakes in the editor before a build.


---


## Display

Panda provides style properties for styling display of an element

Panda provides utilities and style properties for styling display of an element.

## Display Property

```jsx
<div className={css({ display: 'flex' })} />
```

## Hiding Elements

Panda provides shortcut properties for hiding elements from and below a specific breakpoint.

### Hide From

```jsx
<div className={css({ display: 'flex', hideFrom: 'md' })} />
```

### Hide Below

```jsx
<div className={css({ display: 'flex', hideBelow: 'md' })} />
```

| Prop        | CSS Property | Token Category |
| ----------- | ------------ | -------------- |
| `hideFrom`  | `display`    | `breakpoints`  |
| `hideBelow` | `display`    | `breakpoints`  |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Display', 'Visibility']} />


---


## Divide

Panda provides style properties for for dividing elements

Panda provides utilities and style properties for dividing elements.

## Divide X

```jsx
<div className={css({ divideX: '2px' })} />
```

## Divide Y

```jsx
<div className={css({ divideY: '2px' })} />
```

## Divide Color

```jsx
<div className={css({ divideColor: 'red.200' })} />
```

## Divide Style

```jsx
<div className={css({ divideStyle: 'dashed' })} />
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable properties={['divideX', 'divideY', 'divideColor', 'divideStyle']} label="Divide" />


---


## Effects

Panda provides utilities or style properties for applying various visual effects to elements.

Panda offers a range of utilities and style properties for applying visual effects to elements. These effects include
opacity, shadows, blending modes, filters, and more.

## Opacity

```jsx
<div className={css({ opacity: 0.5 })} />
```

| Prop      | CSS Property | Token Category |
| --------- | ------------ | -------------- |
| `opacity` | `opacity`    | `opacity`      |

## Box Shadow

Apply box shadows to elements.

```jsx
<div className={css({ boxShadow: 'lg' })} />
```

| Prop          | CSS Property     | Token Category |
| ------------- | ---------------- | -------------- |
| `boxShadow`   | `box-shadow`     | `shadows`      |
| `shadow`      | `box-shadow`     | `shadows`      |
| `shadowColor` | `--shadow-color` | `colors`       |

## Mix Blend Mode

Control the blending mode of an element.

```jsx
<div className={css({ mixBlendMode: 'multiply' })} />
```

| Prop           | CSS Property     | Token Category |
| -------------- | ---------------- | -------------- |
| `mixBlendMode` | `mix-blend-mode` | none           |

## Filter

Apply various filters to elements.

```jsx
<div className={css({ filter: 'auto', blur: 'sm' })} />
```

| Prop         | CSS Property    | Token Category |
| ------------ | --------------- | -------------- |
| `filter`     | `filter`        | none           |
| `blur`       | `--blur`        | `blurs`        |
| `brightness` | `--brightness`  | none           |
| `contrast`   | `--contrast`    | none           |
| `grayscale`  | `--grayscale`   | none           |
| `hueRotate`  | `--hue-rotate`  | none           |
| `invert`     | `--invert`      | none           |
| `saturate`   | `--saturate`    | none           |
| `sepia`      | `--sepia`       | none           |
| `dropShadow` | `--drop-shadow` | `dropShadows`  |

## Backdrop Filter

Apply filters to the backdrop of an element.

```jsx
<div className={css({ backdropFilter: 'auto', backdropBlur: 'sm' })} />
```

| Prop                 | CSS Property            | Token Category |
| -------------------- | ----------------------- | -------------- |
| `backdropFilter`     | `backdrop-filter`       | none           |
| `backdropBlur`       | `--backdrop-blur`       | `blurs`        |
| `backdropBrightness` | `--backdrop-brightness` | none           |
| `backdropContrast`   | `--backdrop-contrast`   | none           |
| `backdropGrayscale`  | `--backdrop-grayscale`  | none           |
| `backdropHueRotate`  | `--backdrop-hue-rotate` | none           |
| `backdropInvert`     | `--backdrop-invert`     | none           |
| `backdropOpacity`    | `--backdrop-opacity`    | none           |
| `backdropSaturate`   | `--backdrop-saturate`   | none           |
| `backdropSepia`      | `--backdrop-sepia`      | none           |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Effect', 'Shadow', 'Animation']} />


---


## Flex and Grid

Panda provides a set of utilities and style properties for flexible box layout (Flex) and grid layout (Grid). These utilities are designed to make it easy to create responsive and dynamic layouts in your application.

Panda provides a set of utilities and style properties for flexible box layout (Flex) and grid layout (Grid). These
utilities are designed to make it easy to create responsive and dynamic layouts in your application.

## Flex

Flex utilities are designed to control the layout and behavior of flex containers and items.

### Flex Basis

The `flexBasis` utility sets the initial main size of a flex item, distributing the available space along the main axis.
It supports `spacing` tokens and fractional literal values like “1/2”, “2/3", etc.

```jsx
<div className={css({ basis: '1/2' })} />
```

### Flex

The `flex` utility defines the flexibility of a flex container or item. Supported values:

| Value     |            |
| --------- | ---------- |
| `1`       | `1 1 0%`   |
| `auto`    | `1 1 auto` |
| `initial` | `0 1 auto` |
| `none`    | `none`     |

### Flex Direction

The `flexDirection` utility sets the direction of the main axis in a flex container. It's shorthand is `flexDir`.

```jsx
<div className={css({ flexDir: 'column' })} />
```

## Grid

Grid utilities offer control over various grid layout properties, providing a powerful system for creating layouts with
rows and columns.

### Grid Template Columns

The `gridTemplateColumns` utility defines the columns of a grid container.

```jsx
<div className={css({ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' })} />
```

### Grid Template Rows

The `gridTemplateRows` utility defines the rows of a grid container.

```jsx
<div className={css({ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' })} />
```

## Keeping content visible

`safe center` keeps a centered flex child on screen when the container is too small, instead of overflowing out of view.

```tsx
css({ justifyContent: 'safe center', alignItems: 'safe center' })
```

`last baseline` aligns to the last line of a multi-line item.

```tsx
css({ alignItems: 'last baseline' })
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Flex Layout', 'Grid Layout']} />


---


## Focus Ring

Style focus states with accessibility-first focus ring utilities.

Focus rings are essential for accessibility, helping users identify which element currently has keyboard focus. Panda
provides comprehensive focus ring utilities that work with both regular focus and focus-visible states.

## Focus Ring Variants

The `focusRing` utility applies focus styles using the `&:is(:focus, [data-focus])` selector and supports four variants:

```jsx
// Outside focus ring (default 2px offset)
<button className={css({ focusRing: 'outside' })}>
  Click me
</button>

// Inside focus ring (no offset, with border)
<button className={css({ focusRing: 'inside' })}>
  Click me
</button>

// Mixed focus ring (semi-transparent with border)
<button className={css({ focusRing: 'mixed' })}>
  Click me
</button>

// No focus ring
<button className={css({ focusRing: 'none' })}>
  Click me
</button>
```

## Focus Visible Ring

The `focusVisibleRing` utility only applies focus styles during keyboard navigation using the
`&:is(:focus-visible, [data-focus-visible])` selector:

```jsx
<button className={css({ focusVisibleRing: 'outside' })}>Only shows focus ring on keyboard navigation</button>
```

### Focus Ring vs. Focus Visible Ring

The Focus Visible Ring functions similarly to the Focus Ring, but with a key difference: it only applies focus indicator
styles when an element receives keyboard focus.

This ensures that the focus ring is visible only when navigating via keyboard, improving accessibility without affecting
mouse interactions.

## Customization

You can customize focus ring appearance with additional utilities:

```jsx
<button
  className={css({
    focusRing: 'outside',
    focusRingColor: 'blue.500',
    focusRingWidth: '3px',
    focusRingStyle: 'dashed',
    focusRingOffset: '4px'
  })}
>
  Custom focus ring
</button>
```

| Prop               | CSS Property     | Token Category | Description              |
| ------------------ | ---------------- | -------------- | ------------------------ |
| `focusRing`        | Multiple         | Enum           | Focus ring variant       |
| `focusVisibleRing` | Multiple         | Enum           | Keyboard-only focus ring |
| `focusRingColor`   | `outline-color`  | `colors`       | Focus ring color         |
| `focusRingWidth`   | `outline-width`  | `borderWidths` | Focus ring thickness     |
| `focusRingStyle`   | `outline-style`  | `borderStyles` | Focus ring style         |
| `focusRingOffset`  | `outline-offset` | `spacing`      | Distance from element    |

### Ring Color

To change the focus ring color for a specific component, use the `focusRingColor` prop:

```jsx
<button className={css({ focusRing: 'outside', focusRingColor: 'red.500' })}>Red focus ring</button>
```

## Global Ring Color

You can set a global focus ring color by defining the CSS custom property:

```ts
// panda.config.ts
import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  globalCss: {
    html: {
      '--global-color-focus-ring': '#3b82f6'
    }
  }
})
```

### Ring Width

To change the focus ring width for a specific component, use the `focusRingWidth` prop:

```jsx
<button className={css({ focusRing: 'outside', focusRingWidth: '4px' })}>Thick focus ring</button>
```

### Ring Style

To change the focus ring style for a specific component, use the `focusRingStyle` prop:

```jsx
<button className={css({ focusRing: 'outside', focusRingStyle: 'dashed' })}>Dashed focus ring</button>
```

This color will be used as the default for all focus rings unless overridden by the `focusRingColor` prop.

## Examples

### Basic Focus Ring

```jsx
import { css } from '../styled-system/css'

function Button({ children }) {
  return (
    <button
      className={css({
        px: '4',
        py: '2',
        bg: 'blue.500',
        color: 'white',
        rounded: 'md',
        focusRing: 'outside'
      })}
    >
      {children}
    </button>
  )
}
```

### Keyboard-Only Focus Ring

```jsx
import { css } from '../styled-system/css'

function Input({ ...props }) {
  return (
    <input
      className={css({
        px: '3',
        py: '2',
        borderWidth: '1px',
        borderColor: 'gray.300',
        rounded: 'md',
        focusVisibleRing: 'outside',
        focusRingColor: 'blue.500'
      })}
      {...props}
    />
  )
}
```

### Custom Focus Ring

```jsx
import { css } from '../styled-system/css'

function CustomButton({ children }) {
  return (
    <button
      className={css({
        px: '6',
        py: '3',
        bg: 'purple.600',
        color: 'white',
        rounded: 'lg',
        focusRing: 'mixed',
        focusRingColor: 'purple.400',
        focusRingWidth: '3px',
        focusRingOffset: '3px'
      })}
    >
      {children}
    </button>
  )
}
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Focus Ring']} />


---


## Gradients

Create smooth color transitions with linear, radial, and conic gradient utilities.

Create smooth color transitions with linear, radial, and conic gradient utilities.

| Property             | Shorthand    | CSS Property       | Description                    |
| -------------------- | ------------ | ------------------ | ------------------------------ |
| `backgroundLinear`   | `bgLinear`   | `background-image` | Apply linear gradient effects  |
| `backgroundRadial`   | `bgRadial`   | `background-image` | Apply radial gradient effects  |
| `backgroundConic`    | `bgConic`    | `background-image` | Apply conic gradient effects   |
| `backgroundGradient` | `bgGradient` | `background-image` | Apply linear gradient (alias)  |
| `textGradient`       | -            | `background-image` | Apply gradient to text         |
| `gradientFrom`       | -            | `--gradient-from`  | Define starting gradient color |
| `gradientTo`         | -            | `--gradient-to`    | Define ending gradient color   |
| `gradientVia`        | -            | `--gradient-via`   | Define middle gradient color   |

## Examples

### Linear gradients

Use the `bgLinear` utility to create a linear gradient with a direction.

```tsx
css({ bgLinear: 'to-r', gradientFrom: 'cyan.500', gradientTo: 'blue.500' })
css({ bgLinear: 'to-t', gradientFrom: 'sky.500', gradientTo: 'indigo.500' })
css({
  bgLinear: 'to-bl',
  gradientFrom: 'violet.500',
  gradientTo: 'fuchsia.500'
})
css({ bgLinear: '65deg', gradientFrom: 'purple.500', gradientTo: 'pink.500' })
```

### Radial gradients

Build circular color transitions that radiate outward from a center point:

```tsx
css({
  bgRadial: 'in srgb',
  gradientFrom: 'pink.400',
  gradientFromPosition: '40%',
  gradientTo: 'fuchsia.700'
})
css({
  bgRadial: 'at 50% 75%',
  gradientFrom: 'sky.200',
  gradientVia: 'blue.400',
  gradientTo: 'indigo.900',
  gradientToPosition: '90%'
})
css({
  bgRadial: 'at 25% 25%',
  gradientFrom: 'white',
  gradientTo: 'zinc.900',
  gradientToPosition: '75%'
})
```

### Conic gradients

Create sweeping color transitions that rotate around a central point:

```jsx
css({
  boxSize: '24',
  rounded: 'full',
  bgConic: 'in srgb',
  gradientFrom: 'blue.600',
  gradientTo: 'sky.400',
  gradientToPosition: '50%'
})
css({
  boxSize: '24',
  rounded: 'full',
  bgConic: 'from 180deg',
  gradientFrom: 'blue.600',
  gradientVia: 'blue.50',
  gradientTo: 'blue.600'
})
css({
  boxSize: '24',
  rounded: 'full',
  bgConic: 'in oklch decreasing hue',
  gradientFrom: 'violet.700',
  gradientVia: 'lime.300',
  gradientTo: 'violet.700'
})
```

### Controlling color stops

Define which colors appear in your gradient using `gradientFrom`, `gradientVia`, and `gradientTo`:

```jsx
css({
  bgLinear: 'to-r',
  gradientFrom: 'indigo.500',
  gradientVia: 'purple.500',
  gradientTo: 'pink.500'
})
```

### Positioning color stops

Control exactly where each color appears along the gradient using position utilities:

```jsx
css({
  bgLinear: 'to-r',
  gradientFrom: 'indigo.500',
  gradientFromPosition: '10%',
  gradientVia: 'sky.500',
  gradientViaPosition: '30%',
  gradientTo: 'emerald.500',
  gradientToPosition: '90%'
})
```

### Text gradients

Apply colorful gradient effects to typography using `textGradient`:

```jsx
css({
  textGradient: 'to-r',
  gradientFrom: 'purple.400',
  gradientTo: 'pink.400',
  fontSize: '4xl',
  fontWeight: 'bold'
})
```

### Custom gradient values

Use bracket notation to create gradients with arbitrary values:

```jsx
css({
  bgLinear: '25deg',
  gradientFrom: 'red.50%',
  gradientVia: 'yellow.60%',
  gradientTo: 'lime.90%',
  gradientToPosition: 'teal.100%'
})
```

### Responsive gradients

Apply different gradient styles at different breakpoints using responsive objects:

```jsx
css({
  gradientFrom: { base: 'purple.400', md: 'yellow.500' }
})
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Background Gradient']} />


---


## Helpers

Panda CSS offers utility classes to enhance accessibility and aid in debugging.

Panda CSS offers utility classes to enhance accessibility and aid in debugging.

## Screen Reader-Only Content

The srOnly utility class hides content visually while keeping it accessible to screen readers. It is particularly useful
when you want to provide information to screen readers without displaying it on the screen.

```jsx
<div className={css({ srOnly: true })}>Accessible only to screen readers</div>
```

## Debug

The debug utility class applies styles to aid in debugging by adding outlines to elements. This can be helpful during
development to visually inspect the layout and structure of your components.

```jsx
<div className={css({ debug: true })}>Debugging outline applied</div>
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['System', 'Other']} />


---


## Interactivity

Panda CSS provides a variety of utility classes to enhance interactivity and user experience on your web applications.

Panda CSS provides a variety of utility classes to enhance interactivity and user experience on your web applications.
These utilities cover aspects such as accent color, caret color, scrolling behavior, scrollbar customization, scroll
margins and paddings, scroll snapping, touch actions, and user selection.

## Accent Color

The `accentColor` utility class sets the accent color of an element. It supports `colors` tokens.

```jsx
<div className={css({ accentColor: 'blue.500' })}>Accent color applied</div>
```

## Caret Color

The `caretColor` utility class sets the color of the text cursor (caret) in an input or textarea. It supports `colors`
tokens.

```jsx
<input className={css({ caretColor: 'red.400' })} />
```

## Wrapping long words

`overflowWrap: 'anywhere'` lets a flex or grid item shrink when a URL or long word would otherwise blow out the
min-content size. `break-word` is the milder keyword.

```tsx
css({ overflowWrap: 'anywhere' })
```

## Scrollbar

`scrollbar: 'hidden'` hides the bar on standard CSS, WebKit, and legacy Edge. `visible` brings it back.

```jsx
<div className={css({ scrollbar: 'hidden' })}>Scrollbar hidden</div>
```

Thickness is `scrollbarWidth`. Colors are two props that compose, same idea as masks: each one re-emits
`scrollbar-color` from CSS variables, so you can set thumb, track, or both.

```tsx
css({
  overflow: 'auto',
  scrollbarWidth: 'thin',
  scrollbarThumb: 'gray.400',
  scrollbarTrack: 'gray.100',
  scrollbarGutter: 'stable'
})
```

| Prop              | CSS                                          | Values                                   |
| ----------------- | -------------------------------------------- | ---------------------------------------- |
| `scrollbar`       | hide / show, including `::-webkit-scrollbar` | `visible`, `hidden`                      |
| `scrollbarWidth`  | `scrollbar-width`                            | `auto`, `thin`, `none`                   |
| `scrollbarThumb`  | `--scrollbar-thumb` + `scrollbar-color`      | `colors`                                 |
| `scrollbarTrack`  | `--scrollbar-track` + `scrollbar-color`      | `colors`                                 |
| `scrollbarGutter` | `scrollbar-gutter`                           | `auto`, `stable`, `stable both-edges`    |
| `scrollbarColor`  | `scrollbar-color`                            | raw two-value string (`red transparent`) |

`scrollbarColor` is the escape hatch for a raw `thumb track` pair. Don't use it for a single color token. That's invalid
CSS. Use `scrollbarThumb` / `scrollbarTrack`.

`_scrollbarThumb` and `_scrollbarTrack` are still there for extra WebKit styling the standard property can't express,
like radius or a border. Use them for that, not for color.

## Scroll Margin

Scroll margin utilities set margins around scroll containers.

```jsx
<div className={css({ scrollMarginX: '2' })}>Scrollbar Container with Inline padding</div>
```

| Prop                                  | CSS Property                 | Token Category |
| ------------------------------------- | ---------------------------- | -------------- |
| `scrollMarginX` ,`scrollMarginInline` | `scroll-margin-inline`       | `spacing`      |
| `scrollMarginInlineStart`             | `scroll-margin-inline-start` | `spacing`      |
| `scrollMarginInlineEnd`               | `scroll-margin-inline-end`   | `spacing`      |
| `scrollMarginY` , `scrollMarginBlock` | `scroll-margin-block`        | `spacing`      |
| `scrollMarginBlockStart`              | `scroll-margin-block-start`  | `spacing`      |
| `scrollMarginBlockEnd`                | `scroll-margin-block-end`    | `spacing`      |
| `scrollMarginLeft`                    | `scroll-margin-left`         | `spacing`      |
| `scrollMarginRight`                   | `scroll-margin-right`        | `spacing`      |
| `scrollMarginTop`                     | `scroll-margin-top`          | `spacing`      |
| `scrollMarginBottom`                  | `scroll-margin-bottom`       | `spacing`      |

## Scroll Padding

Scroll padding utilities set padding inside scroll containers.

```jsx
<div className={css({ scrollPaddingY: '2' })}>Scrollbar Container with block padding</div>
```

| Prop                                     | CSS Property                  | Token Category |
| ---------------------------------------- | ----------------------------- | -------------- |
| `scrollPaddingX` , `scrollPaddingInline` | `scroll-padding-inline`       | `spacing`      |
| `scrollPaddingInlineStart`               | `scroll-padding-inline-start` | `spacing`      |
| `scrollPaddingInlineEnd`                 | `scroll-padding-inline-end`   | `spacing`      |
| `scrollPaddingY` , `scrollPaddingBlock`  | `scroll-padding-block`        | `spacing`      |
| `scrollPaddingBlockStart`                | `scroll-padding-block-start`  | `spacing`      |
| `scrollPaddingBlockEnd`                  | `scroll-padding-block-end`    | `spacing`      |
| `scrollPaddingLeft`                      | `scroll-padding-left`         | `spacing`      |
| `scrollPaddingRight`                     | `scroll-padding-right`        | `spacing`      |
| `scrollPaddingTop`                       | `scroll-padding-top`          | `spacing`      |
| `scrollPaddingBottom`                    | `scroll-padding-bottom`       | `spacing`      |

## Scroll Snapping

Scroll snapping utilities provide control over the scroll snap behavior.

### Scroll Snap Margin

| Prop                     | CSS Property           | Token Category |
| ------------------------ | ---------------------- | -------------- |
| `scrollSnapMargin`       | `scroll-margin`        | `spacing`      |
| `scrollSnapMarginTop`    | `scroll-margin-top`    | `spacing`      |
| `scrollSnapMarginBottom` | `scroll-margin-bottom` | `spacing`      |
| `scrollSnapMarginLeft`   | `scroll-margin-left`   | `spacing`      |
| `scrollSnapMarginRight`  | `scroll-margin-right`  | `spacing`      |

### Scroll Snap Strictness

It's values can be `mandatory` or `proximity` values, and maps to `var(--scroll-snap-strictness)`.

```jsx
<div className={css({ scrollSnapStrictness: 'proximity' })}>Scroll container with proximity scroll snap</div>
```

### Scroll Snap Type

Supported values

| Value  |                                      |
| ------ | ------------------------------------ |
| `none` | `none`                               |
| `x`    | `x var(--scroll-snap-strictness)`    |
| `y`    | `y var(--scroll-snap-strictness)`    |
| `both` | `both var(--scroll-snap-strictness)` |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Interactivity', 'Scroll']} />


---


## jsx/

The jsx/ folder — styled factory, JSX patterns, and recipe context helpers.

**Folder:** `styled-system/jsx/`  
**Import:** `import { styled, Stack } from '../styled-system/jsx'`

Generated only when [`jsxFramework`](/docs/reference/config#jsxframework) is set (for example `'react'`). Without that
flag, this folder is absent and style props are not extracted from JSX.

## Key files

| File                             | Export                    | Role                                          |
| -------------------------------- | ------------------------- | --------------------------------------------- |
| `jsx/factory`                    | `styled`                  | `styled.div`, `styled('button')`, factory API |
| `jsx/<pattern>`                  | `Stack`, `Grid`, …        | JSX form of each pattern                      |
| `jsx/create-recipe-context`      | `createRecipeContext`     | Context for a single-element recipe           |
| `jsx/create-slot-recipe-context` | `createSlotRecipeContext` | Context for a slot recipe                     |
| `jsx/index`                      | barrel                    | Re-exports factory, patterns, helpers         |

## Style props

```tsx
import { styled } from '../styled-system/jsx'

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <styled.button bg="blue.500" color="white" px="4" py="2" rounded="md">
      {children}
    </styled.button>
  )
}
```

Same atomic CSS as [`css()`](/docs/reference/css); different authoring surface.

## JSX patterns

```tsx
import { Stack, Circle } from '../styled-system/jsx'

const Demo = () => (
  <Stack gap="4" direction="row">
    <Circle size="12" />
  </Stack>
)
```

Function form lives under [`patterns/`](/docs/reference/patterns).

## Recipe context

Use `createRecipeContext` / `createSlotRecipeContext` to push recipe variants through a compound component tree
(headless UI, design-system packages). Guides: [Slot recipe context](/docs/recipes/slot-recipe-context) and
[Recipe context](/docs/recipes/recipe-context).

## See also

- [Style props](/docs/styling/style-props)
- [Extraction rules](/docs/styling/extraction-rules)
- [patterns/](/docs/reference/patterns)
- [Styled System overview](/docs/reference/styled-system)


---


## Layout

Panda provides style properties for styling layout of an element

Panda provides style properties for styling layout of an element.

## Aspect Ratio

Use the `aspectRatio` utilities to set the desired aspect ratio of an element.

Values can reference the `aspectRatios` token category.

```jsx
<div className={css({ aspectRatio: 'square' })} />
```

> This uses the native CSS property `aspect-ratio` which is might not supported in all browsers. Consider using the
> [`AspectRatio` pattern](/docs/styling/patterns#aspect-ratio) instead

## Position

Use the `position` utilities to set the position of an element.

```jsx
<div className={css({ position: 'absolute' })} />
<div className={css({ pos: 'absolute' })} /> // shorthand
```

## Top / Right / Bottom / Left

Use the `top`, `right`, `bottom` and `left` utilities to set the position of an element.

Values can reference the `spacing` token category.

```jsx
<div className={css({ position: 'absolute', top: '0', left: '0' })} />
```

| Prop     | CSS Property | Token Category |
| -------- | ------------ | -------------- |
| `top`    | `top`        | `spacing`      |
| `right`  | `right`      | `spacing`      |
| `bottom` | `bottom`     | `spacing`      |
| `left`   | `left`       | `spacing`      |

### Logical Properties

Use the `inset{Start|End}` utilities to set the position of an element based on the writing mode.

> For example, `insetStart` will set the `left` property in `ltr` mode and `right` in `rtl` mode.

```jsx
<div className={css({ position: 'absolute', insetStart: '0' })} />
```

| Prop                                      | CSS Property         | Token Category |
| ----------------------------------------- | -------------------- | -------------- |
| `start`, `insetStart`, `insetInlineStart` | `inset-inline-start` | `spacing`      |
| `end` , `insetEnd`, `insetInlineEnd`      | `inset-inline-end`   | `spacing`      |
| `insetX`, `insetInline`                   | `inset-inline`       | `spacing`      |
| `insetY`, `insetBlock`                    | `inset-inline`       | `spacing`      |

## Container Query

You can define container names and sizes in your theme configuration and use them in your styles.
[Read more.](/docs/styling/conditional-styles#container-queries)

| Prop            | CSS Property    | Token Category   |
| --------------- | --------------- | ---------------- |
| `containerName` | `containerName` | `containerNames` |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Layout', 'Position', 'Container']} />


---


## List

Panda provides utilities for customizing list styles.

Panda provides utilities for customizing list styles.

## List Style Image

Use a custom image as the list marker. It supports the `assets` token category.

```js filename="panda.config.ts"
const theme = {
  tokens: {
    assets: {
      star: {
        value: { type: 'svg', value: '<svg>...</svg>' }
      }
    }
  }
}
```

```jsx
<div className={css({ listStyleImage: 'star' })} />
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['List']} />


---


## Masks

Fade an edge, spotlight an image, or stack both without writing mask-image gradients by hand.

Fading the bottom of a hero used to mean writing the same gradient twice: once for `maskImage`, once for
`-webkit-mask-image`.

Now you set a stop.

```tsx
css({ maskBottomFrom: '40%' })
```

It's solid through 40%, then it fades to transparent at the bottom. One prop. The `-webkit-` prefix is already there.

## Fading one edge

`From` is where the fade starts. `To` is where it finishes. Skip `To` and it defaults to `100%`.

```tsx
css({ overflow: 'auto', maskBottomFrom: '80%' })
css({ maskBottomFrom: '20%', maskBottomTo: '80%' })
```

| Prop             | Fades toward |
| ---------------- | ------------ |
| `maskTopFrom`    | top          |
| `maskRightFrom`  | right        |
| `maskBottomFrom` | bottom       |
| `maskLeftFrom`   | left         |

Each one has a matching `To`. Values are spacing tokens or raw lengths (`8`, `20%`, `2rem`).

## Fading both sides

`maskX` and `maskY` are two edges, not one gradient. Left and right. Top and bottom.

```tsx
css({ overflowX: 'auto', maskXFrom: '8', maskXTo: '90%' })
css({ maskYFrom: '15%', maskYTo: '85%' })
```

Pick `maskXFrom` or `maskLeftFrom`, not both. They write the same CSS variables. Stylesheet sort order decides the
winner, not the order you wrote the props.

## Stacking a fade and a spotlight

Edge fades live on the linear layer. Radial and conic are separate layers. The browser intersects them, so a bottom fade
plus a radial spotlight keeps both.

```tsx
css({
  maskBottomFrom: '50%',
  maskRadialFrom: '35%',
  maskRadialAt: 'center'
})
```

Fade the footer. Keep a soft circle of the photo.

`maskBottomFrom` and `maskLinear` both write the linear layer. Use one or the other. Stacking those two does not add a
second fade. The later class overwrites the first.

## Using a linear mask

`maskLinear` is an angle, or the same `to-t` / `to-br` map as `bgGradient`.

```tsx
css({ maskLinear: '45', maskLinearFrom: '30%' })
css({ maskLinear: 'to-b', maskLinearFrom: '40%', maskLinearTo: '80%' })
```

A bare number on `maskLinear` is degrees: `'45'` means `45deg`. A bare number on `maskLinearFrom` is spacing. That split
is easy to mix up.

## Using a radial mask

`maskRadialAt` is the center of the gradient. It is not `maskPosition`. `maskPosition` moves a `maskImage`.

```tsx
css({
  maskRadialFrom: '20%',
  maskRadialAt: 'center',
  maskRadialShape: 'circle',
  maskRadialSize: 'farthest-side'
})
```

`maskRadialAt` accepts `center`, `top`, `top left`, `30% 30%`, and the rest of the background-position syntax. Write
the CSS — there is no `topLeft` alias.

## Using a conic mask

```tsx
css({
  maskConic: '45',
  maskConicFrom: '20%',
  maskConicTo: '80%'
})
```

Same degree rule as `maskLinear`: `'45'` means `45deg`.

## Changing stop colors

Stops default to black, then transparent. That is what you want for a normal fade. Override the color with a separate
prop, not by stuffing a color into `From`.

```tsx
css({
  maskBottomFrom: '25%',
  maskBottomFromColor: 'transparent',
  maskBottomToColor: 'black'
})
```

Every `From` / `To` has a matching `FromColor` / `ToColor`: `maskBottomFromColor`, `maskLinearToColor`,
`maskRadialFromColor`, `maskConicToColor`. Color tokens and opacity modifiers work (`red.500`, `black/50`).

## Using a raw mask image

A PNG, an SVG, or a gradient you already have goes on `maskImage`. That is the escape hatch. It replaces the fade
layers. Do not mix it with `maskBottomFrom`.

```tsx
css({
  maskImage: 'url(/scribble.png)',
  maskSize: 'cover',
  maskPosition: 'center',
  maskRepeat: 'no-repeat'
})
```

## Using CSS mask properties

These map 1:1 to CSS. Each one also emits the `-webkit-` prefix.

| Prop            | CSS property     | Values                                           |
| --------------- | ---------------- | ------------------------------------------------ |
| `mask`          | `mask`           | shorthand                                        |
| `maskImage`     | `mask-image`     | `none`, `url(...)`, any image                    |
| `maskSize`      | `mask-size`      | `auto`, `cover`, `contain`, any length           |
| `maskPosition`  | `mask-position`  | `center`, `top left`, `50% 50%`, …               |
| `maskRepeat`    | `mask-repeat`    | `repeat`, `no-repeat`, `repeat-x`, `repeat-y`, … |
| `maskClip`      | `mask-clip`      | `border-box`, `padding-box`, `content-box`, …    |
| `maskOrigin`    | `mask-origin`    | `border-box`, `padding-box`, `content-box`, …    |
| `maskComposite` | `mask-composite` | `add`, `subtract`, `intersect`, `exclude`        |
| `maskMode`      | `mask-mode`      | `alpha`, `luminance`, `match-source`             |
| `maskType`      | `mask-type`      | `alpha`, `luminance` (SVG `<mask>` only)         |

Fade helpers composite as `intersect`. Set `maskComposite` to change that — it wins wherever you put it, because the
helpers read the same variable.

```tsx
css({
  maskBottomFrom: '50%',
  maskRadialFrom: '70%',
  maskComposite: 'add'
})
```

## Under strict tokens

Stops resolve against `spacing`, so a raw length needs the escape hatch.

```tsx
css({ maskBottomFrom: '4' }) // spacing token
css({ maskBottomFrom: '[20%]' }) // raw percentage
```

Colors work the same way: `maskBottomFromColor: 'red.500'`, or `'[rebeccapurple]'`.

## What does not compose

- `maskImage` and the fade helpers. Both write `mask-image`, so stylesheet sort order picks the winner, not the order
  you wrote the props. Pick one.
- `maskBottomFrom` and `maskLinear`. Same layer. One overwrites the other.
- `maskXFrom` and `maskLeftFrom`. Same variables. Pick one.
- Logical edges. There is no `maskStartFrom` or `maskEndFrom`. Fade direction is visual: top, right, bottom, left.

Start with `maskBottomFrom`. Add a second helper only when one edge is not enough.

## How it works

The helpers write CSS variables — `--mask-linear`, `--mask-bottom-from-position`, and friends — which Panda registers
with `@property`. Two things follow from that.

Registrations are `inherits: false`, so a fade on a parent cannot leak into a child. And Panda only emits the
registrations your stylesheet actually references, so a project that never masks pays nothing for them.

You can set the variables yourself when a helper doesn't cover the case.

```tsx
css({ maskBottomFrom: '50%', '--mask-bottom-from-color': 'rebeccapurple' })
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Mask']} />


---


## Outline

Panda provides utilities for customizing outlines.

Panda provides utilities for customizing outlines.

## Compound Property

Set the width, color, and style of the outline.

```jsx
<div className={css({ outline: '2px solid blue.500' })} />
<div className={css({ ring: '2px solid blue.500' })} /> // shorthand
```

| Prop               | CSS Property | Token Category |
| ------------------ | ------------ | -------------- |
| `ring` , `outline` | `outline`    | `borders`      |

## Outline Width

Change the width of the outline.

```jsx
<div className={css({ outlineWidth: '4' })} />
<div className={css({ outlineWidth: '2px' })} />
<div className={css({ ringWidth: '2px' })} /> // shorthand
```

| Prop                         | CSS Property    | Token Category |
| ---------------------------- | --------------- | -------------- |
| `ringWidth` , `outlineWidth` | `outline-width` | `borderWidths` |

## Outline Color

Change the color of the outline.

```jsx
<div className={css({ outlineColor: 'blue.500' })} />
<div className={css({ ringColor: 'blue.500' })} /> // shorthand
```

| Prop           | CSS Property    | Token Category |
| -------------- | --------------- | -------------- |
| `outlineColor` | `outline-color` | `colors`       |

## Outline Offset

Adjust the space between the outline and the element.

```jsx
<div className={css({ outlineOffset: '4' })} />
<div className={css({ ringOffset: '4' })} /> // shorthand
```

| Prop            | CSS Property     | Token Category |
| --------------- | ---------------- | -------------- |
| `outlineOffset` | `outline-offset` | `spacing`      |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable properties={['outline', 'outlineWidth', 'outlineColor', 'outlineOffset']} label="Outline" />


---


## patterns/

The patterns/ folder — generated functions for layout primitives like stack, grid, and container.

**Folder:** `styled-system/patterns/`  
**Import:** `import { stack, hstack, grid } from '../styled-system/patterns'`

Codegen writes one module per pattern (for example `patterns/stack.ts`) plus `patterns/index.ts` as the barrel.
Each export is a function: pass pattern props, get a class name. Under the hood they call [`css()`](/docs/reference/css).

```ts
import { stack, hstack } from '../styled-system/patterns'

stack({ gap: '4', p: '6' })
hstack({ gap: '2', alignItems: 'center' })
```

## What you get

Built-ins include layout helpers such as `box`, `container`, `stack`, `hstack`, `vstack`, `grid`, `gridItem`,
`flex`, `center`, `wrap`, `aspectRatio`, `float`, `bleed`, `circle`, `square`, `divider`, `linkOverlay`,
`visuallyHidden`, and `cq` (container query). Your config can add or remove patterns.

## JSX form

When [`jsxFramework`](/docs/reference/config#jsxframework) is set, the same patterns also appear as components under
[`jsx/`](/docs/reference/jsx) (`Stack`, `Grid`, …).

## Customize

Authoring and overriding patterns lives in config: [Theming → Patterns](/docs/theming/patterns).  
Usage catalog and examples: [Styling → Patterns](/docs/styling/patterns).

## See also

- [css()](/docs/reference/css)
- [jsx/](/docs/reference/jsx)
- [Styled System overview](/docs/reference/styled-system)


---


## Plugins

Every hook a plugin can register, with when it fires, what it receives, and what it may return.

A plugin is `{ name, hooks }`, passed in the config's [`plugins`](/docs/reference/config#plugins) array. Wrap it in
[`definePlugin`](/docs/reference/config-functions#defineplugin) for typed hooks. For a walkthrough, see
[Plugins](/docs/theming/plugins) in the Theming tab.

```ts
import { definePlugin } from '@pandacss/dev'

definePlugin({
  name: 'my-plugin',
  hooks: {
    'config:resolved': ({ config, utils }) => utils.omit(config, ['patterns.stack'])
  }
})
```

## Hooks

### `config:resolved`

**Fires**: after presets and config merge, before defaults apply.  
**Receives**: `{ config, path, dependencies, utils }`.  
**Returns**: a `Config` to replace the resolved one, or nothing. May be async.

### `preset:resolved`

**Fires**: once per preset, before presets merge.  
**Receives**: `{ preset, name, utils }`.  
**Returns**: a `Config` to replace that preset, or nothing. May be async.

### `parser:before`

**Fires**: after a file is read, before it is parsed.  
**Receives**: `{ filePath, content, original }`.  
**Returns**: a string to parse instead of `content`, or nothing. May be async.

### `codegen:prepare`

**Fires**: before `styled-system` files are written.  
**Receives**: `{ artifacts, outdir, cwd }`, where each artifact is `{ id, files }` and each file is
`{ path, code, dependencies }`.  
**Returns**: an artifact list to write instead, or nothing. Synchronous.

### `codegen:done`

**Fires**: after `styled-system` files are written.  
**Receives**: `{ files, outdir, cwd }`.  
**Returns**: ignored. Synchronous.

### `cssgen:done`

**Fires**: after the final CSS is produced by the CLI, the Vite plugin, or the PostCSS plugin.  
**Receives**: `{ artifact, content, path, outfile, outdir, cwd, manifest, layerRanges }`. `artifact` is
`'styles.css'`, `'styles.layer'`, or `'styles.split'`. `path` is set only when the CSS was written to disk.  
**Returns**: ignored. Synchronous.

## Filters

Every hook takes a function, or `{ filter, handler }` to run only for matching files.

```ts
'parser:before': {
  filter: { id: '**/*.md' },
  handler: ({ content }) => content
}
```

- `filter.id` matches the file path.
- `filter.code` matches the file content.

Each takes a glob or regex, or `{ include, exclude }` holding them.

## Config utils

`config:resolved` and `preset:resolved` receive `utils`. Paths are dot-separated, like `'theme.tokens.colors'`.

- `omit(obj, paths)`: a copy without those paths.
- `pick(obj, paths)`: a copy with only those paths.
- `traverse(obj, callback, options)`: visits every value, calling back with `{ value, path, key, depth, parent }`.
  `options.maxDepth` limits the walk.

## Types

`PandaPlugin`, `PandaHooks`, and every argument type are exported from `@pandacss/types`.


---


## recipes/

The recipes/ folder — generated modules for every config recipe in your theme.

**Folder:** `styled-system/recipes/`  
**Import:** `import { button } from '../styled-system/recipes'`

Codegen writes one module per **config** recipe (for example `recipes/button.ts`) plus `recipes/index.ts`. Each export
is a function: pass variants, get a class name (or a slot map for slot recipes).

```ts
import { button } from '../styled-system/recipes'

button({ size: 'sm', visual: 'solid' })
```

These come from `theme.recipes` / `theme.slotRecipes` in config (`defineRecipe` / `defineSlotRecipe`), not from
colocated [`cva`](/docs/reference/css#cva) / [`sva`](/docs/reference/css#sva) in your components.

## Types

Variant types ship next to the recipe:

```ts
import { button, type ButtonVariantProps } from '../styled-system/recipes'
```

Exact type names follow the theme key (`button` → `ButtonVariant` / `ButtonVariantProps`).

## Atomic vs config

| Need                            | Use                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Variants local to one component | [`cva`](/docs/reference/css#cva) / [`sva`](/docs/reference/css#sva) in `css/` |
| Shared design-system recipe     | Config recipe → this `recipes/` folder                                        |

## Full guides

- [Recipes overview](/docs/recipes/overview)
- [Config Recipe](/docs/recipes/config-recipe)
- [Config Slot Recipe](/docs/recipes/config-recipe#config-slot-recipe)
- [Slot Recipe](/docs/recipes/slot-recipes)
- [Atomic Recipe](/docs/recipes/atomic-recipe) (`cva`, not this folder)

## See also

- [css/](/docs/reference/css) — `cva()` and `sva()`
- [jsx/](/docs/reference/jsx) — recipe context helpers
- [Styled System overview](/docs/reference/styled-system)


---


## Sizing

Style properties for controlling the size of an element.

Style properties for controlling the size of an element.

## Width

Use the `width` or `w` property to set the width of an element.

```jsx
<div className={css({ width: '5' })} />
<div className={css({ w: '5' })} /> // shorthand
```

### Fractional width

Use can set fractional widths using the `width` or `w` property.

Values can be within the following ranges:

- Thirds: `1/3` to `2/3`
- Fourths: `1/4` to `3/4`
- Fifths: `1/5` to `4/5`
- Sixths: `1/6` to `5/6`
- Twelfths: `1/12` to `11/12`

```jsx
<div className={css({ width: '1/2' })} />
<div className={css({ w: '1/2' })} /> // shorthand

<div className={css({ width: '1/3' })} />
<div className={css({ w: '1/3' })} /> // shorthand
```

### Max width

Use the `maxWidth` or `maxW` property to set the maximum width of an element.

```jsx
<div className={css({ maxWidth: '5' })} />
<div className={css({ maxW: '5' })} /> // shorthand
```

### Min width

Use the `minWidth` or `minW` property to set the minimum width of an element.

```jsx
<div className={css({ minWidth: '5' })} />
<div className={css({ minW: '5' })} /> // shorthand
```

| Prop               | CSS Property | Token Category |
| ------------------ | ------------ | -------------- |
| `w`, `width`       | `width`      | `sizes`        |
| `maxW`, `maxWidth` | `max-width`  | `sizes`        |
| `minW`, `minWidth` | `min-width`  | `sizes`        |

## Height

Use the `height` or `h` property to set the height of an element.

```jsx
<div className={css({ height: '5' })} />
<div className={css({ h: '5' })} /> // shorthand
```

### Fractional height

Use can set fractional heights using the `height` or `h` property.

Values can be within the following ranges:

- Thirds: `1/3` to `2/3`
- Fourths: `1/4` to `3/4`
- Fifths: `1/5` to `4/5`
- Sixths: `1/6` to `5/6`

```jsx
<div className={css({ height: '1/2' })} />
<div className={css({ h: '1/2' })} /> // shorthand
```

### Relative heights

You can use the modern relative height values `dvh`, `svh`, `lvh`.

```jsx
<div className={css({ height: 'dvh' })} />
<div className={css({ h: 'dvh' })} /> // shorthand
```

### Max height

Use the `maxHeight` or `maxH` property to set the maximum height of an element.

```jsx
<div className={css({ maxHeight: '5' })} />
<div className={css({ maxH: '5' })} /> // shorthand
```

### Min height

Use the `minHeight` or `minH` property to set the minimum height of an element.

```jsx
<div className={css({ minHeight: '5' })} />
<div className={css({ minH: '5' })} /> // shorthand
```

| Prop                | CSS Property | Token Category |
| ------------------- | ------------ | -------------- |
| `h`, `height`       | `height`     | `sizes`        |
| `maxH`, `maxHeight` | `max-height` | `sizes`        |
| `minH`, `minHeight` | `min-height` | `sizes`        |

### Size

Use the `boxSize` property to set the width and height of an element.

```jsx
<div className={css({ boxSize: '24' })} />
```

| Prop      | CSS Property    | Token Category |
| --------- | --------------- | -------------- |
| `boxSize` | `width, height` | `sizes`        |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Width', 'Height']} />


---


## Spacing

Style properties for controlling the padding of an element.

## Padding

### All sides

Use the `padding` property to apply padding on all sides of an element

```jsx
<div className={css({ padding: '4' })} />
<div className={css({ p: '4' })} /> // shorthand
```

### Specific sides

Use the `padding{Left|Right|Top|Bottom}` to apply padding on one side of an element

```jsx
<div className={css({ paddingLeft: '3' })} />
<div className={css({ pl: '3' })} /> // shorthand

<div className={css({ paddingTop: '3' })} />
<div className={css({ pt: '3' })} /> // shorthand
```

### Horizontal and Vertical padding

Use the `padding{X|Y}` properties to apply padding on the horizontal and vertical axis of an element

```jsx
<div className={css({ paddingX: '8' })} />
<div className={css({ px: '8' })} /> // shorthand

<div className={css({ paddingY: '8' })} />
<div className={css({ py: '8' })} /> // shorthand
```

| Prop                  | CSS Property     | Token Category |
| --------------------- | ---------------- | -------------- |
| `p`,`padding`         | `padding`        | `spacing`      |
| `pl`, `paddingLeft`   | `padding-left`   | `spacing`      |
| `pr`, `paddingRight`  | `padding-right`  | `spacing`      |
| `pt`, `paddingTop`    | `padding-top`    | `spacing`      |
| `pb`, `paddingBottom` | `padding-bottom` | `spacing`      |
| `px`, `paddingX`      | `padding-inline` | `spacing`      |
| `py`, `paddingY`      | `padding-block`  | `spacing`      |

### Logical properties

Use the `padding{Start|End}` properties to apply padding on the logical axis of an element based on the text direction.

```jsx
<div className={css({ paddingStart: '8' })} />
<div className={css({ ps: '8' })} /> // shorthand

<div className={css({ paddingEnd: '8' })} />
<div className={css({ pe: '8' })} /> // shorthand
```

| Prop                 | CSS Property           | Token Category |
| -------------------- | ---------------------- | -------------- |
| `ps`, `paddingStart` | `padding-inline-start` | `spacing`      |
| `pe`, `paddingEnd`   | `padding-inline-end`   | `spacing`      |

## Margin

### All sides

Use the `margin` property to apply margin on all sides of an element

```jsx
<div className={css({ margin: '5' })} />
<div className={css({ m: '5' })} /> // shorthand
```

### Specific sides

Use the `margin{Left|Right|Top|Bottom}` to apply margin on one side of an element

```jsx
<div className={css({ marginLeft: '3' })} />
<div className={css({ ml: '3' })} /> // shorthand

<div className={css({ marginTop: '3' })} />
<div className={css({ mt: '3' })} /> // shorthand
```

### Horizontal and Vertical margin

Use the `margin{X|Y}` properties to apply margin on the horizontal and vertical axis of an element

```jsx
<div className={css({ marginX: '8' })} />
<div className={css({ mx: '8' })} /> // shorthand

<div className={css({ marginY: '8' })} />
<div className={css({ my: '8' })} /> // shorthand
```

| Prop                 | CSS Property    | Token Category |
| -------------------- | --------------- | -------------- |
| `m`,`margin`         | `margin`        | `spacing`      |
| `ml`, `marginLeft`   | `margin-left`   | `spacing`      |
| `mr`, `marginRight`  | `margin-right`  | `spacing`      |
| `mt`, `marginTop`    | `margin-top`    | `spacing`      |
| `mb`, `marginBottom` | `margin-bottom` | `spacing`      |
| `mx`, `marginX`      | `margin-left`   | `spacing`      |
| `my`, `marginY`      | `margin-top`    | `spacing`      |

### Logical properties

Use the `margin{Start|End}` properties to apply margin on the logical axis of an element based on the text direction.

```jsx
<div className={css({ marginStart: '8' })} />
<div className={css({ ms: '8' })} /> // shorthand

<div className={css({ marginEnd: '8' })} />
<div className={css({ me: '8' })} /> // shorthand
```

| Prop                | CSS Property          | Token Category |
| ------------------- | --------------------- | -------------- |
| `ms`, `marginStart` | `margin-inline-start` | `spacing`      |
| `me`, `marginEnd`   | `margin-inline-end`   | `spacing`      |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Padding', 'Margin']} />


---


## Styled System

What’s inside the generated styled-system folder, and where each entrypoint is documented.

`styled-system` is the package Panda codegen writes for your project (path from
[`config.outdir`](/docs/reference/config#outdir)). You import `css`, patterns, recipes, and JSX helpers from it.

It is a **build artifact**, not a style engine. The helpers map style objects to class name strings. The CSS itself
comes from extraction. Don't edit these files by hand; regenerate with `panda codegen` or `panda build`.

For the mental model (codegen vs extraction), see [Why Panda → How it works](/docs/get-started/why-panda#how-it-works).

## Folder layout

Exact files depend on your config (`jsxFramework`, recipes, patterns, and so on).

<FileTree>
  <FileTree.Folder name="styled-system" defaultOpen>
    <FileTree.Folder name="css" defaultOpen>
      <FileTree.File name="css.ts" />
      <FileTree.File name="cva.ts" />
      <FileTree.File name="sva.ts" />
      <FileTree.File name="cx.ts" />
      <FileTree.File name="view-transition.ts" />
      <FileTree.File name="index.ts" />
    </FileTree.Folder>
    <FileTree.Folder name="jsx" />
    <FileTree.Folder name="patterns" />
    <FileTree.Folder name="recipes" />
    <FileTree.Folder name="tokens" />
    <FileTree.Folder name="types" />
    <FileTree.File name="helpers.js" />
    <FileTree.File name="styles.css" />
  </FileTree.Folder>
</FileTree>

## Entrypoints

- [`css/`](/docs/reference/css): `css()`, `cx()`, `cva()`, `sva()`, `viewTransition()`, and `positionTry()`. Style
  objects to class names.
- [`patterns/`](/docs/reference/patterns): layout primitive functions.
- [`recipes/`](/docs/reference/recipes): config recipes from your theme.
- [`jsx/`](/docs/reference/jsx): the `styled` factory and JSX patterns.
- [`tokens/`](/docs/reference/tokens): `token()` and `token.var()` in JS.
- [`types/`](/docs/reference/types): generated TypeScript types.

Root files: `helpers.js` (shared runtime helpers) and `styles.css` (extracted atomic CSS).

## Generation and commit policy

- **Written by** `panda`, `panda build`, or `panda codegen` from your resolved config.
- **Not meant to be edited.** Customizations belong in `panda.config.ts` and your source files.
- **Usually gitignored.** A design system publishes it through `panda lib`. See
  [Publishing](/docs/design-systems/publishing).

## See also

- [Why Panda → How it works](/docs/get-started/why-panda#how-it-works)
- [CLI](/docs/reference/cli) — `panda codegen`, `panda build`, `panda cssgen`
- [Config `outdir`](/docs/reference/config#outdir)


---


## SVG

Panda provides utilities for styling SVG elements.

Panda provides utilities for styling SVG elements.

## Fill

Change the fill color of an SVG element.

```jsx
<svg className={css({ fill: 'blue.500' })} />
```

| Prop   | CSS Property | Token Category |
| ------ | ------------ | -------------- |
| `fill` | `fill`       | `colors`       |

## Stroke

Change the stroke color of an SVG element.

```jsx
<svg className={css({ stroke: 'blue.500' })} />
```

| Prop     | CSS Property | Token Category |
| -------- | ------------ | -------------- |
| `stroke` | `stroke`     | colors         |

## Stroke Width

Change the stroke width of an SVG element.

```jsx
<svg className={css({ strokeWidth: '1px' })} />
```

| Prop          | CSS Property   | Token Category |
| ------------- | -------------- | -------------- |
| `strokeWidth` | `stroke-width` | borderWidths   |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable
  properties={['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'strokeDashoffset', 'strokeLinecap']}
  label="SVG"
/>


---


## Tables

Panda provides utilities for styling tables.

Panda provides utilities for styling tables.

## Border Spacing

Control the border-spacing property of a table.

```jsx
<table className={css({ borderSpacing: '2' })} />
```

| Prop            | CSS Property     | Token Category |
| --------------- | ---------------- | -------------- |
| `borderSpacing` | `border-spacing` | `spacing`      |

## Border Spacing X

Control the horizontal border-spacing property of a table.

```jsx
<table className={css({ borderSpacingX: '2' })} />
```

| Prop             | CSS Property     | Token Category |
| ---------------- | ---------------- | -------------- |
| `borderSpacingX` | `border-spacing` | `spacing`      |

## Border Spacing Y

Control the vertical border-spacing property of a table.

```jsx
<table className={css({ borderSpacingY: '2' })} />
```

| Prop             | CSS Property     | Token Category |
| ---------------- | ---------------- | -------------- |
| `borderSpacingY` | `border-spacing` | `spacing`      |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Table']} />


---


## tokens/

The tokens/ folder — token() and token.var() for reading theme values in JavaScript.

**Folder:** `styled-system/tokens/`  
**Import:** `import { token } from '../styled-system/tokens'`

Usually a single `tokens/index` module. Use it when you need a resolved token value (or CSS variable) **outside** a
style object — charts, canvas, third-party APIs, inline styles.

```ts
import { token } from '../styled-system/tokens'

token('colors.blue.500')
// => "var(--colors-blue-500)" (or the raw value, depending on usage)

token.var('colors.blue.500')
// => "var(--colors-blue-500)"
```

Both accept an optional fallback:

```ts
token('colors.brand', '#0af')
token.var('colors.brand', '#0af')
```

## Prefer style objects first

For normal UI, put tokens in [`css()`](/docs/reference/css) or style props (`color: 'blue.500'`). Panda resolves them in
the generated CSS. Reach for `token()` when you must read the value in JS.

Inside style strings you can also use the `token()` **string** helper or `{path.to.token}` reference syntax; that is
documented under [Tokens](/docs/theming/tokens#reference-a-token), not this generated module.

## Defining tokens

Theme authoring lives under [Theming → Tokens](/docs/theming/tokens). This page is only the generated runtime reader.

## See also

- [Tokens](/docs/theming/tokens)
- [Tokens](/docs/theming/tokens)
- [Styled System overview](/docs/reference/styled-system)


---


## Transforms

Panda provides utilities for transforming elements.

Panda provides utilities for transforming elements.

Each family works the same way: the axis utilities set a CSS variable, and the parent utility set to `auto` composes
them. An axis on its own does nothing until you opt in.

```jsx
<div className={css({ translateX: '20px' })} /> // sets the variable, moves nothing
<div className={css({ translate: 'auto', translateX: '20px' })} /> // moves
```

## Scale

Control the scale property. Supported value is `auto`

```jsx
<div className={css({ scale: 'auto' })} /> // => 'var(--scale-x) var(--scale-y)'
```

### Scale X

Control the scaleX property.

```jsx
<div className={css({ scaleX: '1.3' })} /> // => --scale-x: 1.3;
```

### Scale Y

Control the scaleY property.

```jsx
<div className={css({ scaleY: '0.4' })} /> // => --scale-y: 0.4;
```

## Translate

Control the translate property. Supported values are `auto` and `auto-3d`

```jsx
<div className={css({ translate: 'auto' })} /> // => 'var(--translate-x) var(--translate-y)'
<div className={css({ translate: 'auto-3d' })} /> // adds 'var(--translate-z)'
```

### Translate X

Control the translateX property.

```jsx
<div className={css({ translateX: '50%' })} /> // => --translate-x: 50%;
<div className={css({ x: '20px' })} /> // shorthand
```

### Translate Y

Control the translateY property.

```jsx
<div className={css({ translateY: '-40%' })} /> // => --translate-y: -40%;
<div className={css({ y: '4rem' })} /> // shorthand
```

### Translate Z

Control the translateZ property. Takes `spacing` tokens or a length, and needs `translate: 'auto-3d'`.

```jsx
<div className={css({ translate: 'auto-3d', translateZ: '4' })} /> // => --translate-z: var(--spacing-4);
<div className={css({ z: '10px' })} /> // shorthand
```

Percentages are not allowed here. CSS resolves a percentage translation against the element's size on that axis, and
there is no size in z, so a percentage would invalidate the whole declaration.

## Rotate

Control the rotate property. Pass an angle for a plain 2D rotation, or `auto` to compose the axis utilities.

```jsx
<div className={css({ rotate: '45deg' })} /> // => rotate: 45deg;
<div className={css({ rotate: 'auto' })} /> // => transform: var(--rotate-x,) var(--rotate-y,) var(--rotate-z,);
```

`auto` composes on `transform` rather than on the `rotate` property, because `rotate` holds exactly one rotation. That
is what lets you combine axes.

```jsx
<div className={css({ rotate: 'auto', rotateX: '45deg', rotateY: '30deg' })} /> // both apply
```

`auto-3d` is accepted as an alias of `auto`. An axis you never set contributes nothing either way.

### Rotate X, Y and Z

Control the rotateX, rotateY and rotateZ properties. Each stores a rotation function and waits for `rotate: 'auto'`.

```jsx
<div className={css({ rotate: 'auto', rotateX: '45deg' })} /> // => --rotate-x: rotateX(45deg);
<div className={css({ rotate: 'auto', rotateZ: '0.5turn' })} /> // => --rotate-z: rotateZ(0.5turn);
```

Two things to know when you combine `rotate: 'auto'` with other utilities:

- A raw `transform` value overrides it, since both write `transform`. Write the functions together if you need both:
  `transform: 'skewX(10deg) rotateX(45deg)'`.
- With a non-uniform `scale`, the rotation applies after the scaling rather than before. Uniform scales are unaffected.

## Transform

Control the transform property directly. This is the escape hatch for anything the utilities above don't cover.

```jsx
<div className={css({ transform: 'skewX(10deg)' })} />
```

### Transform Origin

Control the transform-origin property.

```jsx
<div className={css({ transformOrigin: 'top left' })} />
```

### Transform Box

Control the transform-box property.

```jsx
<div className={css({ transformBox: 'fill-box' })} />
```

### Transform Style

Control the transform-style property. Use `preserve-3d` when you want children to sit in the parent's 3D space.

```jsx
<div className={css({ transformStyle: 'preserve-3d' })} />
```

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Transform']} />


---


## Transitions

Panda provides utilities for defining and customizing transitions.

Panda provides utilities for defining and customizing transitions.

## Transition

A shorthand utility for defining common transition sets.

Values are `all`, `common`, `colors`, `opacity`, `shadow`, `transform`.

```jsx
<div className={css({ transition: 'all' })} />
<div className={css({ transitionTimingFunction: 'linear' })} />
<div className={css({ transitionDelay: 'fast' })} />
<div className={css({ transitionDuration: 'faster' })} />
```

| Prop                       | CSS Property                 | Token Category |
| -------------------------- | ---------------------------- | -------------- |
| `transitionTimingFunction` | `transition-timing-function	` | `easings`      |
| `transitionDelay`          | `transition-delay	`           | `durations`    |
| `transitionDuration`       | `transition-duration	`        | `durations`    |

## Animation

Control the animation property. It supports the `animations` token category.

```jsx
<div className={css({ animation: 'bounce' })} />
<div className={css({ animationName: 'pulse' })} />
<div className={css({ animationDelay: 'fast' })} />
```

| Prop             | CSS Property      | Token Category |
| ---------------- | ----------------- | -------------- |
| `animation`      | `animation-name	`  | animations     |
| `animationName`  | `animation-name	`  | animationName  |
| `animationDelay` | `animation-delay	` | durations      |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Transition']} />


---


## types/

The types/ folder — generated TypeScript types for style objects, tokens, recipes, patterns, and JSX.

**Folder:** `styled-system/types/`  
**Import:** `import type { … } from '../styled-system/types'`

Codegen emits TypeScript that mirrors your theme, utilities, conditions, patterns, and recipes. Use these when wrapping
Panda APIs in your own components or libraries.

Exact unions (`ColorToken`, breakpoint keys, …) come from **your** config. The shapes below are always there; the member
lists grow with your tokens and recipes.

Some helpers are also re-exported from `styled-system/css` and `styled-system/jsx` for convenience. The definitions
still live under `types/`.

## Files

| File            | What it exports                                     |
| --------------- | --------------------------------------------------- |
| `types/system`  | Style objects, conditions, CSS property value types |
| `types/tokens`  | Token path unions for `token()`                     |
| `types/recipe`  | Recipe / slot-recipe creators and variant helpers   |
| `types/pattern` | Pattern config shapes                               |
| `types/jsx`     | Factory component props (`HTMLStyledProps`, …)      |
| `types/index`   | Barrel re-exports                                   |

## Style objects — `types/system`

### `SystemStyleObject`

The type of a Panda style object: utilities, conditions, nested selectors, and CSS variables.

```ts
import type { SystemStyleObject } from '../styled-system/types'

const styles: SystemStyleObject = {
  display: 'flex',
  gap: '4',
  color: 'blue.500',
  _hover: { color: 'blue.600' },
  md: { px: '6' },
  '& > span': { fontWeight: 'semibold' }
}
```

Use this to type shared style constants, function args, or anything you later pass to [`css()`](/docs/reference/css).

### `SystemStyleObjectWith<K>` / `SystemStyleObjectWithout<K>`

A style object limited to some properties, for a component that lets consumers override a few styles but not all.
Conditions and nested selectors still work inside it; CSS variables are left out.

```ts
import type { SystemStyleObjectWith } from '../styled-system/types'

interface ButtonProps {
  css?: SystemStyleObjectWith<'margin' | 'marginTop' | 'width'>
}

<Button css={{ marginTop: '4', _hover: { width: 'full' } }} /> // ok
<Button css={{ color: 'red.500' }} /> // type error
```

`SystemStyleObjectWithout<K>` is the inverse: everything except the listed properties. A value that already has a wider
type, like `{ color?: string }`, is not checked; TypeScript only rejects extra properties in object literals.

### `JsxStyleProps`

`SystemStyleObject` plus an optional `css` prop (for nesting another style object on JSX components).

```ts
import type { JsxStyleProps } from '../styled-system/types'

interface IconProps {
  color?: JsxStyleProps['color']
  size?: JsxStyleProps['width']
}
```

### `ConditionalValue<T>`

A value that may be plain, responsive/conditional, or nested under condition keys (`_hover`, `md`, …).

```ts
import type { ConditionalValue } from '../styled-system/types'

type Gap = ConditionalValue<'1' | '2' | '4'>
// '1' | '2' | '4' | { base?: ..., md?: ..., _hover?: ... } | ...
```

### `Condition` / `Conditions`

`Condition` is the union of every condition key in your config (`_hover`, `md`, `_dark`, …). `Conditions` maps each key
to its CSS selector string. Useful when building custom utilities or typing condition maps.

## Tokens — `types/tokens`

Generated from your theme. Typical exports:

| Type                                         | Role                                                               |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `Tokens`                                     | Interface of category → token name unions (`colors`, `spacing`, …) |
| `ColorToken`, `SpacingToken`, `SizeToken`, … | Per-category name unions                                           |
| `Token`                                      | Dot-path union, e.g. `` `colors.${ColorToken}` ``                  |
| `TokenPath`                                  | `Token` plus color opacity paths (`colors.blue.500/50`)            |
| `ColorPalette`                               | Virtual / palette names for `colorPalette`                         |
| `TokenValue<'colors'>`                       | Resolves to the `ColorToken` union                                 |

```ts
import type { TokenPath, ColorToken } from '../styled-system/types'
import { token } from '../styled-system/tokens'

function swatch(path: TokenPath) {
  return token(path)
}

const brand: ColorToken = 'blue.500'
swatch('colors.blue.500')
swatch('colors.blue.500/50') // opacity modifier
```

Runtime reader: [`tokens/`](/docs/reference/tokens). Authoring tokens: [Theming → Tokens](/docs/theming/tokens).

## Recipes — `types/recipe`

### Inferring variants from `cva` / `sva`

These are the types you reach for most often. They are re-exported from `styled-system/css`.

| Type                                | Result                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| `RecipeVariantProps<typeof recipe>` | Optional variant props for JSX (`size?: 'sm' \| 'md'`) |
| `RecipeVariant<typeof recipe>`      | Required variant map (`size: 'sm' \| 'md'`)            |

```ts
import { cva, type RecipeVariantProps, type RecipeVariant } from '../styled-system/css'

const button = cva({
  base: { rounded: 'md' },
  variants: {
    size: {
      sm: { px: '2', py: '1' },
      md: { px: '4', py: '2' }
    }
  }
})

type ButtonProps = RecipeVariantProps<typeof button>
// { size?: 'sm' | 'md' | undefined }

type ButtonVariants = RecipeVariant<typeof button>
// { size: 'sm' | 'md' }
```

Same helpers work with [`sva()`](/docs/reference/css#sva).

### Config / definition shapes

Used when typing recipe configs or building abstractions on top of Panda:

| Type                                      | Role                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `RecipeDefinition<T>`                     | Shape passed to `cva` / `defineRecipe`                            |
| `SlotRecipeDefinition`                    | Shape for `sva` / `defineSlotRecipe`                              |
| `RecipeSelection<T>`                      | Partial variant selection object                                  |
| `RecipeRuntimeFn`                         | Runtime recipe function (`__type`, `raw`, `splitVariantProps`, …) |
| `SlotRecipeRuntimeFn`                     | Runtime slot recipe (returns per-slot class map)                  |
| `RecipeCreatorFn` / `SlotRecipeCreatorFn` | Types of `cva` / `sva` themselves                                 |

```ts
import type { RecipeDefinition } from '../styled-system/types'

const shared: RecipeDefinition<{
  size: { sm: {}; md: {} }
}> = {
  base: { display: 'inline-flex' },
  variants: {
    size: {
      sm: { px: '2' },
      md: { px: '4' }
    }
  }
}
```

## Patterns — `types/pattern`

| Type                                         | Role                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| `PatternConfig<Props>`                       | Config shape for `definePattern`                                |
| `PatternPropertyValue` / `PatternTokenValue` | Property and conditional value helpers                          |
| `PatternHelpers`                             | Helpers passed to a pattern `transform` (`map`, `isCssUnit`, …) |

For component props, prefer the generated pattern prop types from `jsx/` (for example `StackProps`) or the pattern
function’s parameters. See [`patterns/`](/docs/reference/patterns) and [`jsx/`](/docs/reference/jsx).

## JSX — `types/jsx`

Generated when [`jsxFramework`](/docs/reference/config#jsxframework) is set. Names follow your `jsxFactory` (often
`styled` → `HTMLStyledProps`; this docs site uses `panda` → `HTMLPandaProps`). Import from `styled-system/jsx` in app
code; the definitions still live under `types/jsx`.

| Type                                      | Role                                                   |
| ----------------------------------------- | ------------------------------------------------------ |
| `HTMLStyledProps<'button'>`               | Native element props + style props + `as` / `unstyled` |
| `JsxStyleProps`                           | Style props only (also on `types/system`)              |
| `StyledVariantProps<typeof Comp>`         | Variants from a `styled(component, recipe)` result     |
| `PandaComponent` / `JsxFactory`           | Factory function / component instance types            |
| `ComponentProps<T>`                       | Props of an intrinsic or custom element                |
| `AsProps` / `UnstyledProps` / `DataAttrs` | `as`, `unstyled`, and `data-*` typing                  |

```ts
import { styled } from '../styled-system/jsx'
import type { HTMLStyledProps, StyledVariantProps } from '../styled-system/jsx'

type BoxProps = HTMLStyledProps<'div'>

const Button = styled('button', {
  base: { rounded: 'md' },
  variants: {
    visual: {
      solid: { bg: 'blue.500', color: 'white' },
      outline: { borderWidth: '1px' }
    }
  }
})

type ButtonVariantProps = StyledVariantProps<typeof Button>
// { visual?: 'solid' | 'outline' | undefined }
```

Typing a custom component that accepts style props:

```tsx
import { css } from '../styled-system/css'
import { splitCssProps } from '../styled-system/jsx'
import type { HTMLStyledProps } from '../styled-system/jsx'

export function Card(props: HTMLStyledProps<'div'>) {
  const [cssProps, restProps] = splitCssProps(props)
  const { css: cssProp, ...styleProps } = cssProps
  const className = css({ rounded: 'lg', p: '4' }, styleProps, cssProp)
  return <div {...restProps} className={className} />
}
```

More JSX typing patterns: [Style props → TypeScript](/docs/styling/style-props#typescript).

## See also

- [css/](/docs/reference/css) · [jsx/](/docs/reference/jsx) · [tokens/](/docs/reference/tokens)
- [Style props](/docs/styling/style-props#typescript)
- [Atomic recipes → Exported Types](/docs/recipes/atomic-recipe#exported-types)
- [Styled System overview](/docs/reference/styled-system)


---


## Typography

Panda's typography utilities.

Panda provides utilities and style properties for styling text.

## Font Properties

```jsx
<div className={css({ fontFamily: 'mono' })} />
```

| Prop                  | CSS Property            | Token Category   |
| --------------------- | ----------------------- | ---------------- |
| `fontFamily`          | `font-family`           | `fonts`          |
| `fontSize`            | `font-size`             | `fontSizes`      |
| `fontWeight`          | `font-weight`           | `fontWeights`    |
| `letterSpacing`       | `letter-spacing`        | `letterSpacings` |
| `lineHeight`          | `line-height`           | `lineHeights`    |
| `textDecorationColor` | `text-decoration-color` | `colors`         |
| `textEmphasisColor`   | `text-emphasis-color`   | `colors`         |
| `textIndent`          | `text-indent`           | `spacing`        |
| `textShadow`          | `text-shadow`           | `shadows`        |
| `textWrap`            | `text-wrap`             | —                |

## Line Clamp (Truncation)

How to truncate multi-line text

```jsx
<div className={css({ lineClamp: 2 })}>Some long piece of text</div>

<div className={css({ lineClamp: 2 })}>Truncated text</div>
```

| Prop        | CSS Property        | Token Category |
| ----------- | ------------------- | -------------- |
| `lineClamp` | `webkit-line-clamp` | none           |
| `truncate`  | `text-overflow`     | none           |

## Text Styles

Utilities for applying a composition of typography properties.

```jsx
<h1
  className={css({
    textStyle: 'heading/marketing'
  })}
>
  Hello World
</h1>
```

| Prop        | Config       |
| ----------- | ------------ |
| `textStyle` | `textStyles` |

## Full reference

Generated from `@pandacss/preset-base`, so this table always matches the utilities Panda ships.

<UtilityTable groups={['Typography']} />


---

_This content is automatically generated from the official Panda CSS documentation._
