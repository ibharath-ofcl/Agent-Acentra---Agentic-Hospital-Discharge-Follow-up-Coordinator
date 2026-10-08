import sqlite3
import os

db_path = os.path.abspath('backend/acentra.db')
print(f"Database File Path: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\nTable Row Counts:")
    for table in tables:
        tbl_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {tbl_name};")
        count = cursor.fetchone()[0]
        print(f" - {tbl_name}: {count} rows")
    
    conn.close()
except Exception as e:
    print(f"Error reading database: {e}")
