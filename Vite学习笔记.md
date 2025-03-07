# Vite学习笔记

<br>

本文是在 vite 官方文档教程：https://cn.vitejs.dev/ 基础上，学习整理而来。



<br>

接下来我将通过对比 create-react-app 或 webpack 的形式来学习 vite。

### 本文目录：

* vite与webpack 的目标不同之处

* 创建初始化 react 或 vue 项目

* 使用TypeScript

* 关于CSS、sass样式

* px 转 rem

* px 转 rem 后兼容PC端

* px 转 vw/vh

* 引入静态文件资源

* 命令参数

* 使用插件

* 构建生产版本

* 项目常见配置

  * 配置调试IP和端口
  * 使用husky
  * 配置vscode
  * 使用prettier
  * 使用sass
  * 配置路径映射alias
  * 依赖优化选项中添加esbuild配置选项

* 使用过程中的一些常见问题

  * 清除 node_modules/.vite 缓存
  * 执行 node.js 文件所需要的改动

  

<br>

## vite与webpack 的目标不同之处

vite 的目标就是构建适用于现代浏览器，根本不考虑旧版浏览器，例如 IE 11 等。

并且 vite 支持编译目标 JS 的版本最低为 ES2015。

所以如果你的项目需要适配旧的浏览器，那么建议你别使用 vite，还继续使用 webpack 吧。

当然你也可以选择安装使用 `@vitejs/plugin-legacy` 这个插件，用来适配到旧版浏览器。



<br>

## 创建初始化 react 或 vue 项目



<br>

**创建一个 React 项目：**

```diff
//创建 React 项目
- yarn create react-app xxx
+ yarn create vite xxx --template react

//创建 React + TypeScript 项目
- yarn create react-app xxx --template typescript
+ yarn create vite xxx --template react-ts
```



<br>

**创建一个 Vue 项目：**

```
//创建 Vue 项目
yarn create vite xxx vue

//创建 Vue + TypeScript 项目
yarn create vite xxx --template vue-ts
```



<br>

**针对 React + TypeScript 的注意事项：**

由于最新版 vite react-ts 模板中使用的 TypeScript 版本为 5+，因此需要比较新的 VSCode 才可以支持。

准确来说需要的是 VSCode 1.77 以上的版本才可以支持到 TS 5+，如果你的 VSCode 版本低于此版本，那么由于对 TS 5+ 的不支持，你会收到一些莫名其妙的错误警告，例如：

```
Module '"xxxx/node_modules/@types/react/index"' can only be default-imported using the 'allowSyntheticDefaultImports' flag
```



<br>

> 如果你真的不方便升级 VSCode (不建议)，那么你需要修改 tsconfig.json
>
> ```diff
> - "moduleResolution": "bundler",
> + "moduleResolution": "node",
> - "allowImportingTsExtensions": true,
> ```



<br>

**安装其他框架：**

vite 除了 react 或 vue 外还支持其他众多框架，可以执行：

```
yarn create vite xxx
```

然后在候选框架中选择你要使用的框架。



<br>

**补充说明：**

对于 create-react-app 来说，当创建项目时会自动创建安装 node_modules 包。

对于 vite 来说，默认是不会创建安装 node_modules 包的，需要你自己手工安装。

```
yarn
```



<br>

**初始化项目的文件区别：**

对于 create-react-app 来说，其网页模板位于 /public/index.html。

对于 vite 来说，其网页模板位于 /index.html

> vite 把当前项目目录作为 "静态文件服务根目录"，甚至可以配置多个不同的目录作为默认页



<br>

**关于public目录：**

`public` 目录用于存放一些站点静态文件，例如：favicon.ico 、robots.txt 等

在 `/index.html` 中可以直接使用这些静态文件：

```
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```



<br>

**是否创建git：**

对于 vite 创建的项目来说，默认是不包含 git 的。



<br>

## 使用TypeScript



<br>

**使用 TS 的一些注意事项：**

* vite 天然支持 .ts 文件

* vite 只负责编译 .ts 文件，但不负责校验 TS 类型，TS 校验还是有 编辑器(VSCode) 和 eslint 完成

* 若只引入类型，推荐添加 `type` 字段，以明确仅引入类型

  ```diff 
  - import xx from 'xx'
  + import type xx from 'xx'
  ```



<br>

**TS 配置选项：**

和 TS 相关的一共有 4 个配置文件：

* tsconfig.json
* tsconfig.node.json
* vite.config.ts
* src/vite-env.ts



<br>

他们的继承关系是：

* tsconfig.json 中引入了 tsconfig.node.json

* tsconfig.node.json 中引入了 vite.config.ts

  > vite.config.ts 相当于 webpack 中的 webpack.config.js 配置项

* 而 src/vite-env.ts 为独立文件，用于定义某些 "客户端文件类型"，其内容默认值为：`/// <reference types="vite/client" />`



<br>

tsconfig.json 中 几个非常重要的配置项：

* isolatedModules：默认值为 true

  > isolated 单词翻译为 "隔离、孤立"

* skipLibCheck：默认值为 true

* useDefineForClassFields：默认值为 true



<br>

