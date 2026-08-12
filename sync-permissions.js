const fs = require('fs');
const path = require('path');

const BACKEND_CONST_DIR = path.join(__dirname, '../AMFCore-Back/AMFCore/Domain/Abstractions/Const/SystemStructure');
const FRONTEND_CONST_DIR = path.join(__dirname, 'src/app/core/constants');

function extractConstants(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const constants = {};
    const regex = /public const string\s+([A-Za-z0-9_]+)\s*=\s*(.*?);/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        let value = match[2].trim();
        constants[key] = value;
    }
    return constants;
}

function processPermissions(filePath, appPages, appActions) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const constants = {};
    // Matches both literal strings and interpolated strings
    const regex = /public const string\s+([A-Za-z0-9_]+)\s*=\s*(\$?"[^"]*");/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        let value = match[2].trim();
        
        // Convert C# string interpolation to TS template literal
        if (value.startsWith('$')) {
            value = value.substring(1); // remove $
            // Replace {AppPages.X} with ${AppPages.X}
            value = value.replace(/\{AppPages\.([A-Za-z0-9_]+)\}/g, '${AppPages.$1}');
            value = value.replace(/\{AppActions\.([A-Za-z0-9_]+)\}/g, '${AppActions.$1}');
            value = '`' + value.substring(1, value.length - 1) + '`';
        } else {
            value = "'" + value.substring(1, value.length - 1) + "'";
        }
        constants[key] = value;
    }
    return constants;
}

function generateTsFile(name, obj, deps = '') {
    let content = `// AUTO-GENERATED FILE. DO NOT MODIFY DIRECTLY.\n`;
    content += `// Run 'npm run sync-permissions' to update from backend.\n\n`;
    if (deps) {
        content += deps + '\n\n';
    }
    content += `export const ${name} = {\n`;
    for (const [key, value] of Object.entries(obj)) {
        content += `  ${key}: ${value},\n`;
    }
    content += `};\n`;
    return content;
}

function main() {
    if (!fs.existsSync(FRONTEND_CONST_DIR)) {
        fs.mkdirSync(FRONTEND_CONST_DIR, { recursive: true });
    }

    const appPages = extractConstants(path.join(BACKEND_CONST_DIR, 'AppPages.cs'));
    const appActions = extractConstants(path.join(BACKEND_CONST_DIR, 'AppActions.cs'));
    
    // We want the TS version of AppPages and AppActions to just be strings
    const tsAppPages = {};
    for (const [k, v] of Object.entries(appPages)) {
        tsAppPages[k] = v.startsWith('"') ? "'" + v.substring(1, v.length - 1) + "'" : v;
    }
    
    const tsAppActions = {};
    for (const [k, v] of Object.entries(appActions)) {
        tsAppActions[k] = v.startsWith('"') ? "'" + v.substring(1, v.length - 1) + "'" : v;
    }

    const permissions = processPermissions(path.join(BACKEND_CONST_DIR, 'Permissions.cs'), appPages, appActions);

    fs.writeFileSync(path.join(FRONTEND_CONST_DIR, 'app-pages.ts'), generateTsFile('AppPages', tsAppPages));
    fs.writeFileSync(path.join(FRONTEND_CONST_DIR, 'app-actions.ts'), generateTsFile('AppActions', tsAppActions));
    
    const permDeps = `import { AppPages } from './app-pages';\nimport { AppActions } from './app-actions';`;
    fs.writeFileSync(path.join(FRONTEND_CONST_DIR, 'permissions.ts'), generateTsFile('Permissions', permissions, permDeps));
    
    console.log('Permissions synced successfully!');
}

main();
