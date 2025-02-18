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
import { Program } from 'estree';
import MagicString from 'magic-string';
export declare class Mangle {
    private sourceToId;
    private idToSource;
    private nameToMangled;
    private mangledToName;
    debug: () => void;
    sourceId: (source: string) => string;
    mangle: (name: string, sourceId: string) => string;
    getMangledName: (originalName: string) => string | undefined;
    getName: (maybeMangledName: string) => string | undefined;
    getSource: (sourceId: string) => string | undefined;
    execute: (source: MagicString, program: Program) => Promise<void>;
}
