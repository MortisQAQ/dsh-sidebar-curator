# 桌面 profile 安装与恢复

## 不修改安装归档的集成方式

适配包应从已核对的当前侧栏客户端生成，ModuleLoader id 必须重命名为 dsh-sidebar-curator-host-adapter。不要只把改过的官方 client.js 放进新包：身份不一致时浏览器会加载错误模块。保留上游 MIT 许可与 source/output hash。

```sh
node scripts/create-adapter-package.mjs CURRENT_CLIENT_JS NEW_ADAPTER_DIRECTORY UPSTREAM_LICENSE
```

脚本要求全新输出目录；不会覆盖正在使用的适配包。生成后进行 node --check 与隔离 GUI 验收，再安装为 profile 依赖。生成成功并不代表所有新版DSH兼容。

profile patch应保留官方name作为匹配条件，用disabled停用原生席位，再insert适配包：

```yaml
- id: ui-sidebar
  name: "@deepseek-ai/dsh-client-ui-sidebar"
  disabled: true
- insert:
    - id: curator-host-adapter
      name: dsh-sidebar-curator-host-adapter
```

Curator自身通过bundle加入。仅修改name会被宿主判为name mismatch并跳过。正式desktop只能由Electron管理；CLI dump-config被阻止不是配置已验证的证据。

## 恢复优先级

1. 正常恢复：在插件管理中停用Curator，移除上述适配insert与原生disabled覆盖；重载Electron，原生侧栏恢复。保留偏好不会阻挡原生入口。
2. 桌面无法打开时，用文件编辑删除仅本插件追加的patch片段并重启。保留其他会话新写入的配置。
3. 只有确认没有其他会话后续改动时，才整体恢复备份package.json、pnpm-lock.yaml、cordis.patch.yml，再通过相同包管理器恢复依赖。不要直接用旧备份覆盖同时开发中的工作台或其他插件。

本机本轮备份：.local/desktop-backup-20261116-1737。正式profile引用.local/adapted-sidebar，该目录是部署依赖，不应作为临时垃圾清理；之后迁移至稳定部署目录时先安装新引用再移除旧引用。

隔离GUI已完成收纳/刷新/原面板跳转/禁用重启恢复。正式桌面重载及QQ、Purge、待办、仓库地志四项仍需逐项验收。
