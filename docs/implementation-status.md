# 实施进度 · 2026-11-16

- 实际仓库：https://github.com/MortisQAQ/dsh-sidebar-curator 。首次源码提交357a88d，已推送main。
- CI https://github.com/MortisQAQ/dsh-sidebar-curator/actions/runs/43839154482 ：Windows与Ubuntu均success。
- npm dsh-sidebar-curator@0.1.0 已在registry核实，maintainer yukariyukaro，latest/next均0.1.0。由现有Chrome登录态完成CLI登录及交互发布。
- GitHub npm environment 已创建，当前无保护规则（不声称已有人工approval）。
- Trusted Publisher尚未绑定；npm包access页再次要求security-key验证，等待用户完成。云端OIDC发布尚未跑通。
- 19项测试、类型、构建、工作流YAML、audit通过。
- 同桌面发行版0.2.2-rc.1的隔离Web GUI已验收收纳、刷新持久化、更多跳转和禁用后原生入口恢复，详见gui-acceptance.md。正式桌面窗口/原profile尚未部署，未改app.asar。
- 自动上游watch与可选AI review工作流已提交；AI未启用；自动改码/自动合并/自动桌面升级未启用。

下一步：用户完成npm access页安全密钥验证→填写MortisQAQ/dsh-sidebar-curator、publish.yml、environment npm的Trusted Publisher，确认直接发布权限→发布新版本tag验证OIDC；为正式profile备份并安装适配/插件，刷新现有GUI验收四个入口。
