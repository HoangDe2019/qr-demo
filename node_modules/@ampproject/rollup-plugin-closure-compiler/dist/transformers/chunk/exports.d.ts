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
import MagicString from 'magic-string';
import { ChunkTransform } from '../../transform';
import { TransformInterface } from '../../types';
/**
 * This Transform will apply only if the Rollup configuration is for 'esm' output.
 *
 * In order to preserve the export statements:
 * 1. Create extern definitions for them (to keep them their names from being mangled).
 * 2. Insert additional JS referencing the exported names on the window scope
 * 3. After Closure Compilation is complete, replace the window scope references with the original export statements.
 */
export default class ExportTransform extends ChunkTransform implements TransformInterface {
    name: string;
    private originalExports;
    private currentSourceExportCount;
    /**
     * Store an export from a source into the originalExports Map.
     * @param mapping mapping of details from this declaration.
     */
    private storeExport;
    private static storeExportToAppend;
    private deriveExports;
    extern(): string | null;
    /**
     * Before Closure Compiler modifies the source, we need to ensure it has window scoped
     * references to the named exports. This prevents Closure from mangling their names.
     * @param code source to parse, and modify
     * @param chunk OutputChunk from Rollup for this code.
     * @param id Rollup id reference to the source
     * @return modified input source with window scoped references.
     */
    pre(fileName: string, source: MagicString): Promise<MagicString>;
    /**
     * After Closure Compiler has modified the source, we need to replace the window scoped
     * references we added with the intended export statements
     * @param code source post Closure Compiler Compilation
     * @return Promise containing the repaired source
     */
    post(fileName: string, source: MagicString): Promise<MagicString>;
}
