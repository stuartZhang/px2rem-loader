const loaderUtils = require('loader-utils');
const Px2rem = require('px2rem-stzhang');
const path = require('path');
const _ = require('underscore');
const validate = require('schema-utils');

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
    validate({
        title: 'px2rem-loader-stzhang',
        description: '每一个项目的配置',
        type: 'object',
        additionalProperties: false,
        properties: {
            ..._.omit(Px2rem.schema.properties, 'remUnit', 'baseDpr'),
            include: {
                anyOf: [{
                    type: 'string',
                    description: '接受 px2rem 换算的样式文件或vue文件路径字符串'
                }, {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    uniqueItems: true,
                    description: '接受 px2rem 换算的样式文件或vue文件路径数组'
                }]
            },
            exclude: {
                anyOf: [{
                    type: 'string',
                    description: '拒绝 px2rem 换算的样式文件或vue文件路径字符串'
                }, {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    uniqueItems: true,
                    description: '拒绝 px2rem 换算的样式文件或vue文件路径数组'
                }]
            },
            priorInclude: {
                type: 'boolean',
                description: '是/否包含优先'
            },
            remUnit: {
                type: 'number',
                description: '设计稿宽度（或对角线长度） 除以 10；若仅画设计稿内某区域里的内容时，则是设计稿中被绘制区域的宽度 除以 10。默认值 75。'
            },
            baseDpr: {
                type: 'number',
                description: '设计稿宽度（或对角线长度）对应的 device pixel ratio。默认值 2。'
            }
        },
        required: ['remUnit', 'baseDpr']
    }, options);
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
