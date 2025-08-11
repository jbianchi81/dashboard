nvm use 20
# mkdir -p wdir
# cd wdir
# cp ../dboard/package.json .
# cp ../dboard/package-lock.json .
npm ci
# cp -r ../dboard/pages .
# cp -r ../dboard/components .
# cp -r ../dboard/lib .
# cp -r ../dboard/public .
# cp -r ../dboard/styles .
# cp ../dboard/tsconfig.json .
npm run build
npm run dev

