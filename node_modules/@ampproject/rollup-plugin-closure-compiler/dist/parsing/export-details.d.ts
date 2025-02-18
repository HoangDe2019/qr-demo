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
import { ExportNamedDeclaration, ExportDefaultDeclaration, Node, ExpressionStatement, MemberExpression } from 'estree';
import { ExportDetails } from '../types';
import { Mangle } from '../transformers/mangle';
export declare function NamedDeclaration(node: ExportNamedDeclaration, unmangle?: Mangle['getName']): Array<ExportDetails>;
export declare function DefaultDeclaration(defaultDeclaration: ExportDefaultDeclaration, unmangle?: Mangle['getName']): Array<ExportDetails>;
export declare function NodeIsPreservedExport(node: Node): node is ExpressionStatement;
export declare function PreservedExportName(node: MemberExpression): string | null;
