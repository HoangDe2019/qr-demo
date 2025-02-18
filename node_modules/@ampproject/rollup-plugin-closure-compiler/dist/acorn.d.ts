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
import { Program, BaseNode, Identifier, ImportDeclaration, VariableDeclarator, BlockStatement, ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration, FunctionDeclaration, VariableDeclaration, ClassDeclaration, ExportSpecifier, Property } from 'estree';
export declare const walk: {
    simple: any;
    ancestor: any;
};
export declare function parse(fileName: string, source: string): Promise<Program>;
export declare function isIdentifier(node: BaseNode): node is Identifier;
export declare function isImportDeclaration(node: BaseNode): node is ImportDeclaration;
export declare function isImportExpression(node: BaseNode): boolean;
export declare function isVariableDeclarator(node: BaseNode): node is VariableDeclarator;
export declare function isBlockStatement(node: BaseNode): node is BlockStatement;
export declare function isProgram(node: BaseNode): node is Program;
export declare function isExportNamedDeclaration(node: BaseNode): node is ExportNamedDeclaration;
export declare function isExportDefaultDeclaration(node: BaseNode): node is ExportDefaultDeclaration;
export declare function isExportAllDeclaration(node: BaseNode): node is ExportAllDeclaration;
export declare function isFunctionDeclaration(node: BaseNode): node is FunctionDeclaration;
export declare function isVariableDeclaration(node: BaseNode): node is VariableDeclaration;
export declare function isClassDeclaration(node: BaseNode): node is ClassDeclaration;
export declare function isExportSpecifier(node: BaseNode): node is ExportSpecifier;
export declare function isProperty(node: BaseNode): node is Property;