**关于增加非 src/ 目录下的文件 lint 检查：**

首先我们看一下默认 Vite 中都检查哪些文件或目录：

* tsconfig.json 文件中的 `"include": ["src"]`

* tsconfig.node.json 文件中的 `"include": ["vite.config.ts"]`

  > vite.config.ts 文件位于项目根目录，并不在 src/ 目录下

也就是说默认 Vite 配置 lint 检查的文件或目录分别是：`src/` 和 `vite.config.ts`

**假设我们出于某种目的，在项目根目录创建了一个名为 xxx.js 的文件，当我们执行 yarn lint 时可能会收到这样的错误：**

```
Parsing error: ESLint was configured to run on `<tsconfigRootDir>/xxx.js` using `parserOptions.project`: ...
```

这是 ESLint 在警告我们：没有正确配置 xxx.js 文件！



<br>

> 你可能会想那我直接将 xxx.js 添加到 `.eslintignore` 中不就行了？
>
> 答案是：不行！你会收到这样的错误：
>
> ```
> File ignored because of a matching ignore pattern. Use "--no-ignore" to override
> ```
>
> 原因很简单：因为 `.eslintignore` 是针对 "检查范围内" 的文件，可此时 xxx.js 根本不在检查范围内，所以也谈不上忽略它！



<br>

**正确的解决办法是：将 xxx.js 添加到检查范围内即可**

> tsconfig.node.json

```
"include": ["vite.config.ts", "xxx.js"]
```

> 提醒：既然 xxx.js 已添加到检查范围内了，若此时再在 `.eslintignore` 中添加忽略 xxx.js 才会生效，当然你没必要这样做，还是检查一下比较好。



<br>

**特殊的三斜杠：**

src/vite-env.ts 中的 `/// <reference types="vite/client" />` 等同于 在 tsconfig.json 中：

```
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

> "vite/client"、"客户端类型" 可以暂时理解为 "通用的静态资源文件"，例如 .jpg、.svg 格式的文件

> reference 单词意思为：参考



<br>

**单独定义某种文件类型：**

假设想单独针对 .svg 文件进行某种类型定义，则：

> 创建 src/vite-env-override.d.ts 文件

```
declare module '*.svg' {
   const content: React.FC<React.SVGProps<SVGElement>>
   export default content
}
```

会把 .svg 文件视作是 React 的某种类型，然后再向 src/vite-env.ts 中添加刚才定义的：

```diff
+ /// <reference types="./vite-env-override.d.ts">
/// <reference types="vite/client">
```

> 注意要把自定义的 vite-env-override.d.ts 写在 "vite/client" 前面



<br>

## 关于CSS、sass样式

组建中引入某样式文件的方式和 create-react-app 是相同的。

```
import './xx.css'
```



<br>

**Vite内置支持sass：**

无需像 webgpack 那样需要安装 sass-loader，可以直接在 vite  项目中使用 sass。

唯一需要做的就是需要安装 sass：

```
yarn add sass --dev
```

除 sass 外还内置支持 less、stylus。

```
yarn add less --dev
yarn add stylus --dev
```

也就是说 vite 天然支持 .sass、.scss、.less、.styl、.stylus 样式文件。



<br>

**以包的形式引入样式：**

```diff
- import './xx.css'
+ import xx from './xx.css'

