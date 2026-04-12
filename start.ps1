$nodePath = "C:\Users\a.salem.GFSA\AppData\Local\nvm\v20.19.5"
$env:PATH = "$nodePath;$env:PATH"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
npm run dev > frontend.run.log 2>&1
