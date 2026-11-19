"""生成「序时」App 图标：渐变底 + 日历 + AI 星标（超采样抗锯齿）"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(OUT, exist_ok=True)

S = 1024  # 超采样尺寸


def gradient(size):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    u = x / (size - 1)
    v = y / (size - 1)
    t = np.clip(u * 0.52 + v * 0.48, 0, 1)[..., None]

    stops = [
        (0.00, np.array([86, 122, 255])),   # 亮蓝
        (0.46, np.array([79, 97, 250])),    # 蓝紫
        (0.78, np.array([124, 92, 246])),   # 紫
        (1.00, np.array([150, 92, 240])),   # 浅紫
    ]
    img = np.zeros((size, size, 3), dtype=np.float32)
    for i in range(len(stops) - 1):
        a, ca = stops[i]
        b, cb = stops[i + 1]
        m = (t[..., 0] >= a) & (t[..., 0] <= b)
        k = ((t[..., 0] - a) / (b - a))[..., None]
        seg = ca[None, None, :] * (1 - k) + cb[None, None, :] * k
        img[m] = seg[m]

    # 左上高光
    cx, cy = size * 0.26, size * 0.16
    d = np.sqrt(((x - cx) ** 2 + (y - cy) ** 2)) / (size * 0.62)
    glow = np.clip(1 - d, 0, 1)[..., None] ** 2.6 * 0.18
    img = img * (1 - glow) + 255 * glow

    # 右下压深，制造体积
    d2 = np.sqrt(((x - size * 0.92) ** 2 + (y - size * 1.06) ** 2)) / (size * 0.85)
    shade = np.clip(1 - d2, 0, 1)[..., None] ** 2 * 0.16
    img = img * (1 - shade) + np.array([46, 30, 120])[None, None, :] * shade

    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB")


def draw_mark(img, scale=1.0):
    """白色日历 + 星标，scale 用于 maskable 留白"""
    d = ImageDraw.Draw(img, "RGBA")
    c = S / 2
    s = scale

    # 日历主体（描边圆角矩形）
    w, h = 460 * s, 400 * s
    lw = int(34 * s)
    box = [c - w / 2, c - h / 2 + 26 * s, c + w / 2, c + h / 2 + 26 * s]
    d.rounded_rectangle(box, radius=int(84 * s), outline=(255, 255, 255, 255), width=lw)

    # 顶部两条装订柱
    for dx in (-112 * s, 112 * s):
        d.rounded_rectangle(
            [c + dx - 17 * s, box[1] - 54 * s, c + dx + 17 * s, box[1] + 34 * s],
            radius=int(17 * s), fill=(255, 255, 255, 255))

    # 日历内两条"日程"（下面一条让出星标的位置）
    y1 = box[1] + 128 * s
    d.rounded_rectangle([box[0] + 74 * s, y1, box[0] + 262 * s, y1 + 30 * s],
                        radius=int(15 * s), fill=(255, 255, 255, 235))
    y2 = y1 + 84 * s
    d.rounded_rectangle([box[0] + 74 * s, y2, box[0] + 178 * s, y2 + 30 * s],
                        radius=int(15 * s), fill=(255, 255, 255, 165))

    # 右下 AI 四角星（安放在日历内侧，不与边框相撞）
    sx, sy = box[2] - 84 * s, box[3] - 84 * s
    R, r = 62 * s, 17 * s
    star = [(sx, sy - R), (sx + r, sy - r), (sx + R, sy), (sx + r, sy + r),
            (sx, sy + R), (sx - r, sy + r), (sx - R, sy), (sx - r, sy - r)]
    d.polygon(star, fill=(255, 255, 255, 255))
    return img


def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)
    print("  ->", name, size)


base = draw_mark(gradient(S), 1.0)
save(base, "icon-512.png", 512)
save(base, "icon-192.png", 192)
save(base, "apple-touch-icon.png", 180)
save(base, "favicon-64.png", 64)

# maskable：内容缩到 78%，背景铺满（系统圆形/方形裁切都不会切到主体）
m0 = gradient(S)
inner = draw_mark(gradient(int(S * 0.78)), 1.0)
m0.paste(inner, (int(S * 0.11), int(S * 0.11)))
save(m0, "maskable-512.png", 512)

# 预览图
prev = Image.new("RGB", (560, 200), (243, 244, 247))
for i, (n, sz) in enumerate([("icon-192.png", 96), ("icon-512.png", 128), ("apple-touch-icon.png", 72)]):
    im = Image.open(os.path.join(OUT, n)).resize((sz, sz), Image.LANCZOS)
    prev.paste(im, (40 + i * 165, 36))
prev.save(os.path.join(os.path.dirname(OUT), "preview", "icons.png"))
print("done")