//然后可以有针对性的使用 xx 中的某些样式名称 xx.aa
mydiv.className = xx.aa
```



<br>

**仅引入包名称，但不引入样式实质内容：**

我们上面说的 "引入样式" 准确里说是 "注入样式"，vite 支持在样式文件后面增加 `?inline` 来表明仅引入包名称，不实质引入(注入)样式内容：

```
import xx from './xx.css?inline'
```



<br>

## px 转 rem

若需要将 css 或 scss 中的 `px` 单位 自动转成 `rem` 单位，可以使用：`postcss-pxtorem` 这个插件

<br>

**第1步：安装该插件**

```
pnpm add -D postcss-pxtorem
```



<br>

**第2步：新增配置文件**

项目根目录新建 postcss.config.js 文件

```
module.exports = {
    plugins: {
        'postcss-pxtorem': {
            rootValue: 37.5, // 设计稿宽度的1/10，假设设计稿是375px
            unitPrecision: 5, // 转换后的小数位数
            propList: ['*'], // 需要转换的属性，这里表示全部都进行转换
            selectorBlackList: ['.norem'], // 过滤掉.norem开头的class，不进行rem转换
            replace: true,
            mediaQuery: false, // 是否在媒体查询的css代码中也进行转换
            minPixelValue: 0, // 小于或等于12px不转换为rem
            exclude: /node_modules/i // 排除node_modules文件(node_modules内文件禁止转换)
        }
    }
}
```

> * 无需针对 vite.config.ts 中 css.postcss 做任何配置
> * 375px 的移动设计稿上元素尺寸为多少像素，那么在编写 css 时就使用具体多少像素



<br>

**第3步：动态计算网页根元素的 rem 值**

定义一个 setRem 的函数用于动态计算修改当前网页的 rem 值

```
function setRem() {
    const baseSize = 37.5
    const scale = document.documentElement.clientWidth / 375
    document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
}
```

**在页面初始化 和 resize 时调用 setRem() 函数，这样就可以每次重新计算 rem 的值。**



<br>

## px 转 rem 后兼容PC端

上面步骤中我们已经将宽 375px 的移动端设计稿实现了 css 转 rem，但是如果该网页还需兼容 PC 端，那么就可以通过下面方式实现。

<br>

**添加 CSS 媒体查询 添加不同尺寸下的适配**

> 假设我们使用的是 scss 语法

```diff
.mydiv {
    width:40px;
    height:40px;
    
    .label: {
      font-size: 9px;
    }
    
+    @media screen and (min-width: 1024px) {
+        width: 50px;
+        height: 50px;
+
+        .label {
+            font-size: 12px;
+        }
+    }
}
```

> * 这里我们假定网页宽度超过 1024px 即可视为 PC 端
> * scss 支持像上面示例中那样在 .mydiv { ... } 内部定义专属 媒体查询



<br>

## px 转 vw/vh

若需要将 css 或 scss 中的 `px` 单位 自动转成 `viewport` 单位，可以使用：`postcss-px-to-viewport` 这个插件

<br>

**第1步：安装该插件**

```
pnpm add -D postcss-px-to-viewport
```



<br>

**第2步：修改postcss配置项**

不同于 px 转 rem 插件 `postcss-pxtorem` 需要新建 `postcss.config.js` 文件才可以配置，本次使用的 `postcss-px-to-viewport` 可直接通过 vite.config.ts 来配置。

> vite.config.ts

```
export default defineConfig({
    ...
    css: {
        postcss: {
            plugins: [
                postcsspxtoviewport({
                    viewportWidth: 375, //假定设计稿宽度为 375px
                    ... //还有其他配置，不设置则使用默认值
                })
            ]
        }
    },
})
```



<br>

具体都有哪些配置值，可查阅：

https://github.com/evrone/postcss-px-to-viewport/blob/master/README_CN.md#%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0



<br>

## 引入静态文件资源



<br>

**公共静态资源目录：**

默认为项目根目录中的 public 目录。

* 对于 public 目录中的资源引用时应使用 绝对根目录 '/'
* 你可以在 css 中使用 public 目录中的某些资源文件
* 但请不要在 js 中引入 public 中的资源



<br>

**引入某个静态资源：**

若为图片，可获得该图片被编译后的路径地址：

```
import imgUrl from './img.png'

myImage.src = imgUrl
```



<br>

若为 .json 可自动解析转换成对象

```
import json from './xx.json'

//或直接使用该 json 某根节点
import { field } from './xx.json'
```



<br>

**动态获取引入的资源路径：**

可以通过 new URL() + import.meta.url 形式获取：

```
const filePath = './xx/aa.jpg'

const fileUrl = new URL(filePath, import.meta.url).href
```



<br>

**动态导入：**

```
const module = await import(`./dir/${file}.js`)
```



<br>

**文件后缀可增加的参数：**

像上面提到的可以在 .css 文件后面增加 `?inline` 参数来表明 "引入css文件" 的某些特殊处理。

vite 还支持其他几种后缀参数，用于表明引入不同静态文件资源的特殊处理含义。



<br>

**?inline：针对 css 文件**

表明仅引入样式名称模块，并不会真正引入(注入)样式内容



<br>

**?url：用于显式获取文件边以后地址**

对于一般的静态资源文件，引入后本身就可以获取其被编译后的路径地址，但是对于一些未被包含在内部列表中的文件资源，可以通过增加 `?url` 显式明确获取编译后的路径地址。

```
import xxUrl from 'xxx/xx.js?url'
```



<br>

**?raw：以原始纯文本(字符串) 形式引入**

例如引入 WebGPU 着色器代码(纯文本)

```
import xx from ./xx.wgsl?raw
```

引入 WebGL 着色器代码

```
import xx from './xx.glsl?raw'
```



<br>

**?worker：以 web worker 形式引入**

我们知道 web worker 文件需要是独立的文件，如果在 webpack 中需要使用 worker-loader 加载器才能正确编译并找到编译后的 .js 文件。

vite 天然支持，无需 worker-loader。

```
import MyWorker from './xx.js?worker'

const myWorker = new MyWorker()
```



<br>

**?sharedworker：同源共享类型的 web worker**

sharedWorker 是一种特殊的 web worker，使用 `?sharedworker` 可以引入

```
import MySharedWorker from './xx.js?sharedworker'
```



<br>

**参数组合：?worker&inline**

以内联为 base64 字符串形式引入 web worker

```
import InlineWorker from './xx.js?worker&inline'
```

> 目前我还没用过这种方式，具体应用场景暂时不清楚



<br>

**?init：针对 .wasm 文件的导入和初始化**

```
import init from './xx.wasm?init'

init().then((instance) =>{ instance.exports.test() })
```



<br>

**特别说明：web worker 的另外一种推荐导入方式**

除了 `?worker` 和 `?sharedworker` 这种形式导入 worker 外，更加推荐使用 new Worker() 和 new SharedWorker() 方式来导入。

这种方式和原生的创建 web worker 方式极为相似，只不过是用 new URL() + import.meta.url 形式。

```
//在JS原生中的写法
const myWorker = new Worker('./xx.js')

