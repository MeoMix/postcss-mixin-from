# PostCSS Mixin From [![Build Status][ci-img]][ci]

[PostCSS] plugin which enhances [postcss-mixins] with the ability to inline import from other files.

Input:
```css
.installButton {
  @mixin raisedButton from './button';
  background-color: blue;
}

/* button.css */
@define-mixin raisedButton {
  color: white;
}
```

Output:
```css
.installButton {
  color: white;
  background-color: blue;
}
```

## Usage

This plugin is environment-independent. It must be provided the ability to load other CSS files by the end user.

An example using SystemJS:

```js
const getFileText = (filePath, relativeToPath) => {
  const isBundling = typeof window === 'undefined';
  let absolutePath = filePath;

  if (isBundling && filePath[0] === '.') {
    absolutePath = path.resolve(path.dirname(relativeToPath), filePath);
    // css.source.input.from is incorrect when building. Need to convert from relative and then drop root
    // so that when giving the path to SystemJS' fetch it works as expected.
    absolutePath = absolutePath.replace(path.parse(absolutePath).root, '');
  }

  const canonicalParent = relativeToPath.replace(/^\//, '');

  return System.normalize(absolutePath, path.join(System.baseURL, canonicalParent))
    .then((normalizedPath) => {
      return System.fetch({
        address: normalizedPath,
        metadata: {}
      });
    });
};
```

Be sure to run this plugin before [postcss-mixins].
```js
const mixinFrom = require('postcss-mixin-from');
const mixins = require('postcss-mixins');
postcss([
  mixinFrom({getFileText}),
  mixins
])
```

See [PostCSS] docs for examples for your environment.

[PostCSS]: https://github.com/postcss/postcss
[postcss-mixins]: https://github.com/postcss/postcss-mixins
[ci-img]:  https://travis-ci.org/MeoMix/postcss-mixin-from.svg
[ci]:      https://travis-ci.org/MeoMix/postcss-mixin-from
