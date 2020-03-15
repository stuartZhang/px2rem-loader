# px2rem-loader-stzhang

作为[px2rem](https://www.npmjs.com/package/px2rem)的`webpack-loader`包装器，相比于原作品`px2rem-loader`，`px2rem-loader-stzhang`提供了三个额外的新功能：

1. 配置项`include`显示地指定哪些样式文件需要被[px2rem](https://www.npmjs.com/package/px2rem)处理。
   1. 没有被包含在`include`子集内的样式文件都不会被处理。
   2. 若没有`include`配置项，缺省行为：**处理所有样式文件**。
2. 配置项`exclude`显示地指定哪些样式文件不被[px2rem](https://www.npmjs.com/package/px2rem)处理。
   1. 若同一个样式文件同时出现在`include`与`exclude`配置项中，则`exclude`配置项的优先级更高。
   2. 若要调转`include`与`exclude`配置项的优先次序，则需要显示地配置`priorInclude`为`true`。
   3. 若没有`include`配置项，缺省行为：**不排除任何样式文件**。
3. 允许在同一套`webpack`配置中同时存在多个`remUnit`配置项。并且，每个`remUnit`配置项被应用于不同的样式文件组。
   1. 需要使用配置项`multiRemUnits`来激活此功能。
   2. 此【多`remUnit`配置项模式】与【单`remUnit`配置项模式】是互斥的。

## 多`remUnit`配置项模式-注意事项

1. `webpack`配置工程师需要自己确保目标样式文件没有同时落入多个`remUnit`样式文件组中。
   1. 借助`include`与`exclude`配置项，将遵循不同基准宽度的样式文件（和`.vue`文件）划分到正确的`remUnit`样式文件组中。
   2. 万一同一个样式文件就同时落入了多个`remUnit`样式文件组里，那么`multiRemUnits`配置数组中第一个匹配的配置对象生效，后续的不生效。
2. 【多`remUnit`配置项模式】与【单`remUnit`配置项模式】是互斥的。一旦`multiRemUnits`配置项出现在了`rules.options`中，同层级的任何其它配置项都会立即作废。`px2rem-loader-stzhang`加载器仅只会从`multiRemUnits`的配置对象数组中读取配置信息。

## 安装

`npm install px2rem-loader-stzhang`

## 用法

1. `include`与`exclude`配置项都是`Array`类型。每一个数组元素可以是`string`或`RegExp`类型。其中，
   1. `string`既可以是绝对路径，也可以是从项目根目录开始的相对路径。
      1. 若`string`指向一个文件夹，那么文件夹下的所有内容都将被【包含】或【排除】。
   2. `RegExp`的匹配目标是从项目根目录开始的相对路径，而不是目标样式文件的绝对路径。
2. `remUnit`配置项。无论是“全屏”，还是“iframe”方式显示，`remUnit`配置项都有如下方式计算：
   1. 若【设计稿】的内容全部显示在屏幕上，则`remUnit =`【设计稿】宽度`/ 10`。
   2. 若仅只画【设计稿】的【一部分】到屏幕上，则`remUnit =`【设计稿】中被画出【那一部分】的宽度`/ 10`。
3. `baseDpr`配置项。样式文件直接提供的尺寸值是针对`devicePixelRatio`等于几的。这取决于【设计稿】的定义。至少，使用【蓝湖】画出来【设计稿】的`dpr`默认值是`1`。如果你自己不在确定的话，就去问问`UX`设计师吧。

### 单`remUnit`配置项模式

```javascript
const px2remLoader = {
    loader: 'px2rem-loader-stzhang',
    options: {
        exclude: ['node_modules/element-ui'], // 第三方库，咱们不做 px2rem 的换算。
        remUnit: 13660 / 10,
        baseDpr: 1
    }
};

```

### 多`remUnit`配置项模式

多注意下面的`include`与`exclude`配置项，因为`webpack`配置工程师需要自己确保目标样式文件没有同时落入不同`remUnit`配置值的样式文件组中。

```javascript
const px2remLoader = {
    loader: 'px2rem-loader-stzhang',
    options: {
        multiRemUnits: [{
            exclude: [
                'node_modules/element-ui', // 第三方库，咱们不做 px2rem 的换算。
                'src/pages/EnterpriseAuthForm.vue' // * 在 open 弹出窗口中显示，它的【基准宽度】可不是【设计稿】宽度，而是【设计稿】中那一小块区域的宽度。
            ],
            remUnit: 13660 / 10,
            baseDpr: 1
        }, {
            include: ['src/pages/EnterpriseAuthForm.vue'], // * 在 open 弹出窗口中显示，它的【基准宽度】可不是【设计稿】宽度，而是【设计稿】中那一小块区域的宽度。
            remUnit: 505 / 10,
            baseDpr: 1
        }]
    }
};

```
