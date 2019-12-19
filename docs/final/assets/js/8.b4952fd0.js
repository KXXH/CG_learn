(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{202:function(t,s,a){t.exports=a.p+"assets/img/mirror_and_camera.b1271280.png"},227:function(t,s,a){"use strict";a.r(s);var n=a(0),r=Object(n.a)({},(function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"倒影效果"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#倒影效果"}},[t._v("#")]),t._v(" 倒影效果")]),t._v(" "),n("h2",{attrs:{id:"基本原理"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#基本原理"}},[t._v("#")]),t._v(" 基本原理")]),t._v(" "),n("blockquote",[n("p",[t._v("倒影也是日常生活中非常常见的现象。但是不幸的是，目前我们使用的Phong模型是局部光照模型，并不能形成倒影（阴影也照样不行），但能实现镜面高光。但这实际上十分违反直觉——"),n("em",[t._v("镜面高光让人们以为材质是镜面的，但它却无法产生倒影")]),t._v("。")])]),t._v(" "),n("p",[t._v("为了解决这个问题，还是采用像阴影贴图一样的操作逻辑。根据基本的光学知识，我们知道我们在镜中看到的像与我们站在与镜面对称的位置看到的物体的像是一样的。同时，光路具有可逆性，因此光源也必须关于镜面对称过来。摄像机在镜面对称位置拍摄，并将所得图像存入帧缓存，作为纹理传递给银幕的着色器。")]),t._v(" "),n("p",[t._v("唯一需要关注的是纹理坐标的问题。摄像机拍摄的是从镜面背后看到的完整的图像，但镜面的大小是有限的。因此，镜面可能无法显示全部的纹理，这需要我们特别处理。")]),t._v(" "),n("h2",{attrs:{id:"设计思路"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#设计思路"}},[t._v("#")]),t._v(" 设计思路")]),t._v(" "),n("blockquote",[n("p",[t._v("产生倒影的方法和"),n("router-link",{attrs:{to:"/阴影贴图.html"}},[t._v("阴影贴图")]),t._v("中是类似的。唯一需要关注的是，在生成倒影的纹理的过程中，不能渲染镜面本身。显然，在镜面的背后观察物体，镜面就会把物体全部挡住，从而无法成像。另外，在生成阴影所需的深度信息时我们不需要引入光照信息，但在这里需要引入它们。因为如果不加入光照，镜像就没有真实感了。")],1),t._v(" "),n("p",[t._v("综上所述，倒影纹理的产生实际上就是将摄像机放在镜面后面，进行一次和标准的成像过程一模一样的成像。")])]),t._v(" "),n("h3",{attrs:{id:"局限性"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#局限性"}},[t._v("#")]),t._v(" 局限性")]),t._v(" "),n("p",[t._v("同阴影一样，我们所做的一切都是在局部光照模型中试图模拟全局光照的效果，但这些模拟都不可能是完美的。例如，我们的这一模型只能计算一次反射——也就是说，如果猫模型也是镜面的，那我们就看不到它的表面上对镜面的倒影，除非再进行一次渲染。")]),t._v(" "),n("p",[t._v("另一方面，这一渲染同阴影一样开销巨大。阴影的开销巨大体现在对帧缓存的分辨率要求较高，稍低的分辨率就会导致阴影模糊或是充满锯齿。而镜面反射对帧缓存的分辨率没有那么高的要求，我使用了"),n("code",[t._v("512*512")]),t._v("大小的帧缓存就能取得十分不错的效果，而阴影即使使用"),n("code",[t._v("1024*1024")]),t._v("的帧缓存，在一切情况下看上去依然有些失真。")]),t._v(" "),n("p",[t._v("但是倒影需要和渲染显示的内容一样的光照等信息，至少应该保证不会产生违和感，这点开销比阴影中的计算深度值要大许多。因此游戏和3D应用中，对于镜面的处理，或是采用静态的环境贴图的方法，或是使用分辨率很低的帧缓存来渲染，以提高效率。")]),t._v(" "),n("h3",{attrs:{id:"裁切纹理"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#裁切纹理"}},[t._v("#")]),t._v(" 裁切纹理")]),t._v(" "),n("p",[n("em",[t._v("摄像机在镜面背后看到的东西并不一定能从镜面中看到，因为镜面的大小是有限的。")])]),t._v(" "),n("p",[t._v("因此，我们在银幕上使用镜面的纹理时，也需要按照实际情况对纹理进行裁切。在实现本程序的时候，我还是采取了一个取巧的方法，我让相机在以银幕中心为圆形，半径为50的球体上运动，相机的视角恰好是90°，而银幕本身的大小是"),n("code",[t._v("100*100")]),t._v("。这也就意味着，镜子背后的相机所能看到的范围恰好是我们能从镜子上看到的范围，如下图所示。")]),t._v(" "),n("p",[n("img",{attrs:{src:a(202),alt:"相机和银幕的位置"}})]),t._v(" "),n("p",[t._v("当然，这样的做法并不精确，并且还会产生一些问题，但对于本程序来说，其效果是可以接受的。")]),t._v(" "),n("h3",{attrs:{id:"求镜面对称"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#求镜面对称"}},[t._v("#")]),t._v(" 求镜面对称")]),t._v(" "),n("p",[t._v("在我们的程序中，显然不需要很复杂的算法，因为镜面，即银幕是一块无法移动的平面，并且平行于xy平面。我们只需设置"),n("code",[t._v("z=100-z")]),t._v("即可求出对称点位置。但是如果该平面可以移动呢？我们可以在平面上任意找一点，求摄像机位置和该点连线与法向量的投影，并将该投影乘二，并与相机位置相加就可得到所求的点。")]),t._v(" "),n("h2",{attrs:{id:"具体实现"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#具体实现"}},[t._v("#")]),t._v(" 具体实现")]),t._v(" "),n("p",[t._v("计算倒影的着色器和主着色器一致，因此跳过着色器介绍。")]),t._v(" "),n("p",[t._v("需要注意的是，虽然着色器代码一致，但还是需要初始化新的着色器程序，否则WebGL会在渲染时报错。")]),t._v(" "),n("div",{staticClass:"language-javascript extra-class"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//...")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("createProgramInfo")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"vertex-shader"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"fragment-shader"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//...")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("rander")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//...")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//绘制反射帧")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("bindFramebufferInfo")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("fbi3"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("clear")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("COLOR_BUFFER_BIT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v(" gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("DEPTH_BUFFER_BIT")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("useProgram")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("program"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("light_uniform"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    cat_uniforms"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("uMVPFromLight"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("tempMat1"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setBuffersAndAttributes")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" catBufferInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" light_uniform"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" cat_uniforms"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" projection_uniforms"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" view_uniforms"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    camera"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("camera_uniform"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("u_viewWorldPosition"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("slice")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//使用切片避免影响原有数据")]),t._v("\n    camera"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("camera"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" view"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("m4"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("lookAt")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("camera"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("50")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" lightPos"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("light_uniform"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("uLightPos"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("slice")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    lightPos"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("lightPos"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" d"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        uView"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("m4"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("inverse")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("view"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        u_viewWorldPosition"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("camera"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        uLightPos"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("lightPos"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("setUniforms")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("mirrorProgramInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" d"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    twgl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("drawBufferInfo")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gl"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" catBufferInfo"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//...")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])}),[],!1,null,null,null);s.default=r.exports}}]);