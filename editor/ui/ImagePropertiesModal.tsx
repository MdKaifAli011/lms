/**
 * Modal to edit image properties: alt text, width, and height.
 * Opened on double-click of an image in the editor.
 */

import type { JSX } from 'react';

import * as React from 'react';
import { useCallback, useState } from 'react';

import Button from './Button';
import Modal from './Modal';
import TextInput from './TextInput';

export type ImageProperties = {
  altText: string;
  width: 'inherit' | number;
  height: 'inherit' | number;
};

export default function ImagePropertiesModal({
  onClose,
  onSave,
  initialAltText,
  initialWidth,
  initialHeight,
}: {
  onClose: () => void;
  onSave: (props: ImageProperties) => void;
  initialAltText: string;
  initialWidth: 'inherit' | number;
  initialHeight: 'inherit' | number;
}): JSX.Element {
  const [altText, setAltText] = useState(initialAltText);
  const [widthInput, setWidthInput] = useState(
    initialWidth === 'inherit' ? '' : String(initialWidth),
  );
  const [heightInput, setHeightInput] = useState(
    initialHeight === 'inherit' ? '' : String(initialHeight),
  );

  const width: 'inherit' | number =
    widthInput.trim() === '' ? 'inherit' : Math.max(1, parseInt(widthInput, 10) || 1);
  const height: 'inherit' | number =
    heightInput.trim() === '' ? 'inherit' : Math.max(1, parseInt(heightInput, 10) || 1);

  const handleSave = useCallback(() => {
    onSave({ altText: altText.trim() || 'Image', width, height });
    onClose();
  }, [altText, width, height, onSave, onClose]);

  return (
    <Modal title="Image properties" onClose={onClose} closeOnClickOutside>
      <div className="ImagePropertiesModal__content">
        <TextInput
          label="Alt text"
          placeholder="Describe the image for accessibility"
          value={altText}
          onChange={setAltText}
          data-test-id="image-properties-alt"
        />
        <div className="Input__wrapper">
          <label className="Input__label">Width (px)</label>
          <input
            type="number"
            className="Input__input"
            placeholder="Auto"
            min={1}
            value={widthInput}
            onChange={(e) => setWidthInput(e.target.value)}
            data-test-id="image-properties-width"
          />
        </div>
        <div className="Input__wrapper">
          <label className="Input__label">Height (px)</label>
          <input
            type="number"
            className="Input__input"
            placeholder="Auto"
            min={1}
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            data-test-id="image-properties-height"
          />
        </div>
        <p className="ImagePropertiesModal__hint">
          Leave width or height empty for automatic sizing.
        </p>
        <div className="DialogActions">
          <Button onClick={onClose} data-test-id="image-properties-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} data-test-id="image-properties-save">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
