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
const sourcemap_codec_1 = require("sourcemap-codec");
const defaults_1 = __importDefault(require("./defaults"));
/**
 * Decodes an input sourcemap into a `DecodedSourceMap` sourcemap object.
 *
 * Valid input maps include a `DecodedSourceMap`, a `RawSourceMap`, or JSON
 * representations of either type.
 */
function decodeSourceMap(map) {
    if (typeof map === 'string') {
        map = JSON.parse(map);
    }
    let { mappings } = map;
    if (typeof mappings === 'string') {
        mappings = sourcemap_codec_1.decode(mappings);
    }
    else {
        // Clone the Line so that we can sort it. We don't want to mutate an array
        // that we don't own directly.
        mappings = mappings.map(cloneSegmentLine);
    }
    // Sort each Line's segments. There's no guarantee that segments are sorted for us,
    // and even Chrome's implementation sorts:
    // https://cs.chromium.org/chromium/src/third_party/devtools-frontend/src/front_end/sdk/SourceMap.js?l=507-508&rcl=109232bcf479c8f4ef8ead3cf56c49eb25f8c2f0
    mappings.forEach(sortSegments);
    return defaults_1.default({ mappings }, map);
}
exports.default = decodeSourceMap;
function cloneSegmentLine(segments) {
    return segments.slice();
}
function sortSegments(segments) {
    segments.sort(segmentComparator);
}
function segmentComparator(a, b) {
    return a[0] - b[0];
}
//# sourceMappingURL=decode-source-map.js.map