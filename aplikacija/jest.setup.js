import { createCanvas } from 'canvas';
import '@testing-library/jest-dom';

Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: function () {
    return createCanvas().getContext('2d');
  },
});
