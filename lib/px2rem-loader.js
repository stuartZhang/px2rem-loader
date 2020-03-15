const loaderUtils = require('loader-utils');
const Px2rem = require('px2rem');
const path = require('path');
const _ = require('underscore');

function normalizeCriterion(criterion){
    let criteria;
    if (typeof criterion === 'string' || criterion instanceof RegExp) {
        criteria = [criterion];
    } else if (Array.isArray(criterion) && criterion.length > 0) {
        criteria = criterion;
    }
    return criteria;
}
function match(target, criterion){
    if (typeof criterion === 'string') {
        const fp = path.isAbsolute(criterion) ? criterion : path.resolve(criterion);
        return target.startsWith(fp);
    }
    if (criterion instanceof RegExp) {
        return criterion.test(path.relative('.', target));
    }
    throw new Error(`不可处理的【文件路径匹配条件】：${typeof criterion}`);
}
function transform(source, sourcePath, options){
    const {priorInclude = false, include, exclude} = options;
    const includes = normalizeCriterion(include);
    const excludes = normalizeCriterion(exclude);
    //
    let preserve = false;
    if (includes) {
        if (includes.every(include => !match(sourcePath, include))) {
            return source;
        }
        if (priorInclude) {
            preserve = true;
        }
    }
    if (!preserve && excludes && excludes.some(exclude => match(sourcePath, exclude))) {
        return source;
    }
    const px2remIns = new Px2rem(_.omit(options, 'priorInclude', 'include', 'exclude'));
    return px2remIns.generateRem(source);
}
module.exports = function(source){
    const sourcePath = this.resourcePath || this.resource || this.context;
    const options = loaderUtils.getOptions(this);
    if (Array.isArray(options.multiRemUnits)) {
        return options.multiRemUnits.reduce((src, option) => transform(src, sourcePath, option), source);
    }
    return transform(source, sourcePath, options);
};
