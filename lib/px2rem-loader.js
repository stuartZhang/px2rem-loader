const loaderUtils = require('loader-utils')
const Px2rem = require('px2rem')
const path = require('path')
const _ = require('underscore')

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  let excludes;
  if (typeof options.exclude === 'string') {
    excludes = [options.exclude]
  } else if (Array.isArray(options.exclude)) {
    excludes = options.exclude;
  }
  if (this.context && excludes) {
    for (const exclude of excludes) {
      const fp = path.isAbsolute(exclude) ? exclude : path.resolve(exclude);
      if (this.context.startsWith(fp)) {
        return source;
      }
    }
  }
  const px2remIns = new Px2rem(_.omit(options, 'exclude'))
  return px2remIns.generateRem(source)
}
