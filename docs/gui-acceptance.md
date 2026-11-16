# 隔离 GUI 验收 · 2026-11-16

## 环境

使用已安装桌面发行版自带 CLI（DSH 0.2.2-rc.1），独立 DSH_HOME=.local/isolated-home、web profile、127.0.0.1:64517。未修改正式 DSH_HOME 或 app.asar。此为同发行版的隔离 Web UI 验收，不等同于正式桌面窗口安装完成。

## 观察结果

1. profile 原生 ui-sidebar 禁用，新增本地 host-adapter；适配客户端 ModuleLoader id 与新包身份一致。只用 name 覆盖会触发 name mismatch，应保持原name用于匹配并disabled，另insert新包。
2. 原生 More 保留 Browse other plugins/Create your plugin，新增管理侧栏入口。
3. 管理对话框实际列出 Plugins/plugins（强制固定）与 Automation tasks/schedules。
4. 取消固定 schedules 后，原入口消失；刷新同地址后仍收纳。
5. 从 More 的 Automation tasks 成功打开原 Automation tasks 面板（可见Task status、Search tasks、No active automation tasks）。
6. 在隔离配置中 disabled Curator，重新启动同端口后刷新，Automation tasks 原生按钮恢复；证明保留的浏览器偏好未阻断卸载回退。

## 限制与后续

隔离 profile 未载入正式QQ/Purge/待办等插件，因此本轮路由操作使用原生schedules；对正式插件的逐项页面验收仍待正式profile部署。未修改正式桌面窗口与当前服务64489，后续需配置备份和可恢复加载。

测试服务可停止：仅核实64517的listener对应本轮CLI进程后停止，不停止正式桌面进程。
