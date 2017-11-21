
rm -rf src/assets/swagger-ui
mkdir -p src/assets/swagger-ui
chmod 777 -R src/assets/swagger-ui

cp node_modules/apix-components/assets/* src/assets
cp –r node_modules/swagger-ui/dist/* src/assets/swagger-ui
cp node_modules/clarity-ui/clarity-ui.min.css src/assets
cp node_modules/clarity-icons/clarity-icons.min.css src/assets
