import os
from pypdf import PdfReader
path = r"c:\Users\kotag\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\C05E3290206A01097B2ADC60935F1667201124A8\transfers\2026-30\Full Stack Developer Case Study (1).pdf"
print('exists', os.path.exists(path), 'size', os.path.getsize(path) if os.path.exists(path) else None)
reader = PdfReader(path)
print('pages', len(reader.pages))
text = '\n'.join(page.extract_text() or '' for page in reader.pages)
print(text[:20000])
