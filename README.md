# PostCSS Mixin From [![Build Status][ci-img]][ci]

[PostCSS] plugin which enhances postcss-mixins with the ability to inline import from other files.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/MeoMix/postcss-mixin-from.svg
[ci]:      https://travis-ci.org/MeoMix/postcss-mixin-from

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-mixin-from') ])
```

See [PostCSS] docs for examples for your environment.
