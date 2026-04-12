# 浏览器标签可视化管理工具（MVP）

纯前端的浏览器标签管理工具，支持多来源导入、自动解析/去重/分类，并通过列表、看板、统计图进行可视化展示。

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

## 当前功能

- 多来源导入
  - OneTab 文本导入
  - 书签 HTML 导入
  - Chrome/Edge 文件导入（JSON/HTML/TXT）
- 统一数据处理管线
  - `parse -> normalize -> dedupe -> categorize -> store`
- 标签数据标准化
  - 字段：`title / url / domain / source / category / tags / note / duplicate`
- 可视化页面
  - 列表视图（搜索、筛选、单条编辑、批量操作）
  - 分类看板
  - 统计图表（分类分布、来源分布）
- 本地持久化
  - `localStorage` + 版本字段兼容
- 导出能力
  - 导出当前标签为 JSON（文件名含时间戳）

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问：[http://localhost:5173](http://localhost:5173)

## 构建与测试

```bash
npm run build
npm run test
```

## 导入格式示例

### 1) OneTab 文本

```text
https://github.com | GitHub
MDN | https://developer.mozilla.org
https://news.ycombinator.com | Hacker News
```

说明：
- 支持 `标题 | URL` 或仅 `URL`
- 空行会被忽略
- 非法 URL 会计入“无效”

### 2) 书签 HTML

上传浏览器导出的书签文件（`.html` / `.htm`），系统会提取 `<a href="...">` 链接。

### 3) Chrome/Edge 文件

支持上传 `.json` / `.html` / `.htm` / `.txt`。  
系统会尝试按 JSON、书签 HTML、文本三种路径自动解析。

## 项目结构（核心）

```text
src/
  components/        # 页面与通用组件
  constants/         # 默认分类规则等常量
  store/             # 状态与本地存储
  types/             # TypeScript 类型定义
  utils/             # 导入、归一化、去重、导出等工具函数
```

## 常见问题排查

- 导入后显示“未解析到有效内容”
  - 检查输入是否包含合法 `http/https` 链接
  - OneTab 文本建议逐行一条

- 明明导入了数据但列表为空
  - 可能被筛选条件过滤；请点击“清空筛选”

- 重复数量偏多
  - 系统会对 URL 做归一化处理（域名大小写、尾斜杠、部分跟踪参数）
  - 同一页面不同形式可能被判定为重复，属于预期行为

- 导出 JSON 后文件打不开
  - 请用 UTF-8 编辑器或浏览器打开
  - 文件结构包含 `exportedAt`、`total`、`tabs`

## 当前开发约定

- 按模块增量开发（每次一个模块）
- 每模块完成后必须执行
  - `npm run build`
  - `npm run test`
- 验证通过后再提交并推送 GitHub
