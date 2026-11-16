# 实施进度 · 2026-11-16

## 已落盘

- TypeScript + React 18 客户端、Node.js npm 工程与独立本地 Git 仓库。包名 dsh-sidebar-curator（同名 organizer npm 已由 TLEWA 占用）。
- 原生更多菜单入口、管理弹窗、固定/收纳策略、本地存储、动态注册协调。默认常驻 personal-workbench/schedules/dsh-context/dsh-mneme，plugins 强制保留。
- navigation-v1 single 包装契约（实际 SDK 没有 hoc kind），生成式宿主适配；两个核实过的 source hash 白名单；只输出副本，不改安装目录。
- CI、OIDC npm 发布、上游监控、手动可选 GitHub Models AI review 四份工作流。
- 19 项测试（含真实 DSH SlotRegistry 缺席/卸载回退与 StrictMode 替换实例）、类型检查、构建、YAML 解析通过；npm audit 零漏洞；干净 npm ci 已验证。
- 当前安装包副本生成适配与 node --check 通过。

## 尚未完成

- 当前桌面 GUI 未安装插件/宿主适配；没有实际界面验收和安装回滚记录。
- GitHub 新账号身份待用户登录确认；CLI 残留 MortisQAQ 不当作新账号。建仓页面在 DSH 蓝框浏览器登录页，尚未创建远程仓库、commit、push。
- npm 未登录；首次发布、Trusted Publisher、environment 保护及真实云端工作流运行均未完成。
- AI workflow 默认关闭；未开通配额或选择模型，未声称完成AI审查。自动修复PR/自动安装升级未启用。

## 下一步

1. 修完独立审查余项，增加运行故障回归和完整宿主装配测试；不要将字符串匹配当行为验证。
2. 为当前安装版确定可回滚加载方式，在隔离 profile 验证，再接入现有 GUI。
3. 用户登录新 GitHub 账号后核实 owner，创建 dsh-sidebar-curator 仓库，补 repository 元数据，首次提交与推送源码。
4. 用户交互登录 npm 并首次发布，再配置 Trusted Publisher 与 environment，验证云端发布。

注意：源码目录保留最初创建的 dsh-sidebar-organizer 名称，npm 发布身份为 dsh-sidebar-curator；两者不影响构建，但后续可统一命名。
