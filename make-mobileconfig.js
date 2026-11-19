#!/usr/bin/env node
/**
 * 生成 iOS 桌面安装包（Web Clip 描述文件）
 *
 *   node make-mobileconfig.js https://xushi.pages.dev
 *   node make-mobileconfig.js https://xushi.pages.dev "序时"
 *
 * 产物：xushi.mobileconfig —— 手机 Safari 打开它（或直接访问站点根目录的
 * 这个文件）就会弹出「安装描述文件」，装完桌面出现图标，全屏运行。
 */

const fs = require('fs');
const path = require('path');

const url = (process.argv[2] || '').trim();
const name = (process.argv[3] || '序时').trim();

if (!/^https:\/\/.+/i.test(url)) {
  console.error('用法: node make-mobileconfig.js https://你的域名 [名称]');
  console.error('注意：必须 https 开头（http 装出来是空白页）。');
  process.exit(1);
}

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
}).toUpperCase();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let iconBlock = '';
const iconPath = path.join(__dirname, 'icons', 'apple-touch-icon.png');
if (fs.existsSync(iconPath)) {
  const b64 = fs.readFileSync(iconPath).toString('base64');
  iconBlock = `\n            <key>Icon</key>\n            <data>${b64}</data>`;
  console.log('图标已内嵌:', Math.round(b64.length / 1024) + 'KB base64');
} else {
  console.log('没找到 icons/apple-touch-icon.png，跳过图标（桌面会显示灰色方块）');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>${iconBlock}
            <key>IgnoreManifestScope</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${esc(name)}</string>
            <key>PayloadDescription</key>
            <string>把「${esc(name)}」放到桌面上，全屏使用</string>
            <key>PayloadDisplayName</key>
            <string>${esc(name)}</string>
            <key>PayloadIdentifier</key>
            <string>com.xushi.webclip.${Date.now()}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.management</string>
            <key>PayloadUUID</key>
            <string>${uuid()}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${esc(url)}</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>${esc(name)} · AI 日程</string>
    <key>PayloadDisplayName</key>
    <string>${esc(name)}</string>
    <key>PayloadIdentifier</key>
    <string>com.xushi.profile.${Date.now()}</string>
    <key>PayloadOrganization</key>
    <string>Xushi</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid()}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
`;

const out = path.join(__dirname, 'xushi.mobileconfig');
fs.writeFileSync(out, xml, 'utf8');

// 顺带写 _headers，让 Cloudflare Pages 用正确的 MIME 返回它
const headersPath = path.join(__dirname, '_headers');
const headerRule = `/xushi.mobileconfig
  Content-Type: application/x-apple-aspen-config
  Content-Disposition: inline; filename="xushi.mobileconfig"

/install.html
  Cache-Control: no-store
`;
fs.writeFileSync(headersPath, headerRule, 'utf8');

console.log('已生成:', out, '(' + Math.round(xml.length / 1024) + 'KB)');
console.log('App 地址:', url);
console.log('');
console.log('两种用法：');
console.log('  1) 把这个文件重新部署上去，手机 Safari 访问  ' + url.replace(/\/$/, '') + '/xushi.mobileconfig');
console.log('  2) 直接把文件发到手机（AirDrop / 微信 / 邮件），点开后去「设置」里安装');
