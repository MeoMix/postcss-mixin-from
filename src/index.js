import * as postcss from 'postcss';

// This PostCSS plugin extends the functionality of postcss-mixin.
// It allows for the writing of CSS such as:
// .foo {
//   @mixin fancyMixin from './fooMixin[.trait]'
// }
// The css file-ending is optional. An @define-mixin atRule found in fooMixin.css will be
// inlined into the top of the file requesting to use fancyMixin.
class MixinFrom {
  constructor(getFileText) {
    this.plugin = this.plugin.bind(this);

    if (getFileText) {
      this._getFileText = getFileText;
    }
  }

  plugin(css) {
    const promises = [];

    css.walkAtRules('mixin', (atRule) => {
      const { needFetch, mixinName, defineMixinPath } = this._getMixinData(atRule);

      if (needFetch) {
        // Rewrite the mixin rule to be valid for mixins postcss plugin by dropping " from './path'"
        // e.g. @mixin exampleMixin from './foo.css'; --> @mixin exampleMixin
        atRule.params = mixinName;

        // Load the file where mixin definition is believed to be.
        // If found, add the mixin definition to the top of this file.
        const promise = this._getFileText(defineMixinPath, css.source.input.from)
          .then((importedCssText) => {
            this._insertMixinDefinition(css, mixinName, defineMixinPath, importedCssText);
          });

        promises.push(promise);
      }
    });

    return Promise.all(promises);
  }

  _getMixinData(atRule) {
    const mixinData = {
      mixinName: '',
      defineMixinPath: '',
      needFetch: false
    };

    // We're looking for atRules of the form:
    // @mixin exampleMixin from './foo.trait';
    const matchImports = /^(.+?)\s+from\s+("[^"]*"|'[^']*'|[\w-]+)$/;
    const regexpResult = matchImports.exec(atRule.params);

    if (regexpResult) {
      mixinData.needFetch = true;
      mixinData.mixinName = regexpResult[1];
      let rawPath = this._removeWrappingQuotes(regexpResult[2]);

      // Assume trait file if file extension is missing.
      if (!rawPath.includes('.trait')) {
        rawPath = `${rawPath}.trait`;
      }

      mixinData.defineMixinPath = rawPath;
    }

    return mixinData;
  }

  // This method will be overidden during construction
  _getFileText() {
    throw new Error('Expected getFileText to be provided as option to constructor');
  }

  _insertMixinDefinition(currentCssNode, mixinName, defineMixinPath, importedCssText) {
    let mixinDefinition = null;
    const parsedCss = postcss.parse(importedCssText);

    parsedCss.walkAtRules('mixin-definition', (atRule) => {
      if (atRule.params === mixinName) {
        mixinDefinition = atRule;
        // Rename mixinDefinition to define-mixin so postcss-mixins will utilize it.
        // Don't name initial rule define-mixin or postcss-mixins will delete it prematurely.
        mixinDefinition.name = 'define-mixin';
      }
    });

    if (mixinDefinition) {
      // Add the loaded mixin to the top of the file requiring it.
      currentCssNode.prepend(mixinDefinition);
    } else {
      throw new Error(`Failed to find mixin ${mixinName} at ${defineMixinPath}`);
    }
  }

  _removeWrappingQuotes(string) {
    return string.replace(/^["']|["']$/g, '');
  }
}

export default postcss.plugin('mixinFrom', (options = {}) => {
  return new MixinFrom(options.getFileText).plugin;
});