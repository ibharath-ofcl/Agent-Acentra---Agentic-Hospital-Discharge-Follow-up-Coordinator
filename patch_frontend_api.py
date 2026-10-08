import re
with open('src/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

if 'getExtraction' not in text:
    new_method = """
  getExtraction: async (docId: number) => {
    const response = await fetch(`${API_URL}/doctor/extraction/${docId}`, {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch extraction');
    return response.json();
  },
"""
    text = text.replace('getDoctorOverdue: async () => {', new_method + '  getDoctorOverdue: async () => {')
    with open('src/api.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated api.ts")
