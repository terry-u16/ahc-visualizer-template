import type { FC } from 'react';
import { useState, useCallback } from 'react';
import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker?url';
import { vis } from '../../../public/wasm/rust';
import type { VisualizerSettingInfo } from '../../types';
import styles from './index.module.css';

type SvgViewerProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
};

const parseSvgSize = (svgData: string): { width: number; height: number } => {
  const doc = new DOMParser().parseFromString(svgData, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (svg === null) {
    return { width: 800, height: 800 };
  }

  const widthAttr = Number.parseFloat(svg.getAttribute('width') ?? '');
  const heightAttr = Number.parseFloat(svg.getAttribute('height') ?? '');
  if (
    Number.isFinite(widthAttr) &&
    Number.isFinite(heightAttr) &&
    widthAttr > 0 &&
    heightAttr > 0
  ) {
    return { width: widthAttr, height: heightAttr };
  }

  const viewBox = svg.getAttribute('viewBox');
  if (viewBox !== null) {
    const values = viewBox
      .trim()
      .split(/\s+/)
      .map((v) => Number.parseFloat(v));
    if (
      values.length === 4 &&
      values.every((v) => Number.isFinite(v)) &&
      values[2] > 0 &&
      values[3] > 0
    ) {
      return { width: values[2], height: values[3] };
    }
  }

  return { width: 800, height: 800 };
};

const renderSvgToCanvas = async (
  svgData: string,
): Promise<HTMLCanvasElement> => {
  const { width, height } = parseSvgSize(svgData);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Canvas context is unavailable');
  }

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      reject(new Error('Failed to load SVG image'));
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  });

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
};

const SvgViewer: FC<SvgViewerProps> = ({ visualizerSettingInfo }) => {
  const [animationButtonDescription, setAnimationButtonDescription] = useState(
    'Save as Animation GIF',
  );

  const [animationButtonDisabled, setAnimationButtonDisabled] = useState(false);

  const onSavePng = useCallback(() => {
    const savePng = async () => {
      const ret = vis(
        visualizerSettingInfo.input,
        visualizerSettingInfo.output,
        visualizerSettingInfo.turn,
      );
      const canvas = await renderSvgToCanvas(ret.svg);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'vis.png';
      a.click();
    };

    savePng().catch((e: unknown) => {
      console.error(e);
    });
  }, [
    visualizerSettingInfo.input,
    visualizerSettingInfo.output,
    visualizerSettingInfo.turn,
  ]);

  const onSaveGif = useCallback(() => {
    if (visualizerSettingInfo.maxTurn < 0) {
      return;
    }

    setAnimationButtonDisabled(true);
    const input = visualizerSettingInfo.input;
    const output = visualizerSettingInfo.output;
    const maxTurn = visualizerSettingInfo.maxTurn;
    const step = 1;
    const delay = (step * 2000) / 60;
    const gif = new GIF({
      workers: 2,
      quality: 100,
      workerScript: gifWorkerUrl,
    });
    gif.on('progress', function (p) {
      setAnimationButtonDescription(
        String(Math.round(50 + 50 * p)).padStart(3, ' ') + '% finished',
      );
    });
    gif.on('finished', function (blob: Blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vis.gif';
      a.click();
      window.URL.revokeObjectURL(a.href);

      setAnimationButtonDescription('Save as Animation GIF');
      setAnimationButtonDisabled(false);
    });

    const addFrames = async () => {
      const safeMaxTurn = Math.max(0, maxTurn);
      for (let t = 0; t <= safeMaxTurn; t += step) {
        const currentTurn = Math.min(t, safeMaxTurn);
        const progressRatio =
          safeMaxTurn === 0 ? 1 : (50.0 * currentTurn) / safeMaxTurn;
        setAnimationButtonDescription(
          String(Math.round(progressRatio)).padStart(3, ' ') + '% finished',
        );
        const svgData = vis(input, output, currentTurn).svg;
        const canvas = await renderSvgToCanvas(svgData);
        gif.addFrame(canvas, {
          delay: currentTurn === safeMaxTurn ? 3000 : delay,
        });
      }
      gif.render();
    };

    addFrames().catch((e: unknown) => {
      console.error(e);
      setAnimationButtonDescription('Save as Animation GIF');
      setAnimationButtonDisabled(false);
    });
  }, [
    visualizerSettingInfo.input,
    visualizerSettingInfo.output,
    visualizerSettingInfo.maxTurn,
    setAnimationButtonDescription,
    setAnimationButtonDisabled,
  ]);

  return (
    <div className={styles.actions}>
      <input
        type="button"
        id="save_png"
        value="Save as PNG"
        onClick={onSavePng}
      />
      <input
        type="button"
        id="save_gif"
        value={animationButtonDescription}
        onClick={onSaveGif}
        disabled={animationButtonDisabled}
      />
    </div>
  );
};

export default SvgViewer;
