with open('README.md', 'a', encoding='utf-8') as f:
    f.write("\n\n## Phase 3: Real Document Intelligence\n")
    f.write("### Step 1: Ingestion & Validation Layer\n")
    f.write("- Implemented native parsing for `.docx`, `.xlsx`, and `.pdf` inside `backend/document_parser.py` using standard libraries to extract plain text footprints.\n")
    f.write("- Integrated strict patient validation logic prioritizing zero-hallucination policies. Files are uploaded via `POST /api/doctor/upload`.\n")
    f.write("- Files containing strict identifiable MRNs are mapped directly (storing a `DischargeDocument` reference and generating a `TimelineEvent`).\n")
    f.write("- **Missing** or **Ambiguous** files immediately flag the workflow, returning a `Needs Human Review` boolean to the UI which renders clear diagnostic warnings.\n")

print("Docs updated")
