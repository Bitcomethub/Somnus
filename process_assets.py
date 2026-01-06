from PIL import Image
import os

source_path = "/Users/macbook/.gemini/antigravity/brain/3ef44bbf-2fab-4e0b-9673-b86c1f3d3a83/uploaded_image_1767657943900.png"
dest_dir = "/Users/macbook/.gemini/antigravity/scratch/tingle/assets"

img = Image.open(source_path)
width, height = img.size
print(f"Original Size: {width}x{height}")

# 1. Crop Banner (Top Section)
# Heuristic: Top 60% of the image seems to be the banner based on typical layouts + visual buffer.
# Let's be safe and say top 55% to avoid cutting into the icons below, or assume a clean split.
# Looking at the image, there is whitespace.
# Let's assume a 60/40 split roughly.
banner_height = int(height * 0.60)
banner_box = (0, 0, width, banner_height)
banner = img.crop(banner_box)
banner.save(os.path.join(dest_dir, "somnus-banner.png"))
print("Saved somnus-banner.png")

# 2. Crop App Icon (Bottom Left)
# The remaining 40% height.
# Width is split into ~3.
icon_section_top = banner_height
icon_section_height = height - banner_height
icon_width = int(width / 3) 

# Adjusting to ensure we get the icon centered.
# Bottom Left Box:
icon_box = (0, icon_section_top, icon_width, height)
icon = img.crop(icon_box)

# Optional: Crop whitespace around the icon circle if needed, but the user said "bottom left".
# The provided image has icons with rounded squares/circles.
# Let's save it as is.
icon.save(os.path.join(dest_dir, "icon.png"))
print("Saved icon.png")
