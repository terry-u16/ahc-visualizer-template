import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { gen, get_max_turn as getMaxTurn, vis } from '../../public/wasm/rust';
import type { VisualizerSettingInfo, VisualizerResult } from '../types';
import Description from './Description';
import FileUploader from './FileUploader';
import InputOutput from './InputOutput';
import SaveButtons from './SaveButtons';
import SvgViewer from './SvgViewer';
import TurnSlider from './TurnSlider';
import styles from './AHCLikeVisualizer.module.css';

const AHCLikeVisualizer: FC = () => {
  const [visualizerSettingInfo, setVisualizerSettingInfo] =
    useState<VisualizerSettingInfo>({
      input: '',
      output: '',
      seed: 0,
      turn: 0,
      maxTurn: 0,
      problemId: 'A',
    });

  const [visualizerResult, setVisualizerResult] = useState<VisualizerResult>({
    svgString: '',
    err: '',
    score: 0,
  });

  useEffect(() => {
    const inputText = gen(
      visualizerSettingInfo.seed,
      visualizerSettingInfo.problemId,
    );
    setVisualizerSettingInfo((prev) => ({ ...prev, input: inputText }));
  }, [visualizerSettingInfo.seed, visualizerSettingInfo.problemId]);

  useEffect(() => {
    try {
      const maxTurn = getMaxTurn(
        visualizerSettingInfo.input,
        visualizerSettingInfo.output,
      );
      setVisualizerSettingInfo((prev) => ({
        ...prev,
        maxTurn,
        turn: 0,
      }));
    } catch {
      // outputが不正な場合には計算ができない。そのときにはmaxTurnを0にする
      setVisualizerSettingInfo((prev) => ({
        ...prev,
        maxTurn: 0,
        turn: 0,
      }));
    }
  }, [
    visualizerSettingInfo.output,
    visualizerSettingInfo.input,
    setVisualizerSettingInfo,
  ]);

  useEffect(() => {
    try {
      const ret = vis(
        visualizerSettingInfo.input,
        visualizerSettingInfo.output,
        visualizerSettingInfo.turn,
      );
      setVisualizerResult({
        svgString: ret.svg,
        err: ret.err,
        score: Number(ret.score),
      });
    } catch (e) {
      let msg = '';
      if (e instanceof Error) {
        msg = e.message;
      }
      setVisualizerResult({
        svgString: 'invalid input or output',
        err: msg,
        score: 0,
      });
    }
  }, [
    visualizerSettingInfo.turn,
    visualizerSettingInfo.input,
    visualizerSettingInfo.output,
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>AHC Visualizer</h1>
        <p className={styles.subtitle}>
          入力生成・出力確認・ターン再生を1画面で操作できます。
        </p>
      </header>

      <div className={styles.layout}>
        <section className={`${styles.card} ${styles.stack}`}>
          <Description />
          <FileUploader setVisualizerSettingInfo={setVisualizerSettingInfo} />
          <InputOutput
            visualizerSettingInfo={visualizerSettingInfo}
            setVisualizerSettingInfo={setVisualizerSettingInfo}
          />
          <SaveButtons visualizerSettingInfo={visualizerSettingInfo} />
          <TurnSlider
            visualizerSettingInfo={visualizerSettingInfo}
            setVisualizerSettingInfo={setVisualizerSettingInfo}
          />
        </section>

        <section className={styles.card}>
          <SvgViewer
            svgString={visualizerResult.svgString}
            err={visualizerResult.err}
            score={visualizerResult.score}
          />
        </section>
      </div>
    </main>
  );
};

export default AHCLikeVisualizer;
