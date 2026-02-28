import type { FC } from 'react';
import { useState } from 'react';
import { type VisualizerSettingInfo } from '../../types';
import { useDownloadInput } from './hooks.ts';

import styles from './index.module.css';

type InputOutputProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
  setVisualizerSettingInfo: React.Dispatch<
    React.SetStateAction<VisualizerSettingInfo>
  >;
};

const InputOutput: FC<InputOutputProps> = ({
  visualizerSettingInfo,
  setVisualizerSettingInfo,
}) => {
  const [downloadCases, setDownloadCases] = useState(100);
  const [buttonText, setButtonText] = useState('Download');
  const { downloadInput } = useDownloadInput();

  const onChangeSeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      seed: Number(e.target.value),
    }));
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      input: e.target.value,
    }));
  };

  const onChangeOutput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      output: e.target.value,
    }));
  };

  const onChangeProblemId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      problemId: e.target.value,
    }));
  };

  const onDropFileIntoInput = async (
    e: React.DragEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const text = await e.dataTransfer.items[0].getAsFile()?.text();
    if (text !== undefined) {
      setVisualizerSettingInfo((prev) => ({
        ...prev,
        input: text,
      }));
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <label className={styles.labelInline}>
          Seed:
          <input
            className={styles.numberInput}
            type="number"
            value={visualizerSettingInfo.seed}
            min={'0'}
            max={'18446744073709551615'}
            onChange={onChangeSeed}
          />
        </label>

        <label className={styles.labelInline}>
          #cases:
          <input
            className={styles.caseInput}
            type="number"
            value={downloadCases}
            onChange={(e) => {
              setDownloadCases(Number(e.target.value));
            }}
            min="1"
            max="10000"
          />
        </label>

        <input
          type="button"
          value={buttonText}
          disabled={buttonText !== 'Download'}
          onClick={() => {
            downloadInput(
              visualizerSettingInfo.seed,
              visualizerSettingInfo.problemId,
              downloadCases,
              setButtonText,
            );
          }}
        />

        <label className={styles.labelInline}>
          問題番号:
          <select
            className={styles.problemSelect}
            value={visualizerSettingInfo.problemId}
            onChange={onChangeProblemId}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </label>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Input</span>
        <textarea
          className={styles.textArea}
          rows={3}
          value={visualizerSettingInfo.input}
          onChange={onChangeInput}
          onDrop={onDropFileIntoInput}
        ></textarea>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Output</span>
        <textarea
          className={styles.textArea}
          rows={3}
          value={visualizerSettingInfo.output}
          onChange={onChangeOutput}
        ></textarea>
      </div>
    </div>
  );
};

export default InputOutput;
