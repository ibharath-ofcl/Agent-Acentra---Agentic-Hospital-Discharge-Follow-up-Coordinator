import os
import re
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

def extract_text(file_path: str, ext: str) -> str:
    """
    Extracts text from PDF, DOCX, TXT, or Image files.
    """
    text = ""
    ext = ext.lower().replace(".", "")
    try:
        if ext == 'pdf':
            reader = PdfReader(file_path)
            pages_text = []
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    pages_text.append(extracted)
            text = "\n\n".join(pages_text)
            if not text.strip():
                # Fallback to binary scan if PDF has raw unencoded streams
                with open(file_path, 'rb') as f:
                    content = f.read()
                    matches = re.findall(b'[ -~]{4,}', content)
                    text = " ".join([m.decode('ascii', errors='ignore') for m in matches])
        elif ext in ['doc', 'docx']:
            with zipfile.ZipFile(file_path) as docx:
                xml_content = docx.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                for node in tree.iter():
                    if node.tag.endswith('}t') and node.text:
                        text += node.text + " "
        elif ext in ['png', 'jpg', 'jpeg', 'webp']:
            # For image files, we return a header noting image format for multimodal Gemini processing
            text = f"[IMAGE_DOCUMENT: {os.path.basename(file_path)}]\nFormat: {ext.upper()}"
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        print(f"Extraction error on {file_path}: {e}")
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        except Exception:
            pass
            
    return text.strip()

def find_patient_mrns(text: str):
    """
    Searches for standard MRN formats such as MRN-9281C, MRN-RAVI-001, MRN-1001.
    """
    matches = re.findall(r'MRN-[0-9A-Za-z]+', text, re.IGNORECASE)
    return list(set([m.upper() for m in matches]))
