# 空白也有重量 · 爱情互动诗

有些习惯，还在替你撑伞。

情书的横线汇聚成一把珊瑚色的伞，标点与细雨落下。15 秒演出结束后，雨继续下；左右拖动可以改变伞的倾斜，松开后带着惯性缓慢归位。

## 本地运行

`npm ci` 然后 `npm run dev`，访问 http://127.0.0.1:5187/ 。手机支持触摸，桌面支持鼠标，配乐默认关闭。`npm run build` 输出 dist。

## GitHub Pages

仓库设置 Pages 的 Source 为 GitHub Actions；推送 main 后自动构建部署。Vite 使用相对资源路径，兼容仓库子路径。网页无需后端，不收集用户信息。

## 技术

Vite + Three.js 正交平面；Canvas 2D 绘制文字、84 条连续变形的伞线与雨，再作为 CanvasTexture 交给 Three.js。图形变换是美术设定，伞的交互使用弹簧和阻尼。雨的遮蔽是二维区域近似。当前未使用完整流体或布料求解器。

`src/v2.js` 为当前实现。`src/main.js` 与旧模型保留第一版。文字及音乐原创；字体 LXGW WenKai v1.522，SIL OFL 1.1，见 public/fonts/OFL.txt；Three.js、Vite 为 MIT。未使用参考作者的文字、代码、图像或音乐。

## 检查和录制

本地服务器运行时 `npm run verify` 检查拖动、释放、结束后互动与重播。`node scripts/capture.mjs --video` 使用本机 Chrome 和 FFmpeg 导出 450 帧竖屏视频。字体子集脚本需要 fonttools、brotli。

## 小红书文案

标题：我把伞，偏向了一个空位。

正文：有些习惯，还在替你撑伞。做了一封可以触摸的情书，等文字长成伞，试着让它偏向你。

标签：#爱情 #互动艺术 #创意编程 #情书
