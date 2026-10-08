with open('src/context/AuthContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'export const AuthContext = createContext<AuthContextType | undefined>(undefined);',
    'import { AuthContext } from "./authContextDef";'
)

with open('src/context/AuthContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated AuthContext.tsx")
