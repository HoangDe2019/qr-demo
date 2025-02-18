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
export declare const IMPORT_DECLARATION = "ImportDeclaration";
export declare const IMPORT_SPECIFIER = "ImportSpecifier";
export declare const IMPORT_DEFAULT_SPECIFIER = "ImportDefaultSpecifier";
export declare const IMPORT_NAMESPACE_SPECIFIER = "ImportNamespaceSpecifier";
export declare const EXPORT_NAMED_DECLARATION = "ExportNamedDeclaration";
export declare const EXPORT_SPECIFIER = "ExportSpecifier";
export declare const EXPORT_DEFAULT_DECLARATION = "ExportDefaultDeclaration";
export declare const EXPORT_ALL_DECLARATION = "ExportAllDeclaration";
export declare const ALL_EXPORT_DECLARATIONS: string[];
export declare type Range = [number, number];
export declare type CollectedExports = Map<string | null, Array<string>>;
export declare enum ExportClosureMapping {
    NAMED_FUNCTION = 0,
    NAMED_CLASS = 1,
    NAMED_DEFAULT_FUNCTION = 2,
    DEFAULT_FUNCTION = 3,
    NAMED_DEFAULT_CLASS = 4,
    DEFAULT_CLASS = 5,
    NAMED_CONSTANT = 6,
    DEFAULT = 7,
    DEFAULT_VALUE = 8,
    DEFAULT_OBJECT = 9
}
export interface ExportDetails {
    local: string;
    exported: string;
    type: ExportClosureMapping;
    range: Range;
    source: string | null;
}
export declare type TransformMethod = (code: string) => Promise<MagicString>;
export interface TransformInterface {
    name: string;
}
export interface PluginOptions {
    [key: string]: string | boolean;
}
