import os
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

def convert_to_webp(folder_path):
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.heif', '.jpeg', '.jpg', '.png')) and not filename.lower().endswith('.webp'):
            filepath = os.path.join(folder_path, filename)
            try:
                img = Image.open(filepath)
                webp_filename = os.path.splitext(filename)[0] + '.webp'
                webp_filepath = os.path.join(folder_path, webp_filename)
                
                if not os.path.exists(webp_filepath):
                    img.save(webp_filepath, 'WEBP')
                    print(f"Converted {filename} to {webp_filename}")
                else:
                    print(f"Skipped {filename}, {webp_filename} already exists")
                    
            except Exception as e:
                print(f"Error converting {filename}: {e}")

if __name__ == '__main__':
    convert_to_webp('c:/exito1000/assets/alunos')
