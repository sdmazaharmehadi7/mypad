import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons():
    # 1. High-resolution canvas 512x512 for super-sampling
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dark rounded square (zinc-950: #09090b)
    # Full bleed with sleek squircle radius
    pad = 24
    radius = 104
    rect_coords = [pad, pad, size - pad, size - pad]
    bg_color = (9, 9, 11, 255) # zinc-950

    draw.rounded_rectangle(rect_coords, radius=radius, fill=bg_color)

    # Clean white "M"
    font_path = '/System/Library/Fonts/SFNSMono.ttf'
    font_size = 280
    font = ImageFont.truetype(font_path, font_size)

    # Center the "M"
    bbox = draw.textbbox((0, 0), 'M', font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate centered position with slight optical adjustment
    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1] - 4

    draw.text((x, y), 'M', font=font, fill=(255, 255, 255, 255))

    # Save high-res PNGs
    os.makedirs('src/app', exist_ok=True)
    os.makedirs('public', exist_ok=True)

    img.save('src/app/icon.png', 'PNG')
    img.save('public/icon.png', 'PNG')

    # Apple Touch Icon 180x180
    apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save('src/app/apple-icon.png', 'PNG')
    apple_icon.save('public/apple-touch-icon.png', 'PNG')

    # Multi-resolution ICO: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save('src/app/favicon.ico', format='ICO', sizes=ico_sizes)
    img.save('public/favicon.ico', format='ICO', sizes=ico_sizes)

    # Vector SVG favicon for maximum clarity on Retina / modern browsers
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#09090b"/>
  <text x="16" y="22.5" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="19" font-weight="700" fill="#ffffff" text-anchor="middle">M</text>
</svg>'''

    with open('src/app/icon.svg', 'w') as f:
        f.write(svg_content)
    with open('public/icon.svg', 'w') as f:
        f.write(svg_content)

    print('✓ Generated MyPad favicon.ico, icon.png, icon.svg, and apple-icon.png!')

if __name__ == '__main__':
    generate_icons()
