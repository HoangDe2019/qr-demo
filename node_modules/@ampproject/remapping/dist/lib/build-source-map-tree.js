"use strict";
/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decode_source_map_1 = __importDefault(require("./decode-source-map"));
const original_source_1 = __importDefault(require("./original-source"));
const resolve_1 = __importDefault(require("./resolve"));
const source_map_tree_1 = __importDefault(require("./source-map-tree"));
const strip_filename_1 = __importDefault(require("./strip-filename"));
function asArray(value) {
    if (Array.isArray(value))
        return value;
    return [value];
}
/**
 * Recursively builds a tree structure out of sourcemap files, with each node
 * being either an `OriginalSource` "leaf" or a `SourceMapTree` composed of
 * `OriginalSource`s and `SourceMapTree`s.
 *
 * Every sourcemap is composed of a collection of source files and mappings
 * into locations of those source files. When we generate a `SourceMapTree` for
 * the sourcemap, we attempt to load each source file's own sourcemap. If it
 * does not have an associated sourcemap, it is considered an original,
 * unmodified source file.
 */
function buildSourceMapTree(input, loader, relativeRoot) {
    const maps = asArray(input).map(decode_source_map_1.default);
    const map = maps.pop();
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].sources.length !== 1) {
            throw new Error(`Transformation map ${i} must have exactly one source file.\n` +
                'Did you specify these with the most recent transformation maps first?');
        }
    }
    const { sourceRoot, sources, sourcesContent } = map;
    const children = sources.map((sourceFile, i) => {
        // Each source file is loaded relative to the sourcemap's own sourceRoot,
        // which is itself relative to the sourcemap's parent.
        const uri = resolve_1.default(sourceFile || '', resolve_1.default(sourceRoot || '', strip_filename_1.default(relativeRoot)));
        // Use the provided loader callback to retrieve the file's sourcemap.
        // TODO: We should eventually support async loading of sourcemap files.
        const sourceMap = loader(uri);
        // If there is no sourcemap, then it is an unmodified source file.
        if (!sourceMap) {
            // The source file's actual contents must be included in the sourcemap
            // (done when generating the sourcemap) for it to be included as a
            // sourceContent in the output sourcemap.
            const sourceContent = sourcesContent ? sourcesContent[i] : null;
            return new original_source_1.default(uri, sourceContent);
        }
        // Else, it's a real sourcemap, and we need to recurse into it to load its
        // source files.
        return buildSourceMapTree(decode_source_map_1.default(sourceMap), loader, uri);
    });
    let tree = new source_map_tree_1.default(map, children);
    for (let i = maps.length - 1; i >= 0; i--) {
        tree = new source_map_tree_1.default(maps[i], [tree]);
    }
    return tree;
}
exports.default = buildSourceMapTree;
//# sourceMappingURL=build-source-map-tree.js.map