//在vite中之前的写法
import MyWorker from './xx.js?worker'
const myWorker = new MyWorker()

//在vite中新的推荐写法
const myWorker = new Worker(new URL('./xx.js', import.meta.url))
```



<br>

还可以增加第2个配置参数：

```
const myWorker = new Worker(new URL('./xx.js', import.meta.url), { type:'module' })
```



<br>

## 命令参数



<br>

**Vite 命令参数划分：**

我们使用 vite 大体上可以划分为 3 种目的方向：

* 开发过程
* 构建
* 其他(预构建依赖、本地预览构建产物)



<br>

为了更加方便理解，我们现明确一下命令参数含义：

* --xxx：命令参数名
* -x：命令参数的简写形式
* [xx]：可选值，若不填则使用默认值
* `<xx>`：必填值



<br>

**参数名与参数值支持以下 2 种方式：**

* 使用 等号 相连：--xxx=xx
* 使用 空格 相连：--xxx xx



<br>

**开发过程中的配置参数：**

```
vite [参数]
```

* --host [host]：指定主机名称，默认仅为 'http://localhost' (不含局域网IP)，若设置为 true 或 '0.0.0.0' 表示本机全部网络 IP (含公网IP)

* --port <port>：指点启用端口

* --strictPort：明确若端口已被占用则直接退出，并不会尝试下一个可用端口

* --open [path]：启动时自动打开浏览器，[path] 为指定打开的路径

* --base <path>：公共基础路径，默认值为 '/'

* --https：请注意该配置参数已经在 v5 版本中废弃，请勿再使用

* --cors：启用 CORS

* --force：忽略 node_modules/.vite 中的缓存，强制不使用缓存情况下重新构建

* -c、--config <file>：使用指定的配置文件

* -m、--mode <mode>：设置环境模式

* -v、--version：显式版本号

* -h、--help：显式可用的 CLI 选项

* -d、--debug [feat]：现实调试日志

* -f、--filter <filter>：过滤某些调试日志

* -l、--logLevel <level>：显示哪种日志级别，info/warn/error/silent，默认值为 'info'

* --clearScreen：允许或禁止清除日志屏幕



<br>

> 特别提醒：修改上述配置文件后，无需重新执行 `yarn dev`，调试网页就立马生效，vite 非常强！



<br>

**构建相关参数命令：**

```
vite build [参数]
```

* --target <target>：编译目标，默认值为 "modules"

* --outDir <dir>：输出目录，默认值为 "dist"

* --base <path>：公共基础路径，默认值为 '/'

* --emptyOutDir：若输出目录在根目录外，则强行清空输出目录

  > 对于根目录内的输出目录，即使不设置该参数，也会每一次强行清空该目录

* --assetsDir <dir>：输出目录中的资源目录，默认值为 "assets"

* --sourcemap [output]：是否构建输出 source map 文件，默认值为 false

* --minify [minifier]：允许或金庸最小化混淆，或指定使用哪种混淆器，默认为 "esbuild"

  > 可修改混淆器为 "terser"，若设置为 false 则表示不使用混淆

* --manifest [name]：是否构建后生成 manifest.json 文件

  > [name] 可设置为 true 或 false，若想自定文件名则直接设定 name 的值

* --ssrMainfest [name]：是否构后生成 SSR manifest.json 文件

  > 配置方式同 --manifest

* --ssr [entry]：为服务端渲染配置指定入口文件

* --assetsInlineLimit <number>：静态资源内联为 base64 编码的阈值，以字节为单位，默认值 4096

* -w、--watch：监控磁盘是否发生变更，若发生变更则重新(重头)构建

* 其他参数(-c、--base、--clearScreen、-d、-f、-m、-h)和 开发过程中的相同



<br>

**特别说明：** 

因为对于构建好的网页项目，若其将来并不在域名根目录下，那么就使用 --base 这个命令参数。

但是，更推荐另外一种做法：

去修改 vite.config.ts 的 `base` 字段，将其修改成其他值，例如相对路径 './' 或 具体路径 '/xx/'

```
import { defineConfig } from 'vite'

