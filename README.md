# dsh-sidebar-curator

基于标准槽位的 DSH 左侧栏入口管理器。第三方插件正常注册，Curator 仅管理固定状态并在原生“更多”中提供入口。

## 当前状态

npm 已发布 `dsh-sidebar-curator@0.1.0`；同发行版隔离 GUI 已完成收纳与回滚验收，正式 desktop profile 已安装依赖与适配配置，等待桌面重载后验证。需要 navigation-v1 宿主适配；未知宿主保持原生导航。不是 npm 上 TLEWA 维护的 dsh-sidebar-organizer，也未采用该项目 DOM 收纳代码。

## 开发

Node.js 24、npm，TypeScript + React 18。所有 DSH SDK 与 React 均由宿主提供，发布包不携带另一份 React。


default commands:

```sh
npm ci
npm run check
npm run package:check
npm run adapter:check
npm pack
```

## 使用与边界

- 插件只订阅标准 sidebar.panellist 的宿主快照，不匹配显示文本、不移动 DOM。
- 新入口默认收入更多。plugins 强制保留，其余默认集合通过 defaultPinnedIds 配置，用户覆盖优先。
- 更多 → 管理侧栏入口，支持搜索、固定/收纳、恢复默认。
- 偏好按服务 origin 存储，不承诺跨端口或跨设备同步。可显式配置 storageKey。
- 私有导航和直接 DOM 注入保持原样。宿主扩展缺失时不应用隐藏策略。
- V1 不支持与另一个入口管理器共同修改固定状态。

## 宿主适配

适配脚本只生成独立文件和 hash manifest，默认不写入安装目录。

```sh
node scripts/adapter.mjs check path/to/sidebar/lib/client.js
node scripts/adapter.mjs generate path/to/sidebar/lib/client.js output/client.js
```

适配目标当前为 DSH 0.2.2-rc.1 原生 SidebarRoot 结构，契约为 single 包装槽位 sidebar.navigation（当前 SDK 的 kind 不包含 hoc）。原导航作为 children 与 fallback；没有 actions 时显示全部入口。部署前必须测试对应发布版，不盲目改写 app.asar；保留原件并明确恢复步骤。

发布与上游兼容流程见 docs/automation.md。GitHub 仓库：https://github.com/MortisQAQ/dsh-sidebar-curator 。npm 首次发布已完成；Trusted Publisher 绑定及云端 OIDC 发布仍待包设置页的用户安全密钥验证。桌面安装和恢复见 [安装说明](docs/desktop-installation.md)。
