'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var googleClosureCompiler = require('google-closure-compiler');
var path = require('path');
var os = require('os');
var crypto = require('crypto');
var uuid = require('uuid');
var MagicString = _interopDefault(require('magic-string'));
var remapping = _interopDefault(require('@ampproject/remapping'));
var acorn = require('acorn');
var estreeWalker = require('estree-walker');

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function writeTempFile(content, extension = '', stableName = true) {
    let hash;
    if (stableName) {
        hash = crypto.createHash('sha1')
            .update(content)
            .digest('hex');
    }
    else {
        hash = uuid.v4();
    }
    const fullpath = path.join(os.tmpdir(), hash + extension);
    await fs.promises.mkdir(path.dirname(fullpath), { recursive: true });
    await fs.promises.writeFile(fullpath, content, 'utf-8');
    return fullpath;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* c8 ignore next 15 */
async function logTransformChain(file, stage, messages) {
    return;
}
/* c8 ignore next 7 */
const log = (preamble, message) => {
    return;
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function createDecodedSourceMap(magicstring, source) {
    return {
        ...magicstring.generateDecodedMap({ hires: true, source }),
        version: 3,
    };
}
function createExistingRawSourceMap(maps, file) {
    var _a;
    const remappedSourceMap = remapping(maps, () => null);
    return {
        ...remappedSourceMap,
        sources: remappedSourceMap.sources.map(source => source || ''),
        sourcesContent: ((_a = remappedSourceMap.sourcesContent) === null || _a === void 0 ? void 0 : _a.map(content => content || '')) || undefined,
        file,
    };
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Transform {
    constructor(context, pluginOptions, mangler, memory, inputOptions, outputOptions) {
        this.name = 'Transform';
        this.context = context;
        this.pluginOptions = pluginOptions;
        this.mangler = mangler;
        this.memory = memory;
        this.inputOptions = inputOptions;
        this.outputOptions = outputOptions;
    }
}
class SourceTransform extends Transform {
    constructor() {
        super(...arguments);
        this.name = 'SourceTransform';
    }
    async transform(id, source) {
        return source;
    }
}
class ChunkTransform extends Transform {
    constructor() {
        super(...arguments);
        this.name = 'ChunkTransform';
    }
    extern(options) {
        return null;
    }
    async pre(fileName, source) {
        return source;
    }
    async post(fileName, source) {
        return source;
    }
}
async function chunkLifecycle(fileName, printableName, method, code, transforms) {
    const log = [];
    const sourcemaps = [];
    let source = new MagicString(code);
    let finalSource = '';
    log.push(['before', code]);
    try {
        for (const transform of transforms) {
            const transformed = await transform[method](fileName, source);
            const transformedSource = transformed.toString();
            sourcemaps.push(createDecodedSourceMap(transformed, fileName));
            source = new MagicString(transformedSource);
            log.push([transform.name, transformedSource]);
        }
        finalSource = source.toString();
    }
    catch (e) {
        log.push(['after', finalSource]);
        await logTransformChain();
        throw e;
    }
    log.push(['after', finalSource]);
    await logTransformChain();
    return {
        code: finalSource,
        map: createExistingRawSourceMap(sourcemaps, fileName),
    };
}
async function sourceLifecycle(id, printableName, code, transforms) {
    const fileName = path.basename(id);
    const log = [];
    const sourcemaps = [];
    let source = new MagicString(code);
    log.push(['before', code]);
    for (const transform of transforms) {
        const transformed = await transform.transform(id, source);
        const transformedSource = transformed.toString();
        sourcemaps.push(createDecodedSourceMap(transformed, id));
        source = new MagicString(transformedSource);
        log.push([transform.name, transformedSource]);
    }
    const finalSource = source.toString();
    log.push(['after', finalSource]);
    await logTransformChain();
    return {
        code: finalSource,
        map: createExistingRawSourceMap(sourcemaps, fileName),
    };
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Closure Compiler will not compile code that is prefixed with a hashbang (common to rollup output for CLIs).
 *
 * This transform will remove the hashbang (if present) and ask Ebbinghaus to remember if for after compilation.
 */
class HashbangRemoveTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'HashbangRemoveTransform';
    }
    /**
     * @param source MagicString of source to process post Closure Compilation.
     */
    async pre(fileName, source) {
        const stringified = source.trim().toString();
        const match = /^#!.*/.exec(stringified);
        if (!match) {
            return source;
        }
        this.memory.hashbang = match[0];
        source.remove(0, match[0].length);
        return source;
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Closure Compiler will not compile code that is prefixed with a hashbang (common to rollup output for CLIs).
 *
 * This transform will restore the hashbang if Ebbinghaus knows it exists.
 */
class HashbangApplyTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'HashbangApplyTransform';
    }
    /**
     * @param source MagicString of source to process post Closure Compilation.
     */
    async post(fileName, source) {
        if (this.memory.hashbang === null) {
            return source;
        }
        source.prepend(this.memory.hashbang + '\n');
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const HEADER = `/**
 * @fileoverview Externs built via derived configuration from Rollup or input code.
 * This extern contains the iife name so it does not get mangled at the top level.
 * @externs
 */
`;
/**
 * This Transform will apply only if the Rollup configuration is for a iife output with a defined name.
 *
 * In order to preserve the name of the iife output, derive an extern definition for Closure Compiler.
 * This preserves the name after compilation since Closure now believes it to be a well known global.
 */
class IifeTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'IifeTransform';
    }
    extern(options) {
        if (options.format === 'iife' && options.name) {
            return HEADER + `window['${options.name}'] = ${options.name};\n`;
        }
        return null;
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const HEADER$1 = `/**
* @fileoverview Externs built via derived configuration from Rollup or input code.
* This extern contains the cjs typing info for modules.
* @externs
*/

/**
* @typedef {{
*   __esModule: boolean,
* }}
*/
var exports;`;
/**
 * This Transform will apply only if the Rollup configuration is for a cjs output.
 *
 * In order to preserve the __esModules boolean on an Object, this typedef needs to be present.
 */
class CJSTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'CJSTransform';
    }
    extern(options) {
        if (options.format === 'cjs') {
            return HEADER$1;
        }
        return null;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const acornWalk = require('acorn-walk');
const walk = {
    simple: acornWalk.simple,
    ancestor: acornWalk.ancestor,
};
const DEFAULT_ACORN_OPTIONS = {
    ecmaVersion: 2020,
    sourceType: 'module',
    preserveParens: false,
    ranges: true,
};
async function parse(fileName, source) {
    try {
        return acorn.parse(source, DEFAULT_ACORN_OPTIONS);
    }
    catch (e) {
        log(`parse exception in ${fileName}`, `file://${await writeTempFile(source, '.js')}`);
        throw e;
    }
}
function isIdentifier(node) {
    return node.type === 'Identifier';
}
function isImportDeclaration(node) {
    return node.type === 'ImportDeclaration';
}
function isImportExpression(node) {
    // @types/estree does not yet support 2020 addons to ECMA.
    // This includes ImportExpression ... import("thing")
    return node.type === 'ImportExpression';
}
function isVariableDeclarator(node) {
    return node.type === 'VariableDeclarator';
}
function isBlockStatement(node) {
    return node.type === 'BlockStatement';
}
function isExportNamedDeclaration(node) {
    return node.type === 'ExportNamedDeclaration';
}
function isFunctionDeclaration(node) {
    return node.type === 'FunctionDeclaration';
}
function isVariableDeclaration(node) {
    return node.type === 'VariableDeclaration';
}
function isClassDeclaration(node) {
    return node.type === 'ClassDeclaration';
}
function isProperty(node) {
    return node.type === 'Property';
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Closure Compiler will not transform computed keys with literal values back to the literal value.
 * e.g {[0]: 'value'} => {0: 'value'}
 *
 * This transform does so only if a computed key is a Literal, and thus easily known to be static.
 * @see https://astexplorer.net/#/gist/d2414b45a81db3a41ee6902bfd09947a/d7176ac33a2733e1a4b1f65ec3ac626e24f7b60d
 */
class LiteralComputedKeys extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'LiteralComputedKeysTransform';
    }
    /**
     * @param code source to parse, and modify
     * @return modified input source with computed literal keys
     */
    async post(fileName, source) {
        const program = await parse(fileName, source.toString());
        walk.simple(program, {
            ObjectExpression(node) {
                for (const property of node.properties) {
                    if (isProperty(property) && property.computed && property.key.type === 'Literal') {
                        const [propertyStart] = property.range;
                        const [valueStart] = property.value.range;
                        source.overwrite(propertyStart, valueStart, `${property.key.value}${property.value.type !== 'FunctionExpression' ? ':' : ''}`);
                    }
                }
            },
        });
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IMPORT_SPECIFIER = 'ImportSpecifier';
const IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier';
const IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier';
var ExportClosureMapping;
(function (ExportClosureMapping) {
    ExportClosureMapping[ExportClosureMapping["NAMED_FUNCTION"] = 0] = "NAMED_FUNCTION";
    ExportClosureMapping[ExportClosureMapping["NAMED_CLASS"] = 1] = "NAMED_CLASS";
    ExportClosureMapping[ExportClosureMapping["NAMED_DEFAULT_FUNCTION"] = 2] = "NAMED_DEFAULT_FUNCTION";
    ExportClosureMapping[ExportClosureMapping["DEFAULT_FUNCTION"] = 3] = "DEFAULT_FUNCTION";
    ExportClosureMapping[ExportClosureMapping["NAMED_DEFAULT_CLASS"] = 4] = "NAMED_DEFAULT_CLASS";
    ExportClosureMapping[ExportClosureMapping["DEFAULT_CLASS"] = 5] = "DEFAULT_CLASS";
    ExportClosureMapping[ExportClosureMapping["NAMED_CONSTANT"] = 6] = "NAMED_CONSTANT";
    ExportClosureMapping[ExportClosureMapping["DEFAULT"] = 7] = "DEFAULT";
    ExportClosureMapping[ExportClosureMapping["DEFAULT_VALUE"] = 8] = "DEFAULT_VALUE";
    ExportClosureMapping[ExportClosureMapping["DEFAULT_OBJECT"] = 9] = "DEFAULT_OBJECT";
})(ExportClosureMapping || (ExportClosureMapping = {}));

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Locally within exporting we always need a name
 * If value passed is not present in the mangler then use original name.
 * @param input
 * @param unmangle
 */
function getName(input, unmangle) {
    if (unmangle) {
        return unmangle(input) || input;
    }
    return input;
}
function NamedDeclaration(node, unmangle) {
    var _a;
    const exportDetails = [];
    const range = node.range;
    const source = typeof ((_a = node.source) === null || _a === void 0 ? void 0 : _a.value) === 'string' ? node.source.value : null;
    const { specifiers, declaration } = node;
    // NamedDeclarations either have specifiers or declarations.
    if (specifiers.length > 0) {
        for (const specifier of specifiers) {
            const exported = getName(specifier.exported.name, unmangle);
            exportDetails.push({
                local: getName(specifier.local.name, unmangle),
                exported,
                type: ExportClosureMapping.NAMED_CONSTANT,
                range,
                source,
            });
        }
        return exportDetails;
    }
    if (declaration) {
        if (isFunctionDeclaration(declaration)) {
            // Only default exports can be missing an identifier.
            exportDetails.push({
                local: getName(declaration.id.name, unmangle),
                exported: getName(declaration.id.name, unmangle),
                type: ExportClosureMapping.NAMED_FUNCTION,
                range,
                source,
            });
        }
        if (isVariableDeclaration(declaration)) {
            for (const eachDeclaration of declaration.declarations) {
                if (isIdentifier(eachDeclaration.id)) {
                    exportDetails.push({
                        local: getName(eachDeclaration.id.name, unmangle),
                        exported: getName(eachDeclaration.id.name, unmangle),
                        type: ExportClosureMapping.NAMED_CONSTANT,
                        range,
                        source,
                    });
                }
            }
        }
        if (isClassDeclaration(declaration)) {
            // Only default exports can be missing an identifier.
            exportDetails.push({
                local: getName(declaration.id.name, unmangle),
                exported: getName(declaration.id.name, unmangle),
                type: ExportClosureMapping.NAMED_CLASS,
                range,
                source,
            });
        }
    }
    return exportDetails;
}
function DefaultDeclaration(defaultDeclaration, unmangle) {
    const { declaration } = defaultDeclaration;
    if (declaration.type === 'Identifier' && declaration.name) {
        return [
            {
                local: getName(declaration.name, unmangle),
                exported: getName(declaration.name, unmangle),
                type: ExportClosureMapping.NAMED_DEFAULT_FUNCTION,
                range: defaultDeclaration.range,
                source: null,
            },
        ];
    }
    return [];
}
function NodeIsPreservedExport(node) {
    return (node.type === 'ExpressionStatement' &&
        node.expression.type === 'AssignmentExpression' &&
        node.expression.left.type === 'MemberExpression' &&
        node.expression.left.object.type === 'Identifier' &&
        node.expression.left.object.name === 'window');
}
function PreservedExportName(node) {
    const { property } = node;
    if (property.type === 'Identifier') {
        return property.name;
    }
    if (property.type === 'Literal' && typeof property.value === 'string') {
        return property.value;
    }
    return null;
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function PreserveFunction(code, source, ancestor, exportDetails, exportInline) {
    // Function Expressions can be inlined instead of preserved as variable references.
    // window['foo'] = function(){}; => export function foo(){} / function foo(){}
    const assignmentExpression = ancestor.expression;
    const memberExpression = assignmentExpression.left;
    const functionExpression = assignmentExpression.right;
    const [memberExpressionObjectStart] = memberExpression.object.range;
    const functionName = exportInline ? exportDetails.exported : exportDetails.local;
    if (functionExpression.params.length > 0) {
        const [paramsStart] = functionExpression.params[0].range;
        // FunctionExpression has parameters.
        source.overwrite(memberExpressionObjectStart, paramsStart, `${exportInline ? 'export ' : ''}function ${functionName}(`);
    }
    else {
        const [bodyStart] = functionExpression.body.range;
        source.overwrite(memberExpressionObjectStart, bodyStart, `${exportInline ? 'export ' : ''}function ${functionName}()`);
    }
    return !exportInline;
}
function PreserveIdentifier(code, source, ancestor, exportDetails, exportInline) {
    const assignmentExpression = ancestor.expression;
    const left = assignmentExpression.left;
    const right = assignmentExpression.right;
    const [ancestorStart, ancestorEnd] = ancestor.range;
    const [leftStart] = left.range;
    const [rightStart, rightEnd] = right.range;
    if (exportInline) {
        const output = (exportDetails.exported === 'default'
            ? `export default `
            : `export var ${exportDetails.exported}=`) + `${code.substring(rightStart, rightEnd)};`;
        source.overwrite(ancestorStart, ancestorEnd, output);
    }
    else if (exportDetails.source === null && 'name' in right) {
        // This is a locally defined identifier with a name we can use.
        exportDetails.local = right.name;
        source.remove(leftStart, ancestorEnd);
        return true;
    }
    else {
        source.overwrite(ancestorStart, ancestorEnd, `var ${exportDetails.local}=${code.substring(rightStart, rightEnd)};`);
    }
    return !exportInline;
}
function PreserveNamedConstant(code, source, ancestor, exportDetails, exportInline) {
    const assignmentExpression = ancestor.expression;
    switch (assignmentExpression.right.type) {
        case 'FunctionExpression':
            return PreserveFunction(code, source, ancestor, exportDetails, exportInline);
        default:
            return PreserveIdentifier(code, source, ancestor, exportDetails, exportInline);
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function PreserveDefault(code, source, ancestor, exportDetails, exportInline) {
    const assignmentExpression = ancestor.expression;
    const [leftStart] = assignmentExpression.left.range;
    const [rightStart] = assignmentExpression.right.range;
    source.overwrite(leftStart, rightStart, 'export default ');
    return false;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_UNSPECIFIED = 'Providing the warning_level=VERBOSE compile option also requires a valid language_out compile option.';
const ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_INVALID = 'Providing the warning_level=VERBOSE and language_out=NO_TRANSPILE compile options will remove warnings.';
const OPTIONS_TO_REMOVE_FOR_CLOSURE = ['remove_strict_directive'];
/**
 * Checks if output format is ESM
 * @param outputOptions
 * @return boolean
 */
const isESMFormat = ({ format }) => format === 'esm' || format === 'es';
/**
 * Throw Errors if compile options will result in unexpected behaviour.
 * @param compileOptions
 */
function validateCompileOptions(compileOptions) {
    if ('warning_level' in compileOptions && compileOptions.warning_level === 'VERBOSE') {
        if (!('language_out' in compileOptions)) {
            throw new Error(ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_UNSPECIFIED);
        }
        if (compileOptions.language_out === 'NO_TRANSPILE') {
            throw new Error(ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_INVALID);
        }
    }
}
/**
 * Normalize the compile options given by the user into something usable.
 * @param compileOptions
 */
function normalizeExternOptions(compileOptions) {
    validateCompileOptions(compileOptions);
    let externs = [];
    if ('externs' in compileOptions) {
        switch (typeof compileOptions.externs) {
            case 'boolean':
                externs = [];
                break;
            case 'string':
                externs = [compileOptions.externs];
                break;
            default:
                externs = compileOptions.externs;
                break;
        }
        delete compileOptions.externs;
    }
    if (compileOptions) {
        for (const optionToDelete of OPTIONS_TO_REMOVE_FOR_CLOSURE) {
            if (optionToDelete in compileOptions) {
                // @ts-ignore
                delete compileOptions[optionToDelete];
            }
        }
    }
    return [externs, compileOptions];
}
/**
 * Pluck the PluginOptions from the CompileOptions
 * @param compileOptions
 */
function pluckPluginOptions(compileOptions) {
    const pluginOptions = {};
    if (!compileOptions) {
        return pluginOptions;
    }
    for (const optionToDelete of OPTIONS_TO_REMOVE_FOR_CLOSURE) {
        if (optionToDelete in compileOptions) {
            // @ts-ignore
            pluginOptions[optionToDelete] = compileOptions[optionToDelete];
        }
    }
    return pluginOptions;
}
/**
 * Generate default Closure Compiler CompileOptions an author can override if they wish.
 * These must be derived from configuration or input sources.
 * @param transformers
 * @param options
 * @return derived CompileOptions for Closure Compiler
 */
const defaults = async (options, providedExterns, transformers) => {
    // Defaults for Rollup Projects are slightly different than Closure Compiler defaults.
    // - Users of Rollup tend to transpile their code before handing it to a minifier,
    // so no transpile is default.
    // - When Rollup output is set to "es|esm" it is expected the code will live in a ES Module,
    // so safely be more aggressive in minification.
    const transformerExterns = [];
    for (const transform of transformers || []) {
        const extern = transform.extern(options);
        if (extern !== null) {
            const writtenExtern = await writeTempFile(extern);
            transformerExterns.push(writtenExtern);
        }
    }
    return {
        language_out: 'NO_TRANSPILE',
        assume_function_wrapper: isESMFormat(options),
        warning_level: 'QUIET',
        module_resolution: 'NODE',
        externs: transformerExterns.concat(providedExterns),
    };
};
/**
 * Compile Options is the final configuration to pass into Closure Compiler.
 * defaultCompileOptions are overrideable by ones passed in directly to the plugin
 * but the js source and sourcemap are not overrideable, since this would break the output if passed.
 * @param compileOptions
 * @param outputOptions
 * @param code
 * @param transforms
 */
async function options (incomingCompileOptions, outputOptions, code, transforms) {
    const mapFile = await writeTempFile('', '', false);
    const [externs, compileOptions] = normalizeExternOptions({ ...incomingCompileOptions });
    const options = {
        ...(await defaults(outputOptions, externs, transforms)),
        ...compileOptions,
        js: await writeTempFile(code),
        create_source_map: mapFile,
    };
    return [options, mapFile];
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const EXTERN_OVERVIEW = `/**
* @fileoverview Externs built via derived configuration from Rollup or input code.
* @externs
*/`;
/**
 * This Transform will apply only if the Rollup configuration is for 'esm' output.
 *
 * In order to preserve the export statements:
 * 1. Create extern definitions for them (to keep them their names from being mangled).
 * 2. Insert additional JS referencing the exported names on the window scope
 * 3. After Closure Compilation is complete, replace the window scope references with the original export statements.
 */
class ExportTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'ExportTransform';
        this.originalExports = new Map();
        this.currentSourceExportCount = 0;
        /**
         * Store an export from a source into the originalExports Map.
         * @param mapping mapping of details from this declaration.
         */
        this.storeExport = (mapping) => mapping.forEach(map => {
            if (map.source === null) {
                this.currentSourceExportCount++;
                this.originalExports.set(map.local, map);
            }
            else {
                this.originalExports.set(map.exported, map);
            }
        });
    }
    static storeExportToAppend(collected, exportDetails) {
        const update = collected.get(exportDetails.source) || [];
        if (exportDetails.exported === exportDetails.local) {
            update.push(exportDetails.exported);
        }
        else {
            update.push(`${exportDetails.local} as ${exportDetails.exported}`);
        }
        collected.set(exportDetails.source, update);
        return collected;
    }
    async deriveExports(fileName, code) {
        const program = await parse(fileName, code);
        walk.simple(program, {
            ExportNamedDeclaration: (node) => {
                this.storeExport(NamedDeclaration(node, this.mangler.getName));
            },
            ExportDefaultDeclaration: (node) => {
                this.storeExport(DefaultDeclaration(node, this.mangler.getName));
            },
            ExportAllDeclaration: () => {
                // TODO(KB): This case `export * from "./import"` is not currently supported.
                this.context.error(new Error(`Rollup Plugin Closure Compiler does not support export all syntax for externals.`));
            },
        });
    }
    extern() {
        if (Array.from(this.originalExports.keys()).length > 0) {
            let output = EXTERN_OVERVIEW;
            for (const key of this.originalExports.keys()) {
                const value = this.originalExports.get(key);
                if (value.source !== null) {
                    output += `function ${value.exported}(){};\n`;
                }
            }
            return output;
        }
        return null;
    }
    /**
     * Before Closure Compiler modifies the source, we need to ensure it has window scoped
     * references to the named exports. This prevents Closure from mangling their names.
     * @param code source to parse, and modify
     * @param chunk OutputChunk from Rollup for this code.
     * @param id Rollup id reference to the source
     * @return modified input source with window scoped references.
     */
    async pre(fileName, source) {
        if (!isESMFormat(this.outputOptions)) {
            return super.pre(fileName, source);
        }
        const code = source.toString();
        await this.deriveExports(fileName, code);
        for (const key of this.originalExports.keys()) {
            const value = this.originalExports.get(key);
            // Remove export statements before Closure Compiler sees the code
            // This prevents CC from transpiling `export` statements when the language_out is set to a value
            // where exports were not part of the language.
            source.remove(...value.range);
            // Window scoped references for each key are required to ensure Closure Compilre retains the code.
            if (value.source === null) {
                source.append(`\nwindow['${value.local}'] = ${value.local};`);
            }
            else {
                source.append(`\nwindow['${value.exported}'] = ${value.exported};`);
            }
        }
        return source;
    }
    /**
     * After Closure Compiler has modified the source, we need to replace the window scoped
     * references we added with the intended export statements
     * @param code source post Closure Compiler Compilation
     * @return Promise containing the repaired source
     */
    async post(fileName, source) {
        if (!isESMFormat(this.outputOptions)) {
            return super.post(fileName, source);
        }
        const code = source.toString();
        const program = await parse(fileName, code);
        let collectedExportsToAppend = new Map();
        source.trimEnd();
        walk.ancestor(program, {
            // We inserted window scoped assignments for all the export statements during `preCompilation`
            // Now we need to find where Closure Compiler moved them, and restore the exports of their name.
            // ASTExporer Link: https://astexplorer.net/#/gist/94f185d06a4105d64828f1b8480bddc8/0fc5885ae5343f964d0cdd33c7d392a70cf5fcaf
            Identifier: (node, ancestors) => {
                if (node.name !== 'window') {
                    return;
                }
                for (const ancestor of ancestors) {
                    if (!NodeIsPreservedExport(ancestor)) {
                        continue;
                    }
                    // Can cast these since they were validated with the `NodeIsPreservedExport` test.
                    const expression = ancestor.expression;
                    const left = expression.left;
                    const exportName = PreservedExportName(left);
                    if (exportName !== null && this.originalExports.get(exportName)) {
                        const exportDetails = this.originalExports.get(exportName);
                        const exportIsLocal = exportDetails.source === null;
                        const exportInline = (exportIsLocal &&
                            this.currentSourceExportCount === 1 &&
                            exportDetails.local === exportDetails.exported) ||
                            exportDetails.exported === 'default';
                        switch (exportDetails.type) {
                            case ExportClosureMapping.NAMED_DEFAULT_FUNCTION:
                            case ExportClosureMapping.DEFAULT:
                                if (PreserveDefault(code, source, ancestor)) ;
                                break;
                            case ExportClosureMapping.NAMED_CONSTANT:
                                if (PreserveNamedConstant(code, source, ancestor, exportDetails, exportInline)) {
                                    collectedExportsToAppend = ExportTransform.storeExportToAppend(collectedExportsToAppend, exportDetails);
                                }
                                break;
                        }
                        if (!exportIsLocal) {
                            const [leftStart] = left.range;
                            const { 1: ancestorEnd } = ancestor.range;
                            source.remove(leftStart, ancestorEnd);
                        }
                        // An Export can only be processed once.
                        this.originalExports.delete(exportName);
                    }
                }
            },
        });
        for (const exportSource of collectedExportsToAppend.keys()) {
            const toAppend = collectedExportsToAppend.get(exportSource);
            if (toAppend && toAppend.length > 0) {
                const names = toAppend.join(',');
                if (exportSource === null) {
                    source.append(`export{${names}}`);
                }
                else {
                    source.prepend(`export{${names}}from'${exportSource}';`);
                }
            }
        }
        return source;
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function literalName(literal) {
    return literal.value;
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Specifiers(specifiers) {
    var _a;
    const returnable = {
        default: null,
        specific: [],
        local: [],
        namespace: false,
    };
    for (const specifier of specifiers) {
        returnable.local.push(specifier.local.name);
        switch (specifier.type) {
            case IMPORT_SPECIFIER:
                const { name: local } = specifier.local;
                const { name: imported } = ((_a = specifier) === null || _a === void 0 ? void 0 : _a.imported) || {
                    name: specifier.local,
                };
                if (local === imported) {
                    returnable.specific.push(local);
                }
                else {
                    returnable.specific.push(`${imported} as ${local}`);
                }
                break;
            case IMPORT_NAMESPACE_SPECIFIER:
                const { name: namespace } = specifier.local;
                returnable.specific.push(namespace);
                returnable.namespace = true;
                break;
            case IMPORT_DEFAULT_SPECIFIER:
                returnable.default = specifier.local.name;
                break;
        }
    }
    return returnable;
}
function FormatSpecifiers(specifiers, name) {
    const hasDefault = specifiers.default !== null;
    const hasNamespace = specifiers.namespace === true;
    const hasSpecifics = !hasNamespace && specifiers.specific.length > 0;
    const hasLocals = specifiers.local.length > 0;
    const includesFrom = hasNamespace || hasNamespace || hasSpecifics || hasLocals;
    let formatted = 'import';
    let values = [];
    if (hasDefault) {
        values.push(`${specifiers.default}`);
    }
    if (hasNamespace) {
        values.push(`* as ${specifiers.specific[0]}`);
    }
    if (hasSpecifics) {
        values.push(`{${specifiers.specific.join(',')}}`);
    }
    formatted += `${hasDefault || hasNamespace ? ' ' : ''}${values.join(',')}${hasSpecifics ? '' : ' '}${includesFrom ? 'from' : ''}'${name}';`;
    return formatted;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DYNAMIC_IMPORT_KEYWORD = 'import';
const DYNAMIC_IMPORT_REPLACEMENT = `import_${new Date().getMilliseconds()}`;
const HEADER$2 = `/**
* @fileoverview Externs built via derived configuration from Rollup or input code.
* This extern contains the external import names, to prevent compilation failures.
* @externs
*/
`;
/**
 * Locally within imports we always need a name
 * If value passed is not present in the mangler then use original name.
 * @param input
 * @param unmangle
 */
function getName$1(input, unmangle) {
    if (unmangle) {
        return unmangle(input) || input;
    }
    return input;
}
class ImportTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.importedExternalsSyntax = {};
        this.importedExternalsLocalNames = [];
        this.dynamicImportPresent = false;
        this.name = 'ImportTransform';
        /**
         * Before Closure Compiler modifies the source, we need to ensure external imports have been removed
         * since Closure will error out when it encounters them.
         * @param code source to parse, and modify
         * @return modified input source with external imports removed.
         */
        this.pre = async (fileName, source) => {
            const code = source.toString();
            let program = await parse(fileName, code);
            let dynamicImportPresent = false;
            let { mangler, importedExternalsSyntax, importedExternalsLocalNames } = this;
            await estreeWalker.asyncWalk(program, {
                enter: async function (node) {
                    if (isImportDeclaration(node)) {
                        const [importDeclarationStart, importDeclarationEnd] = node.range;
                        const originalName = literalName(node.source);
                        let specifiers = Specifiers(node.specifiers);
                        specifiers = {
                            ...specifiers,
                            default: mangler.getName(specifiers.default || '') || specifiers.default,
                            specific: specifiers.specific.map(specific => {
                                if (specific.includes(' as ')) {
                                    const split = specific.split(' as ');
                                    return `${getName$1(split[0])} as ${getName$1(split[1])}`;
                                }
                                return getName$1(specific);
                            }),
                            local: specifiers.local.map(local => getName$1(local)),
                        };
                        const unmangledName = getName$1(originalName);
                        importedExternalsSyntax[unmangledName] = FormatSpecifiers(specifiers, unmangledName);
                        importedExternalsLocalNames.push(...specifiers.local);
                        source.remove(importDeclarationStart, importDeclarationEnd);
                        this.skip();
                    }
                    if (isIdentifier(node)) {
                        const unmangled = mangler.getName(node.name);
                        if (unmangled) {
                            const [identifierStart, identifierEnd] = node.range;
                            source.overwrite(identifierStart, identifierEnd, unmangled);
                        }
                    }
                    if (isImportExpression(node)) {
                        const [dynamicImportStart, dynamicImportEnd] = node.range;
                        dynamicImportPresent = true;
                        // Rename the `import` method to something we can put in externs.
                        // CC doesn't understand dynamic import yet.
                        source.overwrite(dynamicImportStart, dynamicImportEnd, code
                            .substring(dynamicImportStart, dynamicImportEnd)
                            .replace(DYNAMIC_IMPORT_KEYWORD, DYNAMIC_IMPORT_REPLACEMENT));
                    }
                },
            });
            this.dynamicImportPresent = dynamicImportPresent;
            return source;
        };
    }
    /**
     * Generate externs for local names of external imports.
     * Otherwise, advanced mode compilation will fail since the reference is unknown.
     * @return string representing content of generated extern.
     */
    extern() {
        let extern = HEADER$2;
        if (this.importedExternalsLocalNames.length > 0) {
            for (const name of this.importedExternalsLocalNames) {
                extern += `function ${name}(){};\n`;
            }
        }
        if (this.dynamicImportPresent) {
            extern += `
/**
 * @param {string} path
 * @return {!Promise<?>}
 */
function ${DYNAMIC_IMPORT_REPLACEMENT}(path) { return Promise.resolve(path) };
window['${DYNAMIC_IMPORT_REPLACEMENT}'] = ${DYNAMIC_IMPORT_REPLACEMENT};`;
        }
        return extern === HEADER$2 ? null : extern;
    }
    /**
     * After Closure Compiler has modified the source, we need to re-add the external imports
     * @param code source post Closure Compiler Compilation
     * @return Promise containing the repaired source
     */
    async post(fileName, source) {
        const code = source.toString();
        const program = await parse(fileName, code);
        for (const importedExternalSyntax of Object.values(this.importedExternalsSyntax)) {
            source.prepend(importedExternalSyntax);
        }
        walk.simple(program, {
            Identifier(node) {
                if (node.name === DYNAMIC_IMPORT_REPLACEMENT) {
                    const [start, end] = node.range;
                    source.overwrite(start, end, DYNAMIC_IMPORT_KEYWORD);
                }
            },
        });
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Determines if Strict Mode should be removed from output.
 * @param pluginOptions
 * @param outputOptions
 * @param path
 */
function shouldRemoveStrictModeDeclarations(pluginOptions, outputOptions, path$1) {
    if ('remove_strict_directive' in pluginOptions) {
        const removeDirective = pluginOptions['remove_strict_directive'];
        return removeDirective === undefined || removeDirective === true;
    }
    const isESMOutput = !!(path$1 && path.extname(path$1) === '.mjs');
    return isESMFormat(outputOptions) || isESMOutput;
}
class StrictTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'StrictTransform';
    }
    /**
     * When outputting an es module, runtimes automatically apply strict mode conventions.
     * This means we can safely strip the 'use strict'; declaration from the top of the file.
     * @param code source following closure compiler minification
     * @return code after removing the strict mode declaration (when safe to do so)
     */
    async post(fileName, source) {
        const { file } = this.outputOptions;
        if (shouldRemoveStrictModeDeclarations(this.pluginOptions, this.outputOptions, file)) {
            const program = await parse(fileName, source.toString());
            walk.simple(program, {
                ExpressionStatement(node) {
                    const { type, value } = node.expression;
                    const range = node.range;
                    if (type === 'Literal' && value === 'use strict') {
                        source.remove(...range);
                    }
                },
            });
            return source;
        }
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ConstTransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'ConstTransform';
    }
    /**
     * When outputting ES2017+ code there is neglagible differences between `const` and `let` for runtime performance.
     * So, we replace all usages of `const` with `let` to enable more variable folding.
     * @param code source following closure compiler minification
     * @return code after removing the strict mode declaration (when safe to do so)
     */
    async pre(fileName, source) {
        const code = source.toString();
        const program = await parse(fileName, code);
        walk.simple(program, {
            VariableDeclaration(node) {
                const [start, end] = node.range;
                if (node.kind === 'const') {
                    source.overwrite(start, end, code.substring(start, end).replace('const', 'let'));
                }
            },
        });
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ASITransform extends ChunkTransform {
    constructor() {
        super(...arguments);
        this.name = 'ASITransform';
    }
    /**
     * Small reduction in semi-colons, removing from end of block statements.
     * @param source source following closure compiler minification
     */
    async post(fileName, source) {
        const code = source.toString();
        const program = await parse(fileName, code);
        if (program.body) {
            const lastStatement = program.body[program.body.length - 1];
            if (lastStatement) {
                const [start, end] = lastStatement.range;
                if (lastStatement.type === 'EmptyStatement') {
                    source.remove(start, end);
                }
                else {
                    const lastStatementSource = code.substring(start, end);
                    if (lastStatementSource.endsWith(';')) {
                        source.overwrite(start, end, code.substring(start, end - 1));
                    }
                }
            }
        }
        return source;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const TRANSFORMS = [
    HashbangRemoveTransform,
    // Acorn can parse content starting here
    ConstTransform,
    IifeTransform,
    CJSTransform,
    LiteralComputedKeys,
    StrictTransform,
    ExportTransform,
    ImportTransform,
    ASITransform,
    // Acorn cannot parse content starting here.
    HashbangApplyTransform,
];
/**
 * Instantiate transform class instances for the plugin invocation.
 * @param context Plugin context to bind for each transform instance.
 * @param requestedCompileOptions Originally requested compile options from configuration.
 * @param mangler Mangle instance used for this transform instance.
 * @param memory Ebbinghaus instance used to store information that could be lost from source.
 * @param inputOptions Rollup input options
 * @param outputOptions Rollup output options
 * @return Instantiated transform class instances for the given entry point.
 */
function create(context, requestedCompileOptions, mangler, memory, inputOptions, outputOptions) {
    const pluginOptions = pluckPluginOptions(requestedCompileOptions);
    return TRANSFORMS.map(transform => new transform(context, pluginOptions, mangler, memory, inputOptions, outputOptions));
}
/**
 * Run each transform's `preCompilation` phase.
 * @param code
 * @param chunk
 * @param transforms
 * @return source code following `preCompilation`
 */
async function preCompilation(source, chunk, transforms) {
    return await chunkLifecycle(chunk.fileName, 'PreCompilation', 'pre', source, transforms);
}
/**
 * Run each transform's `postCompilation` phase.
 * @param code
 * @param chunk
 * @param transforms
 * @return source code following `postCompilation`
 */
async function postCompilation(code, chunk, transforms) {
    return await chunkLifecycle(chunk.fileName, 'PostCompilation', 'post', code, transforms);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const { getNativeImagePath, getFirstSupportedPlatform, } = require('google-closure-compiler/lib/utils.js');
var Platform;
(function (Platform) {
    Platform["NATIVE"] = "native";
    Platform["JAVA"] = "java";
    Platform["JAVASCRIPT"] = "javascript";
})(Platform || (Platform = {}));
const DEFAULT_PLATFORM_PRECEDENCE = [Platform.NATIVE, Platform.JAVA, Platform.JAVASCRIPT];
/**
 * Splits user `platform` option from compiler options object
 * returns new object containing options and preferred platform.
 * @param {CompileOptions} content - compiler options object
 * @return {Object}
 * @example in rollup.config.js
 *  compiler({
 *    platform: 'javascript',
 *  }),
 */
function filterContent(content) {
    let platform = '';
    if ('platform' in content && typeof content.platform === 'string') {
        platform = content.platform;
        delete content.platform;
    }
    return [content, platform];
}
/**
 * Reorders platform preferences based on configuration.
 * @param {String} platformPreference - preferred platform string
 * @return {Array}
 */
function orderPlatforms(platformPreference) {
    if (platformPreference === '') {
        return DEFAULT_PLATFORM_PRECEDENCE;
    }
    const index = DEFAULT_PLATFORM_PRECEDENCE.indexOf(platformPreference);
    const newPlatformPreferences = DEFAULT_PLATFORM_PRECEDENCE.splice(index, 1);
    return newPlatformPreferences.concat(DEFAULT_PLATFORM_PRECEDENCE);
}
/**
 * Run Closure Compiler and `postCompilation` Transforms on input source.
 * @param compileOptions Closure Compiler CompileOptions, normally derived from Rollup configuration
 * @param transforms Transforms to run rollowing compilation
 * @return Promise<string> source following compilation and Transforms.
 */
function compiler (compileOptions, chunk, transforms) {
    return new Promise((resolve, reject) => {
        const [config, platform] = filterContent(compileOptions);
        const instance = new googleClosureCompiler.compiler(config);
        const firstSupportedPlatform = getFirstSupportedPlatform(orderPlatforms(platform));
        if (firstSupportedPlatform !== Platform.JAVA) {
            // TODO(KB): Provide feedback on this API. It's a little strange to nullify the JAR_PATH
            // and provide a fake java path.
            instance.JAR_PATH = null;
            instance.javaPath = getNativeImagePath();
        }
        instance.run(async (exitCode, code, stdErr) => {
            if ('warning_level' in compileOptions &&
                compileOptions.warning_level === 'VERBOSE' &&
                stdErr !== '') {
                reject(new Error(`Google Closure Compiler ${stdErr}`));
            }
            else if (exitCode !== 0) {
                reject(new Error(`Google Closure Compiler exit ${exitCode}: ${stdErr}`));
            }
            else {
                const postCompiled = await postCompilation(code, chunk, transforms);
                resolve(postCompiled.code);
            }
        });
    });
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Closure Compiler will not compile code that is prefixed with a hashbang (common to rollup output for CLIs).
 *
 * This transform will remove the hashbang (if present) and ask Ebbinghaus to remember if for after compilation.
 */
class HashbangTransform extends SourceTransform {
    constructor() {
        super(...arguments);
        this.name = 'HashbangTransform';
        this.transform = async (id, source) => {
            const stringified = source.trim().toString();
            const match = /^#!.*/.exec(stringified);
            if (!match) {
                return source;
            }
            this.memory.hashbang = match[0];
            source.remove(0, match[0].length);
            return source;
        };
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const TRANSFORMS$1 = [HashbangTransform];
// Temporarily disabling many SourceTransforms, aligning for future release.
// ImportTransform, ExportTransform
/**
 * Instantiate transform class instances for the plugin invocation.
 * @param context Plugin context to bind for each transform instance.
 * @param requestedCompileOptions Originally requested compile options from configuration.
 * @param mangler Mangle instance used for this transform instance.
 * @param memory Ebbinghaus instance used to store information that could be lost from source.
 * @param inputOptions Rollup input options
 * @param outputOptions Rollup output options
 * @return Instantiated transform class instances for the given entry point.
 */
const create$1 = (context, requestedCompileOptions, mangler, memory, inputOptions, outputOptions) => TRANSFORMS$1.map(transform => new transform(context, {}, mangler, memory, inputOptions, outputOptions));
/**
 * Run each transform's `transform` lifecycle.
 * @param code
 * @param transforms
 * @return source code following `transform`
 */
async function transform(source, id, transforms) {
    return await sourceLifecycle(id, 'Transform', source, transforms);
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function createId(source) {
    const hash = crypto.createHash('sha1');
    hash.update(source);
    return 'f_' + hash.digest('hex');
}
function mangledValue(name, sourceId) {
    return `${name}_${sourceId}`;
}
class Mangle {
    constructor() {
        this.sourceToId = new Map();
        this.idToSource = new Map();
        this.nameToMangled = new Map();
        this.mangledToName = new Map();
        this.debug = () => {
            log('mangle state', {
                sourceToId: this.sourceToId,
                idToSource: this.idToSource,
                nameToMangled: this.nameToMangled,
                mangledToName: this.mangledToName,
            });
        };
        this.sourceId = (source) => {
            let uuid = this.sourceToId.get(source);
            if (!uuid) {
                this.sourceToId.set(source, (uuid = createId(source)));
                this.idToSource.set(uuid, source);
            }
            return uuid;
        };
        this.mangle = (name, sourceId) => {
            const mangled = mangledValue(name, sourceId);
            const stored = this.nameToMangled.get(name);
            if (stored && stored !== mangled) {
                console.log('SetIdentifier for Mangled Name more than once', { name, sourceId });
            }
            else {
                this.nameToMangled.set(name, mangled);
                this.mangledToName.set(mangled, name);
            }
            return mangled;
        };
        this.getMangledName = (originalName) => {
            return this.nameToMangled.get(originalName);
        };
        this.getName = (maybeMangledName) => {
            return this.mangledToName.get(maybeMangledName);
        };
        this.getSource = (sourceId) => {
            return this.idToSource.get(sourceId);
        };
        this.execute = async (source, program) => {
            const { getMangledName } = this;
            const mangleable = [new Set([...this.nameToMangled.keys()])];
            let insideNamedExport = false;
            await estreeWalker.asyncWalk(program, {
                enter: async function (node) {
                    const currentlyRewriteable = mangleable[mangleable.length - 1];
                    if (isBlockStatement(node)) {
                        mangleable.push(new Set(currentlyRewriteable));
                    }
                    if (isExportNamedDeclaration(node)) {
                        insideNamedExport = true;
                    }
                    if (!insideNamedExport && isVariableDeclarator(node) && isIdentifier(node.id)) {
                        currentlyRewriteable.delete(node.id.name);
                    }
                    if (isIdentifier(node) && currentlyRewriteable.has(node.name)) {
                        const [start, end] = node.range;
                        source.overwrite(start, end, getMangledName(node.name) || node.name);
                    }
                },
                leave: async function (node) {
                    if (isBlockStatement(node)) {
                        mangleable.pop();
                    }
                    if (isExportNamedDeclaration(node)) {
                        insideNamedExport = false;
                    }
                },
            });
        };
    }
}

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Hermann Ebbinghaus is credited with discovering the forgetting curve.
 *
 * This class stores data the compiler would typically loose to the forgetting curve.
 * For instance:
 *  - original source contained a `hashbang`
 *  - original source used external imports
 *
 * This data can be used later to inform transforms following Closure Compiler.
 *
 * For more information, visit: https://en.wikipedia.org/wiki/Hermann_Ebbinghaus
 */
class Ebbinghaus {
    constructor() {
        this.hashbang = null;
    }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function closureCompiler(requestedCompileOptions = {}) {
    const mangler = new Mangle();
    const memory = new Ebbinghaus();
    let inputOptions;
    let context;
    let sourceTransforms;
    return {
        name: 'closure-compiler',
        options: options => (inputOptions = options),
        buildStart() {
            context = this;
            sourceTransforms = create$1(context, requestedCompileOptions, mangler, memory, inputOptions, {});
            if ('compilation_level' in requestedCompileOptions &&
                requestedCompileOptions.compilation_level === 'ADVANCED_OPTIMIZATIONS' &&
                Array.isArray(inputOptions.input)) {
                context.warn('Code Splitting with Closure Compiler ADVANCED_OPTIMIZATIONS is not currently supported.');
            }
        },
        transform: async (code, id) => {
            if (sourceTransforms.length > 0) {
                const output = await transform(code, id, sourceTransforms);
                return output || null;
            }
            return null;
        },
        renderChunk: async (code, chunk, outputOptions) => {
            mangler.debug();
            const renderChunkTransforms = create(context, requestedCompileOptions, mangler, memory, inputOptions, outputOptions);
            const preCompileOutput = (await preCompilation(code, chunk, renderChunkTransforms)).code;
            const [compileOptions, mapFile] = await options(requestedCompileOptions, outputOptions, preCompileOutput, renderChunkTransforms);
            try {
                return {
                    code: await compiler(compileOptions, chunk, renderChunkTransforms),
                    map: JSON.parse(await fs.promises.readFile(mapFile, 'utf8')),
                };
            }
            catch (error) {
                throw error;
            }
        },
    };
}

module.exports = closureCompiler;
