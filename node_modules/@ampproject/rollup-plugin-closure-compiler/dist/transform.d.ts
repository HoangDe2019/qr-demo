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
import { TransformInterface, PluginOptions } from './types';
import { PluginContext, InputOptions, OutputOptions, SourceDescription } from 'rollup';
import { Mangle } from './transformers/mangle';
import { Ebbinghaus } from './transformers/ebbinghaus';
import MagicString from 'magic-string';
declare class Transform implements TransformInterface {
    protected context: PluginContext;
    protected pluginOptions: PluginOptions;
    protected mangler: Mangle;
    protected memory: Ebbinghaus;
    protected inputOptions: InputOptions;
    protected outputOptions: OutputOptions;
    name: string;
    constructor(context: PluginContext, pluginOptions: PluginOptions, mangler: Mangle, memory: Ebbinghaus, inputOptions: InputOptions, outputOptions: OutputOptions);
}
export declare class SourceTransform extends Transform {
    name: string;
    transform(id: string, source: MagicString): Promise<MagicString>;
}
export declare class ChunkTransform extends Transform {
    name: string;
    extern(options: OutputOptions): string | null;
    pre(fileName: string, source: MagicString): Promise<MagicString>;
    post(fileName: string, source: MagicString): Promise<MagicString>;
}
export declare function chunkLifecycle(fileName: string, printableName: string, method: 'pre' | 'post', code: string, transforms: Array<ChunkTransform>): Promise<SourceDescription>;
export declare function sourceLifecycle(id: string, printableName: string, code: string, transforms: Array<SourceTransform>): Promise<SourceDescription>;
export {};
