# 自动化与发布

## 当前接入状态

本地源码和工作流已生成；GitHub owner、新账号身份、npm 账号尚待用户登录确认。不要将机器上残留的 MortisQAQ CLI 身份自动视为新账号。仓库创建与首次发布尚未完成。

## CI

Windows / Ubuntu，Node 24，npm ci → typecheck + tests + build → package registration check → dependency audit。lockfile 固定依赖；不运行任意 fork PR 的特权脚本。正式发布前应将 action tags 固定到经过核实的完整 commit SHA。

## npm 自动发布

1. 用户用目标账号登录 GitHub/npm；选择实际可维护的包名，本项目名 dsh-sidebar-curator 目前查询未占用，不等于预留成功。
2. 创建实际仓库，填写 package.repository = git+https://github.com/OWNER/REPO.git，更新 lock，提交源代码。
3. 新 npm 包先由用户交互式 npm login 与 2FA 完成首次发布，建立包设置页。
4. npm 包 Settings → Trusted publishing：填实际 owner/repo、publish.yml、environment npm。采用 GitHub-hosted runner、Node >=22.14、npm >=11.5.1。
5. 当前 npm 文档说明 2026-09-03 后新增 trust 默认仅允许 staged publishing；本项目用 direct npm publish，应显式允许直接发布，并在配置后的两天内完成首次 OIDC 发布，否则重建配置。以设置页当时实际说明为准。
6. GitHub 创建 npm environment，并配置维护者审批与受保护 release tag；工作流不会代替真实的审批配置。
7. 更新版本和 changelog、CI 通过后创建对应 v版本 tag 与 GitHub release。手动运行发布工作流时，也必须选择该 tag 作为运行 ref；GITHUB_SHA 必须等于已验证的 commit，避免 provenance 错指分支。工作流校验 tag/version/repository 及 tag 为默认分支祖先，构建并上传包。
8. 最终发布 job 只下载已验证 archive，以 OIDC 发布并附 provenance，执行 --ignore-scripts；不需要 NPM_TOKEN 或长期 token。预发布用 next，正式用 latest。

注意：生成 workflow 不等于 npm trust 或 environment 保护已配置；尚未成功运行云端发布验证。

官方依据：https://docs.npmjs.com/trusted-publishers/ 。

## DSH 更新与 AI review

- upstream-watch 周一 03:23 UTC 检查 release 与 master 固定 SHA 中的侧栏契约，更新同一条 bot issue。只读取源文件为文本，生成 hash 与 marker 报告。
- marker 完整不代表行为兼容；每个新宿主仍需实际适配生成、组件集成测试、GUI 验收和回滚验证。未知版本不自动部署。
- AI review 手动触发，默认关闭。配置仓库变量 ENABLE_AI_REVIEW=true 和实际可用的 AI_REVIEW_MODEL，开通 GitHub Models 访问后运行。
- AI 仅从 API 读取 PR diff 文本，不 checkout 或执行 PR 代码，不自动评论、合并、发包。结果是 advisory artifact，不作为测试通过证据。
- 自动升级路线：检测 → 更新 issue → 兼容改动 PR → CI → 可选 AI 审查 → 人工验收 → release → OIDC npm。当前实现检测/审查/发布工作流；自动生成修复 PR 与自动升级桌面安装均未启用。

## 宿主适配与恢复

adapter CLI 只生成新文件，不直接改 app.asar；生成文件附 source/patched hash。安装必须使用当前运行文件作为输入，不采用旧解包副本。匹配失败停止，不尝试按中文文本/DOM猜测。

当前适配在发布 npm SDK 0.2.2-rc.1 与本机安装版副本上完成生成与语法检查，但现有桌面 GUI 未部署。禁用插件时包装器恢复固定状态；无菜单提供者时宿主显示全部入口；安装文件更换需保留原件，回滚恢复原件与 profile 备份。
