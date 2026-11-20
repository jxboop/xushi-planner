# 签名 + 装到 iPhone（你只需要做这一页）

ipa 已经编好了：**`build/Xushi-1.0-unsigned.ipa`**（1 MB，arm64，iOS 13+）。

剩下的只有签名——这一步必须你本人做，因为要输你的 Apple ID 密码、手机上点「信任」。

---

## 准备（只做一次）

| 要什么 | 怎么弄 |
|---|---|
| iTunes（桌面版，**不是**微软商店那个） | 装 `tools/iTunes64Setup.exe`，或命令行：`winget install -e --id Apple.iTunes` |
| Sideloadly | 装 `tools/SideloadlySetup64.exe` |
| 数据线 | 原装线最稳，连电脑后手机点「信任此电脑」 |

> iTunes 是给电脑装 iPhone 驱动的，装完不用打开它。

---

## 签名（每次 30 秒）

1. **iPhone 用线连着电脑**，解锁屏幕
2. 打开 **Sideloadly**
3. 把 `Xushi-1.0-unsigned.ipa` **拖进** Sideloadly 左上角的框
4. **Apple account** 填你的 Apple ID（iCloud 邮箱）
5. 点 **Start**，弹窗输 Apple ID 密码
6. 等进度条跑完（1–2 分钟），手机上出现「序时」

### 如果报密码错 / 提示 app-specific password
去 <https://appleid.apple.com> 登录 → **登录与安全** → **App 专用密码** → 生成一个 → 填到 Sideloadly 的密码框。

---

## 第一次装完：信任（只做一次）

**设置 → 通用 → VPN 与设备管理 → 开发者 App → 点你的 Apple ID → 信任**

然后回桌面点开「序时」，能用就成功了。

---

## 7 天后

App 点开会闪退 / 提示「开发者证书已过期」。

**不用卸载，不用重装**：Sideloadly 里再拖一次同一个 ipa → Start → 30 秒。**你的日程数据不会丢**。

嫌麻烦就装 SideStore（自动续签），或者忍一下每周末点一次。

---

## 报错了看这里

| 提示 | 意思 | 怎么办 |
|---|---|---|
| `This app cannot be installed because its integrity could not be verified` | 没信任 | 设置 → 通用 → VPN 与设备管理 → 信任 |
| `Please sign in with an app-specific password` | 开了双重认证 | 用 App 专用密码 |
| 卡在 `Generating...` | 线或代理问题 | 换 USB 口、关 VPN、换原装线 |
| `Maximum number of apps for free development profiles reached` | 免费账号最多 3 个自签 App | 删掉以前自签的 |
| Sideloadly 说找不到设备 | 驱动没装 | 装 iTunes 桌面版，重插线 |
| 装完图标空白 | 图标缓存 | 等 10 秒或重启手机 |

---

## 装好之后

打开 App → **我的 → DeepSeek API Key** → 粘贴 → 测试连接。

原生版走系统网络，**不需要跨域代理**，填了 Key 就能用。

其他都在 **维护** 页：备份、导出日历、运行日志、强制刷新。
