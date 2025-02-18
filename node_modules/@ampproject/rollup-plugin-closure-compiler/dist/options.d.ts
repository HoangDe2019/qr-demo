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
import { ChunkTransform } from './transform';
import { OutputOptions } from 'rollup';
import { CompileOptions } from 'google-closure-compiler';
import { PluginOptions } from './types';
export declare const ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_UNSPECIFIED = "Providing the warning_level=VERBOSE compile option also requires a valid language_out compile option.";
export declare const ERROR_WARNINGS_ENABLED_LANGUAGE_OUT_INVALID = "Providing the warning_level=VERBOSE and language_out=NO_TRANSPILE compile options will remove warnings.";
/**
 * Checks if output format is ESM
 * @param outputOptions
 * @return boolean
 */
export declare const isESMFormat: ({ format }: OutputOptions) => boolean;
/**
 * Pluck the PluginOptions from the CompileOptions
 * @param compileOptions
 */
export declare function pluckPluginOptions(compileOptions: CompileOptions): PluginOptions;
/**
 * Generate default Closure Compiler CompileOptions an author can override if they wish.
 * These must be derived from configuration or input sources.
 * @param transformers
 * @param options
 * @return derived CompileOptions for Closure Compiler
 */
export declare const defaults: (options: OutputOptions, providedExterns: Array<string>, transformers: Array<ChunkTransform> | null) => Promise<CompileOptions>;
/**
 * Compile Options is the final configuration to pass into Closure Compiler.
 * defaultCompileOptions are overrideable by ones passed in directly to the plugin
 * but the js source and sourcemap are not overrideable, since this would break the output if passed.
 * @param compileOptions
 * @param outputOptions
 * @param code
 * @param transforms
 */
export default function (incomingCompileOptions: CompileOptions, outputOptions: OutputOptions, code: string, transforms: Array<ChunkTransform> | null): Promise<[CompileOptions, string]>;
