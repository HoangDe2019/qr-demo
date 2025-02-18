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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A "leaf" node in the sourcemap tree, representing an original, unmodified
 * source file. Recursive segment tracing ends at the `OriginalSource`.
 */
class OriginalSource {
    constructor(filename, content) {
        this.filename = filename;
        this.content = content;
    }
    /**
     * Tracing a `SourceMapSegment` ends when we get to an `OriginalSource`,
     * meaning this line/column location originated from this source file.
     */
    traceSegment(line, column, name) {
        return { column, line, name, source: this };
    }
}
exports.default = OriginalSource;
//# sourceMappingURL=original-source.js.map