export default defineConfig({
  base:'./', //注意此处
  ...
})
```



<br>

**其他(预构建依赖、本地预览构建产物)**

```
vite preview [参数]
```

所谓 "预览构建产物" 你可以简单理解为 "实际构建中间的预览版"。

**永远不要把 本地预览构建产物 当做构建产物来用！**

可用适用的参数几乎和上面的差不多，具体可参考：https://cn.vitejs.dev/guide/cli.html



<br>

**上面所有的命令参数实际上都可以通过修改配置 vite.config.ts 文件来实现，包括一些没有提及到的。**

他们大致划分为：

* 共享选项(开发过程、构建、其他 都可以使用到的)：https://cn.vitejs.dev/config/shared-options.html

* 服务器选项(开发过程)：https://cn.vitejs.dev/config/server-options.html

  > 例如 `proxy` 网络请求代理配置项，就只能通过 vite.config.ts 来配置

* 构建选项(构建)：https://cn.vitejs.dev/config/build-options.html

* 预览选项：https://cn.vitejs.dev/config/preview-options.html

* 依赖优化选项：https://cn.vitejs.dev/config/dep-optimization-options.html

此外还有上述命令参数中不存在的配置项：

* SSR选项：https://cn.vitejs.dev/config/ssr-options.html
* Worker选项：https://cn.vitejs.dev/config/worker-options.html



<br>

具体用到哪些时直接看官方文档即可。



<br>

## 使用插件



<br>

**vite插件与rollup插件的关系：**

* vite 最初是以 rollup 为基础(参考) 而来的，所以 rollup 的一些插件都可以直接应用在 vite 之上
* vite 本身已经内置了很多 和 rollup 类似的插件
* 但有些 rollup 插件会与 vite 内置插件冲突



<br>

所以，当我们说 "vite插件" 时实际上内含 2 种插件：

1. 专门针对 vite 的插件
2. 同样适用于 vite 的 rollup 的插件



<br>

**虽然名字是 "插件"，但其实也各类包含 "中间件"。**

> 你也可以自定义插件或中间件，前提是需要你会一些 nodejs。

Vite 独有的钩子(hook)：

https://www.vitejs.net/guide/api-plugin.html#vite-specific-hooks

你可以利用 vite 提供的钩子，编写自己的中间件。

例如可以针对资源请求针对 `configureServer` 钩子编写一些自己的逻辑。



<br>

例如我编写的这个：`public404Middleware.ts`

https://github.com/puxiao/notes/blob/master/fragment/public404Middleware.ts

用来检查 public 中图片资源若不存在则返回 404 而不是 vite 默认的 index.html 内容。

> 这个主要是用来避免开发阶段中，因为手抖而把图片资源写错却不容易被发现的问题。



<br>

**请注意：vite 插件中的 中间件都只针对 dev 模式，而不是 build 模式。**



<br>

从另外一个角度，以插件开发者身份的角度来看一共有 4 类：

* vite 官方维护插件

  > 官方只维护针对不同框架的插件，例如 vue、react 等

* vite 社区维护的插件

  > 涵盖了绝大多数日常项目开发所需的插件

* 第三方个人开发的 vite 插件

  > 无法保证质量，慎用

* rollup 插件

  > 要考虑有可能会与 vite 官方插件、社区插件有冲突风险



<br>

**寻找插件：**

1. 首先：强烈推荐使用 vite 官方社区维护的插件：https://github.com/vitejs/awesome-vite#plugins
2. 其次：NPM 平台 https://www.npmjs.com/ 中，搜索：vite-plugin 来搜索相关插件
3. 备选：https://vite-rollup-plugins.patak.dev/



<br>

vite 官方社区维护的插件已经几乎涵盖日常开发中各个方面了，品质和兼容性有保障。



<br>

**添加一个插件：**

第1步：安装某插件

```
yarn add @vitejs/plugin-xx --dev
```

第2步：在 vite.config.ts 配置文件中的 plugins 数组中添加 xx 和 它的配置项



<br>

像我们前面创建的 react 项目，默认就是用的是 `@vitejs/plugin-react` 这个插件。

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], //若安装新插件，需要追加到此数组中
})
```

> vite 内置的插件并未暴露在 plugins 数组中。



<br>

**插件执行顺序：**

默认情况下我们安装的插件都会在 vite 核心插件执行之后才调用。

若想修改我们安装的插件与 vite 核心插件 或 构建插件 的执行顺序，可通过给插件添加 `enforce` 字段来明确执行契机。

* 默认值(不配置)：在 vite 核心插件之后调用该插件

* enforce: 'pre'：在 vite 核心插件之前调用该插件

  > 注意此处说的是：vite  核心插件

* enforce: 'post'：在 vite 构建插件之后调用该插件

  > 注意此处说的是：vite 构建插件



<br>

**按需使用插件：**

除了上面提到的修改 插件 执行先后顺序外，我们还可以配置某插件仅在某模式下使用。

这里说的 某模式 是指：开发模式 和 生产模式

默认情况下插件会在上面 2 个模式中都调用，我们可通过 `apply` 字段来控制仅在某固定模式下才被调用。

* apply: 'build'：仅在构建模式下调用
* apply: 'serve'：仅在开发模式下调用



<br>

**开发自己的插件：**

首先需要阅读 rollup 插件文档：https://rollupjs.org/plugin-development/

然后再熟悉 vite 插件 API 和 约定：https://cn.vitejs.dev/guide/api-plugin.html



<br>

## 构建生产版本



<br>

**修改公共目录：**

默认使用的是 '/' 作为根目录，如何修改在前面讲 --base 命令参数时已经说过了，此处再复习一遍。

一共有 2 中修改方式：

* 第1种：添加构建命令参数：

  ```
  vite build --base=./
  ```

* 第2种：修改 vite.config.ts 配置项

  ```
  import { defineConfig } from 'vite'
  
  export default defineConfig({
    base:'./', //注意此处
    ...
  })
  ```



<br>

**特别说明：base 与 root 的区别**

* base 是指编译后的文件的资源公共目录
* root 是指我们存放的项目源码的基础公共目录



