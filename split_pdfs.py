"""
Split the three specified PDFs into 3 parts each and save outputs next to the originals.
Usage:
  - Edit the DEFAULT_FILES list or pass file paths as command-line arguments.
  - Install dependency: `pip install -r requirements.txt` (uses `pypdf`).
  - Run: `python split_pdfs.py`
"""

import os
import sys
from math import ceil
from pypdf import PdfReader, PdfWriter

# Default files (from user's request). Update if needed or pass files on CLI.
DEFAULT_FILES = [
    r"C:\Users\julir\Downloads\StAGR_Bibliothek_STG-RG-15a-2.pdf",
    r"C:\Users\julir\Downloads\StAGR_Bibliothek_STG-RG-15a-3.pdf",
    r"C:\Users\julir\Downloads\StAGR_Bibliothek_STG-RG-15a-1.pdf",
]


def split_pdf(path: str, parts: int = 3) -> list:
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    reader = PdfReader(path)
    total = len(reader.pages)
    if total == 0:
        raise ValueError(f"No pages in PDF: {path}")

    # Compute sizes for each part (distribute remainder to first parts)
    base = total // parts
    rem = total % parts
    sizes = [base + (1 if i < rem else 0) for i in range(parts)]

    outputs = []
    page_index = 0
    dir_name, filename = os.path.split(path)
    name_only, _ = os.path.splitext(filename)

    for i, size in enumerate(sizes, start=1):
        if size <= 0:
            continue
        writer = PdfWriter()
        for _ in range(size):
            writer.add_page(reader.pages[page_index])
            page_index += 1
        out_name = f"{name_only}_part{i}.pdf"
        out_path = os.path.join(dir_name, out_name)
        with open(out_path, "wb") as f:
            writer.write(f)
        outputs.append(out_path)

    return outputs


def main(files):
    all_outputs = []
    for f in files:
        try:
            print(f"Processing: {f}")
            outs = split_pdf(f, parts=3)
            for o in outs:
                print(f"  -> {o}")
            all_outputs.extend(outs)
        except Exception as e:
            print(f"Error processing {f}: {e}")
    print("Done.")
    return all_outputs


if __name__ == "__main__":
    files = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_FILES
    main(files)
