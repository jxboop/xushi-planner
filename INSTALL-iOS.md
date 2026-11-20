# 装成真正的 App（不用 App Store）

> 目标：桌面上一个能点开的「序时」图标，跟装微信一样，不需要先打开 Safari。

---

## 先说清楚代价

iOS 不允许随便装 App Store 以外的 App，**必须签名**。两条路：

| | 免费 Apple ID | 付费开发者账号 |
|---|---|---|
| 花多少钱 | 0 | 99 美元/年 |
| 能装吗 | 能 | 能 |
| 有效期 | **7 天**，到期重签一次（30 秒） | 1 年 |
| 能发给别人吗 | 不能，只限自己设备 | 能（TestFlight） |

你说就自己用，免费签名完全够。

但不管哪条路，**都得先有一个 `.ipa` 文件**，而生成 `.ipa` 需要 macOS 编译。你手上是 Windows 也没关系——GitHub 免费给你一台 Mac（Actions），下面就是全套流程。

---

## 第一步：拿到 .ipa

**已经帮你编好了。** 文件在 `build/Xushi-1.0-unsigned.ipa`（1 MB，arm64，iOS 13+）。
直接用就行，跳到第二步。

> 想自己重新编一次（改了代码之后）：仓库已经建好在
> <https://github.com/jxboop/xushi-planner>（私有）。
> 推代码上去就会自动编译，或者到 Actions 页面点 **Run workflow**，
> 跑完在 Artifacts 里下 `Xushi-unsigned-ipa`。

### 如果你想从零自己来

#### 1. 注册并建仓库
1. 打开 <https://github.com> 注册（免费，不用信用卡）
2. 右上角 **+** → **New repository**
3. 名字随便，比如 `xushi`，选 **Private**（私有，别人看不到）→ Create
4. 把项目文件传上去：
   - 网页版：仓库页 → **Add file** → **Upload files** → 把 `uestc-ai-planner` 文件夹**里面的内容**拖进去（`node_modules` 不用传，会被 .gitignore 忽略）
   - 或者用 Git 命令行推上去
5. 确认仓库根目录能看到 `.github`、`index.html`、`native` 这几个

### 2. 点一下编译
1. 仓库顶部 **Actions**
2. 左边列表里点 **打包 iOS（未签名 .ipa）**
3. 右边 **Run workflow** → 绿色按钮
4. 等 8–15 分钟（第一次要装 CocoaPods，慢一点）

### 3. 下载 ipa
1. 跑完后点进那次运行（绿勾）
2. 页面拉到底，**Artifacts** → 点 `Xushi-unsigned-ipa` 下载
3. 解压得到一个文件夹，里面是 `Xushi-unsigned.ipa`

---

## 第二步：签名 + 装到手机（Windows 上做）

### 装两个软件
1. **iTunes**：微软商店搜「iTunes」装（或装 Apple Devices）。这是为了让电脑能跟 iPhone 通话
2. **Sideloadly**：<https://sideloadly.io> 下载 Windows 版并安装

### 连手机
1. 数据线连电脑
2. iPhone 上弹「要信任此电脑吗」→ **信任** → 输锁屏密码

### 签名安装
1. 打开 Sideloadly
2. 把 `Xushi-unsigned.ipa` **拖进**窗口左上角的 IPA 区
3. **Apple account** 填你的 Apple ID（就是 iCloud 那个邮箱）
4. 点 **Start**
5. 弹窗输 Apple ID 密码
   - 如果开了双重认证报错：去 <https://appleid.apple.com> → 登录 → **App 专用密码** → 生成一个 → 把那一串填到 Sideloadly 的密码框
6. 进度条跑完，手机上就有「序时」了

### 最后一步：信任
装完第一次点开会提示「不受信任的开发者」：

**设置 → 通用 → VPN 与设备管理 → 开发者 App → 点你的 Apple ID → 信任**

回桌面，点开就能用了。

---

## 7 天之后

App 会打不开，提示「开发者证书已过期」。**不用重装，重签一次就行**：

Sideloadly 里再拖一次那个 ipa → Start → 30 秒搞定。**数据不会丢**（App 没卸载，只换了签名）。

嫌烦的两个办法：
- **SideStore / AltStore**：同一 WiFi 下自动续签，一次装好不用管
- 买 99 美元开发者账号 → 用 TestFlight，一年有效

---

## 有 Mac 的话更简单

```bash
cd native
npm install
npx cap sync ios
open ios/App/App.xcworkspace
```

Xcode 里：**Signing & Capabilities** → Team 选你的 Apple ID → 选你的 iPhone → 点 ▶️ 直接装进去。

---

## 常见问题

| 现象 | 原因 / 解法 |
|---|---|
| `This app cannot be installed because its integrity could not be verified` | 忘了去「设置 → 通用 → VPN 与设备管理」信任 |
| `Please sign in with an app-specific password` | 开双重认证的账号必须用 App 专用密码，见上面 |
| 卡在 `Generating...` 不动 | 换 USB 口 / 用原装线 / 关掉电脑上的 VPN 和代理 |
| `Maximum number of apps for free development profiles reached` | 免费账号最多同时装 3 个自签 App，删掉旧的 |
| 装完图标是白的 | 等 10 秒，或重启手机刷新图标缓存 |
| 相册选图没反应 | 设置 → 隐私与安全 → 照片 → 序时 → 允许 |

---

## 原生版和网页版有什么不一样

|  | 原生 App | 添加到主屏幕 |
|---|---|---|
| 图标 / 全屏 | 真 App | 几乎一样 |
| 离线可用 | 天生可用（资源打在包里） | 靠缓存，清缓存会掉 |
| 导出日历 / 备份 | 走系统分享面板，能直接存文件、发微信 | 走浏览器下载 |
| 相册权限 | 系统原生授权 | Safari 的图片选择器 |
| AI 请求跨域 | **不需要代理**（走系统网络层） | 可能要 Worker 代理 |
| 7 天重签 | 要 | 不用 |
| 别人能装吗 | 不能（仅自己设备） | 有网址就能装 |

数据还是在手机本地（App 沙盒里的 localStorage），和网页版一样不上传。**换手机 / 重装前记得先在 App 里「备份全部数据」**。