<br>

**更为复杂的基础路径配置：**

vite 还支持将不同文件存放在不同的路径中，这样做的目的是为了在部署时可以有更大的自由度，例如有些目录需要启用 CDN 加速，而有些不需要。

具体配置方式：https://cn.vitejs.dev/guide/build.html#advanced-base-options



<br>

**构建多页面：**

vite 支持多页面应用模式，也就是说不再是单页面，可以是多目录、多页面。

那么意味着：

1. 你需要指定 N 个页面目录路径
2. 指定每个目录页面的入口文件



<br>

构建多页面大体上可以分为 2 种实现方式：

* 手工创建N个编译入口和模板文件

  > 这适用于页面数量不多的项目

* 使用 vite 社区插件 vite-plugin-multi-pages

  > 这适用于页面数量非常多的项目



<br>

**vite构建多页面 - 手工实现方式：**

下面以  vite + vue 项目为例。

第1步：在 src 目录下创建 pages 目录，用于存放多个页面

> 这下和 nextjs 就很像了

* 首页：src/pages/index/
  * App.vue
  * main.js
  * style.css
* 子页面AA：src/pages/aa/
  * App.vue
  * main.js
  * style.css
* 子页面BB：src/pages/bb/
  * ...



<br>

第2步：在项目根目录(root) ，也就是之前 index.html 页面同级目录 创建和修改子页面 .html 内容

我们将默认的 index.html 复制出来 2 份，并分别修改为 aa.html、bb.html

* 首页：index.html

  > 我们需要修改 index.html 中对 JS 入口文件的引入地址

  ```diff
  - <script type="module" src="/src/main.ts"></script>
  + <script type="module" src="/src/pages/index/main.js"></script>
  ```

  > 同理，我们需要对其他页面分别进行设置

* 子页面AA：aa.html

  ```
  <script type="module" src="/src/pages/aa/main.js"></script>
  ```

* 子页面BB：bb.html

  ```
  <script type="module" src="/src/pages/bb/main.js"></script>
  ```



<br>

第3步：修改 vite.config.js 中 build.rollupOptions.input 的配置

```
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: './',
    build: {
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                aa: path.resolve(__dirname, 'aa.html'),
                bb: path.resolve(__dirname, 'bb.html')
            }
        }
    },
    resolve: {
        alias: {
            '@/src': fileURLToPath(new URL('./src', import.meta.url)),
            '@/index': fileURLToPath(new URL('./src/pages/index', import.meta.url)),
            '@/aa': fileURLToPath(new URL('./src/pages/aa', import.meta.url)),
            '@/bb': fileURLToPath(new URL('./src/pages/bb', import.meta.url))
        }
    }
})

```

> 为了方便引入代码，我们还添加配套的 alias



<br>

这样基础源码结构就配置好了。

* 如果是所有页面的公共组件，那么我们可以继续存放在 src/components/
* 如果是某子页面单独使用的组件，那么可以存放在 src/pages/xx/components



<br>

最后，当我们执行编译：`yarn build`，就会在 dist 中分别看到构建好的 index.html、aa.html、bb.html。

> 默认这些页面引用的 js 会被分别存放在 assets 目录中，并且以他们的名字来作为 JS 文件前缀。
>
> * index_xxxxxx.js
> * aa_xxxxxxx.js
> * bb_xxxxxxx.js

> vite 会针对每个需要构建的页面进行 摇树(tree shaking)，即仅打包进去当前页面所需最小代码



<br>

**关于 build.rollupOptions.input 等多配置介绍，可查阅：https://cn.rollupjs.org/configuration-options/#input**



<br>

**vite构建多页面 - 插件实现方式：**

该插件的具体用法，可查阅插件官方文档：

https://github.com/Miofly/vite-plugin-multi-pages



<br>

## 项目常见配置



<br>

### 配置调试IP和端口

默认情况下当启动调试后，仅 'http://localhost' 可访问，局域网 IP 是无法访问的。



<br>

**方法1：通过配置文件方式：**

想修改启动 IP 和 端口，可如下配置：

