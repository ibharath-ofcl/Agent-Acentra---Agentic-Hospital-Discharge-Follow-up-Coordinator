c=open('src/pages/DoctorDashboard.tsx', encoding='utf-8').read()
idx=c.find('type="file"')
start = max(0, idx - 1000)
end = min(len(c), idx + 2000)
c = c[start:end]
open('dump_out.txt', 'w', encoding='utf-8').write(c)
