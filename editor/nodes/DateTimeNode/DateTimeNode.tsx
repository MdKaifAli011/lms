/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';

import type {
  DOMConversionOutput,
  DOMExportOutput,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import {DecoratorNode} from 'lexical';
import * as React from 'react';

const DateTimeComponent = React.lazy(() => import('./DateTimeComponent'));

const getDateTimeText = (dateTime: Date) => {
  if (dateTime === undefined) {
    return '';
  }
  const hours = dateTime?.getHours();
  const minutes = dateTime?.getMinutes();
  return (
    dateTime.toDateString() +
    (hours === 0 && minutes === 0
      ? ''
      : ` ${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`)
  );
};

export type SerializedDateTimeNode = SerializedLexicalNode & {
  dateTime?: string;
};

function $convertDateTimeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dateTimeValue = domNode.getAttribute('data-lexical-datetime');
  if (dateTimeValue) {
    const node = $createDateTimeNode(new Date(Date.parse(dateTimeValue)));
    return {node};
  }
  const gDocsDateTimePayload = domNode.getAttribute('data-rich-links');
  if (!gDocsDateTimePayload) {
    return null;
  }
  try {
    const parsed = JSON.parse(gDocsDateTimePayload);
    const parsedDate =
      parsed?.dat_df?.dfie_ts?.tv?.tv_s * 1000 ||
      Date.parse(parsed?.dat_df?.dfie_dt || '');
    if (isNaN(parsedDate)) {
      return null;
    }
    return {node: $createDateTimeNode(new Date(parsedDate))};
  } catch {
    return null;
  }
}

export class DateTimeNode extends DecoratorNode<JSX.Element> {
  __dateTime: Date;

  static getType(): string {
    return 'datetime';
  }

  static clone(node: DateTimeNode): DateTimeNode {
    return new DateTimeNode(node.__dateTime, node.__key);
  }

  constructor(dateTime: Date, key?: NodeKey) {
    super(key);
    this.__dateTime = dateTime;
  }

  getDateTime(): Date {
    return this.__dateTime;
  }

  setDateTime(dateTime: Date): this {
    const self = this.getWritable();
    self.__dateTime = dateTime;
    return self;
  }

  getTextContent(): string {
    return getDateTimeText(this.__dateTime);
  }

  static importJSON(serializedNode: SerializedDateTimeNode): DateTimeNode {
    const dateTime = serializedNode.dateTime
      ? new Date(serializedNode.dateTime)
      : new Date();
    return new DateTimeNode(dateTime);
  }

  exportJSON(): SerializedDateTimeNode {
    return {
      ...super.exportJSON(),
      dateTime: this.__dateTime?.toISOString(),
      type: 'datetime',
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) =>
        domNode.getAttribute('data-lexical-datetime') !== null ||
        (domNode.getAttribute('data-rich-links') !== null &&
          (() => {
            try {
              return JSON.parse(domNode.getAttribute('data-rich-links') || '{}').type === 'date';
            } catch {
              return false;
            }
          })())
          ? {conversion: $convertDateTimeElement, priority: 2}
          : null,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute(
      'data-lexical-datetime',
      this.__dateTime?.toISOString() || '',
    );
    element.appendChild(
      document.createTextNode(getDateTimeText(this.__dateTime)),
    );
    return {element};
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute(
      'data-lexical-datetime',
      this.__dateTime?.toISOString() || '',
    );
    element.style.display = 'inline-block';
    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <DateTimeComponent
        dateTime={this.__dateTime}
        format={0}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createDateTimeNode(dateTime: Date): DateTimeNode {
  return new DateTimeNode(dateTime);
}

export function $isDateTimeNode(
  node: LexicalNode | null | undefined,
): node is DateTimeNode {
  return node instanceof DateTimeNode;
}