> vite.config.ts

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: true，
        open: true
    },
    plugins: [react()],
})
```

> 上述配置中 `host: '0.0.0.0'` 等同于 `host: true`
>
> 上述其他建议配置：
>
> * 把 base 设置为 './'
> * strictPort(端口被占用则退出)
> * open(启动后自动打开浏览器调试页面) 也都设置为 true



<br>

**方法2：通过命令方式来配置**：

> package.json 中的 "scripts"

参数名与参数值中间使用 等号 连接

```
"scripts": {
    "dev": "vite --host=0.0.0.0 --port=3002",
}
```

参数名和参数值之间也可以使用 空格 连接：

```
"scripts": {
    "dev": "vite --host 0.0.0.0 --port 3002",
}
```



**特别说明：**

* 若修改 vite.config.ts 则无需重新执行 `yarn dev`，自动立即生效
* 若修改 package.json 则需要重新执行 `yarn dev` 后才会生效
* 若 vite.config.ts 和 package.json 命令中同时配置了不同的 IP 和端口，命令方式的优先级更高



<br>

### 启用https

以下仅适用开发阶段的本地调试中启用  https。

**第1种方式(不推荐)：使用第三方插件生成 https 证书**

* 安装 `@vitejs/plugin-basic-ssl`，它会自动为我们生成调试阶段的 https 证书

* 修改 vite.config.ts

  ```diff
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  + import basicSsl from '@vitejs/plugin-basic-ssl'
  
  // https://vitejs.dev/config/
  export default defineConfig({
  -  plugins: [react()],
  +  plugins: [react(), basicSsl()],
  +  server: {
  +        host: true,
  +        port: 443,
  +    },
  })
  ```

  > 注意：并不是强制要求端口必须是 443，也可以是其他

这样就可以在 react + vite 项目调试中启用 https 了。

若等到正式发布，再配置正规的 https 证书。



<br>

**第2种方式(推荐)：使用自有的 https 证书**

上面讲的第1种方式默认会被谷歌浏览器判定为 不安全 的证书并且阻止页面显示，我们推荐使用自有 https 证书 ，具体如下。



#### 先使用mkcert生成https证书

**第1歩：安装 mkcert**

具体安装方法请查看：https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation

这里仅说一下 windows 系统安装步骤：

**先安装 scoop：**

> 使用 Powershell，并且需要有 梯子，依次执行下面命令

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

```
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

**再安装 mkcert：**

```
scoop bucket add extras
scoop install mkcert
```



<br>

**第2歩：初始化证书机构**

```
mkcert -install
```



<br>

**第3歩：生成 localhost 证书**

```
mkcert localhost
```

> 会生成：localhost.pem、rootCA-key.pem 这 2 个证书文件



<br>

#### 修改 vite.config.ts 中加载 https 证书

修改 vite.config.ts ：

> 假定我们把  mkcert 生成的 2 个证书文件放在了项目 /pems/ 目录中

```diff
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
+  server: {
+    https: {
+      key: readFileSync(path.join(__dirname, 'pems/localhost-key.pem')),
+      cert: readFileSync(path.join(__dirname, 'pems/localhost.pem'))
+    }
  }
})
```

> 经过如此配置后，就可以在开发阶段使用 https 了。



<br>

**关于https的端口说明：**

在 nginx 中要求 https 端口必须是 443，但是在 vite 中并没有此要求。

因此我们可以将端口设置为任何我们想设定的：

```diff
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: readFileSync(path.join(__dirname, 'pems/localhost-key.pem')),
      cert: readFileSync(path.join(__dirname, 'pems/localhost.pem'))
    },
+   host: '0.0.0.0',
+   port: 3000,
  }
})
```





<br>

### 使用husky

husky 是专门用来做代码 git 提交前的事件触发，可以在这个契机中进行代码相关检查或格式化，通过检查后才可以进行 git 代码提交，否则将拦截本次提交。

