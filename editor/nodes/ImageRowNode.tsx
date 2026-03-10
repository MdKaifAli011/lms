/**
 * ImageRowNode: A responsive one-row grid container for 2 or 3 images.
 * Used by "One row 2 col" / "One row 3 col" in Insert Image dialog.
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

import { addClassNamesToElement } from '@lexical/utils';
import { ElementNode } from 'lexical';
import { $isImageNode } from './ImageNode';

export type ImageRowColumnCount = 2 | 3;

export type SerializedImageRowNode = Spread<
  {
    columnCount: ImageRowColumnCount;
  },
  SerializedElementNode
>;

const IMAGE_ROW_DATA_ATTR = 'data-lexical-image-row';

function $convertImageRowElement(domNode: HTMLElement): DOMConversionOutput | null {
  const cols = domNode.getAttribute('data-cols');
  const count = cols === '3' ? 3 : 2;
  const rowNode = $createImageRowNode(count);
  return {
    node: rowNode,
    after: (childLexicalNodes: Array<LexicalNode>) => {
      const imageNodes = childLexicalNodes.filter((n) => $isImageNode(n));
      for (const imgNode of imageNodes) {
        rowNode.append(imgNode);
      }
      return [];
    },
  };
}

export class ImageRowNode extends ElementNode {
  __columnCount: ImageRowColumnCount;

  constructor(columnCount: ImageRowColumnCount, key?: NodeKey) {
    super(key);
    this.__columnCount = columnCount;
  }

  static getType(): string {
    return 'image-row';
  }

  static clone(node: ImageRowNode): ImageRowNode {
    return new ImageRowNode(node.__columnCount, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute(IMAGE_ROW_DATA_ATTR, String(this.__columnCount));
    dom.setAttribute('data-cols', String(this.__columnCount));
    const theme = config.theme as { imageRow?: string; imageRow2Col?: string; imageRow3Col?: string };
    const baseClass = theme.imageRow ?? 'lexical-image-row';
    const colClass =
      this.__columnCount === 3
        ? (theme.imageRow3Col ?? 'lexical-image-row-3col')
        : (theme.imageRow2Col ?? 'lexical-image-row-2col');
    addClassNamesToElement(dom, baseClass, colClass);
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute(IMAGE_ROW_DATA_ATTR, String(this.__columnCount));
    element.setAttribute('data-cols', String(this.__columnCount));
    element.className =
      this.__columnCount === 3
        ? 'lexical-image-row lexical-image-row-3col'
        : 'lexical-image-row lexical-image-row-2col';
    return { element };
  }

  updateDOM(prevNode: ImageRowNode): boolean {
    if (prevNode.__columnCount !== this.__columnCount) {
      return true; // replace
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute(IMAGE_ROW_DATA_ATTR)) {
          return null;
        }
        return {
          conversion: $convertImageRowElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedImageRowNode): ImageRowNode {
    return $createImageRowNode(json.columnCount).updateFromJSON(json);
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageRowNode>): this {
    return super.updateFromJSON(serializedNode).setColumnCount(serializedNode.columnCount ?? 2);
  }

  isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  exportJSON(): SerializedImageRowNode {
    return {
      ...super.exportJSON(),
      columnCount: this.__columnCount,
    };
  }

  getColumnCount(): ImageRowColumnCount {
    return this.getLatest().__columnCount;
  }

  setColumnCount(columnCount: ImageRowColumnCount): this {
    const self = this.getWritable();
    self.__columnCount = columnCount;
    return self;
  }
}

export function $createImageRowNode(columnCount: ImageRowColumnCount, key?: NodeKey): ImageRowNode {
  return new ImageRowNode(columnCount, key);
}

export function $isImageRowNode(node: LexicalNode | null | undefined): node is ImageRowNode {
  return node instanceof ImageRowNode;
}