具体用法可参考另外一篇文章：[Husky学习笔记.md](https://github.com/puxiao/notes/blob/master/Husky%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0.md)



<br>

### 配置vscode

在项目根目录创建：`.vscode/setting.json`

```
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "editor.detectIndentation": false,
    "editor.tabSize": 4,
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true
}
```

上面是最基础的配置项：

* 修改默认以 4 个空格对齐代码
* 保存文件时自动格式化代码



<br>

### 使用prettier

上面是通过 vscode 配置方式来实现代码格式化，但是假设编辑器不是 VSCode，或者我们希望有更加丰富的代码格式化，那么可以安装使用 prettier 以及它的相关插件。

* prettier：代码格式化、美化
* prettier-plugin-packagejson：针对 package.json 的格式化插件
* prettier-plugin-sort-imports：针对顶部中 import 引入代码部分的格式化插件



<br>

**安装：**

```
yarn add --dev prettier@2.8.8 prettier-plugin-packagejson prettier-plugin-sort-imports
```

> 由于目前 prettier 3.0.0 版本在 windows 系统上会报错，所以我们此处暂时安装 2.8.8 版



<br>

**修改插件配置文件：**

打开 .prettierrc 文件，修改其中的 "plugins" 属性值：

```
"plugins": [
    "./node_modules/prettier-plugin-sort-imports",
    "./node_modules/prettier-plugin-packagejson"
]
```



<br>

**新增命令：**

> package.json

```
"scripts": {
    ...
    "format": "prettier --write --ignore-unknown .",
    "format-check": "prettier --check --ignore-unknown .",
},
```



<br>

**git提交前格式化代码：**

> package.json

```
"lint-staged": {
    "*.{js,jsx,ts,tsx}": [
        "yarn lint",
        "prettier --write --ignore-unknown"
    ]
},
```

> 特别说明：配置 "lint-staged" 的前提是你已安装使用 husky



<br>

**关于报错：ESLint was configured to run on `<tsconfigRootDir>/vite.config.ts` using `parserOptions.project` ...**

这是目前已知的一个 bug，第1种解决方法是：

打开 `.eslintrc.cjs` 文件，将 parserOptions.project 的值由默认的 `true` 修改为 `['./tsconfig.json', './tsconfig.node.json']` 即可。

<br>

第2种解决方案是：
`tsconfig.node.json`

```diff
- "include": ["vite.config.ts"]
+ "include": ["vite.config.ts", ".eslintrc.cjs"]
```



<br>

### 使用sass

vite 内置 sass 的加载器，只需安装 sass 即可直接使用。

```
yarn add sass --dev
```



<br>

### 配置路径映射alias

无需安装任何插件，只需要直接在 vite.config.ts 中配置即可。

假定我们现在一共要添加 2 条路径映射：'@'、'utils'

resolve.alias 的值一共有 2 种写法。



<br>

**方式1：对象**

属性名就是映射后的路径缩写、属性值是原始路径

```
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'utils':  path.resolve(__dirname, './src/utils')
        }
    },
    ...
})
```



<br>

**方式2：数组**

数组中的每个元素结构为 { find: 'xx', replacement: 'xxxxx'}

```
import path from 'path'

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, './src')
            },
            {
                find: 'utils',
                replacement: path.resolve(__dirname, './src/utils')
            }
        ]
    },
    ...
})
```



<br>

**修改配置tsconfig.json**

增加 alias 相关配置：

```1
"compilerOptions": {
    ...
    /* alias */
    "baseUrl": "./",
    "paths": {
        "@/*": ["src/*"]
    },
}
```



<br>

**特别说明：静态资源对应的类型定义**

如果使用 create-react-app，我们还需要去定义 global.d.ts，但是在 vite 中，它已经默认帮我们定义好了。

对应的就是 vite-env.d.ts 中的三斜杠注释代码。

```
/// <reference types="vite/client" />
```

> "vite/client" 泛指各类客户端静态资源文件，例如 .svg、.jpg 等



<br>

### 依赖优化选项中添加esbuild配置选项

具体用法可查看：

https://cn.vitejs.dev/config/dep-optimization-options.html#optimizedeps-esbuild-options



<br>

这里重点说一下日常中可能会遇到的一个报错。

假设你使用了某些第三方库，可能因为里面使用了 **"某些新的 JS 语法"** (例如 await )，开发调试时收到这样的报错：

```
Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
```

**请注意上面说的 某些新的 JS 语法是加了引号的，也就是说这些 新的 JS 语法实际上并不是特别新，就好像上面那个因为第三方库使用了 await 这个语法。**

> 我是在使用 threejs 中的 WebGPURenderer 时收到上面的报错信息的。



<br>

目前的解决方案是：在 vite.config.js 中增加 esbuildOptions 配置

```
export default defineConfig({
    ...
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext'
        }
    }
})
```



<br>

**总体来说 vite 相对于 webpack 配置起来极其简单。**



<br>

## 使用过程中的一些常见问题



<br>

### 清除 node_modules/.vite 缓存

假定你的项目执行过调试，那么 vite 会把当前项目所用到的 node_modules 中的各个包文件缓存下来，以便提高热更新性能。

代价是 vite 不会监控 node_modules 中文件的变动，例如你手工修改了 node_modules 下的某个包的代码，当你再次执行调试时 vite 继续使用之前的缓存，你刚手工修改的代码是不会生效的。

解决办法非常简单：**手工删除 node_modules/.vite 目录，然后重新执行调试**，此时就能看到变更后的代码了。

<br>

假定你每一次都不想使用 node_modules 中的 NPM 包缓存，可以调用执行 `vite --force`。



<br>

### 执行 node.js 文件所需要的改动

<br>

**Vite 环境下无法直接执行 node.js 文件？**

Vite 创建的 package.json 中是这样配置的：

```
"type": "module"
```

由于 node.js 默认采用的是 CommonJS 模块，而 Vite 默认的是 ESM 模块，所以在 Vite 项目中默认是无法执行 node.js 编写的相关代码的。



<br>

**在 Vite 项目中想执行 node.js 文件需要改动的地方：**

* 首先为了有 node.js 语法提示，我们先推荐安装 node.js 的类型提示

  ```
  yarn add @types/node --dev
  ```

  > 上面代码默认安装的是最新版 node.js 的类型包，你可根据自己的 node.js 版本有选择性的安装对应版本

* 修改 node.js 编写的文件中的引入方式

  ```diff
  - const xx = require('xx')
  + import xx from 'xx'
  ```

* 额外增加一些 "原本 node.js 中默认可用的环境变量"，例如最常用的 `__dirname`

  对于 node.js 编写的代码，假定想获取当前文件目录的路径，那么是可以直接使用 `__dirname` 来得到的。可是这个变量在 ESM 中是默认不存在的，需要我们自己计算出来。

  > 具体改动参见下面的代码



<br>

**node.js 文件代码改造示例：**

> 以下这种方式仅适用于：高于 node v18、低于 nodejs v20 版本。

```diff
- const path = require("path")
+ import path from 'path'

+ import { fileURLToPath } from 'url'
+ const __filename = fileURLToPath(import.meta.url)
+ const __dirname = path.dirname(__filename)

const jsonPath = path.join(__dirname, './public/version.json')
console.log(jsonPath)
```



<br>

**特别说明：上面这种方式已不适用最新版的 nodejs，因为最新版的 nodejs 中又恢复了 dirname，我们无需再自己定义 dirname。**
