import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { type VisualizerSettingInfo } from '../../types';
import styles from './index.module.css';

type TurnSliderProps = {
  visualizerSettingInfo: VisualizerSettingInfo;
  setVisualizerSettingInfo: React.Dispatch<
    React.SetStateAction<VisualizerSettingInfo>
  >;
};

const TurnSlider: FC<TurnSliderProps> = ({
  visualizerSettingInfo,
  setVisualizerSettingInfo,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderSpeed, setSliderSpeed] = useState(30);
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  const onChangeSliderSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderSpeed(Number(e.target.value));
  };

  const onChangeTurn = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      turn: Number(e.target.value),
    }));
  };

  const stopSlider = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
  }, [intervalId]);

  const incrementTurn = useCallback(() => {
    setVisualizerSettingInfo((prev) => ({
      ...prev,
      turn: prev.turn + 1,
    }));
  }, [setVisualizerSettingInfo]);

  const startSlider = useCallback(() => {
    if (visualizerSettingInfo.maxTurn <= 0) {
      return;
    }
    setIsPlaying(true);
    const tickMilliseconds =
      (1000 * 300) / visualizerSettingInfo.maxTurn / sliderSpeed;
    const id = setInterval(incrementTurn, tickMilliseconds);
    setIntervalId(id);
  }, [
    setIntervalId,
    setIsPlaying,
    visualizerSettingInfo.maxTurn,
    sliderSpeed,
    incrementTurn,
  ]);

  // turnがmaxTurnになったらタイマーを止める
  useEffect(() => {
    if (visualizerSettingInfo.turn === visualizerSettingInfo.maxTurn) {
      stopSlider();
    }
  }, [stopSlider, visualizerSettingInfo.turn, visualizerSettingInfo.maxTurn]);

  const onClickSliderButton = () => {
    if (!isPlaying) {
      if (
        visualizerSettingInfo.maxTurn > 0 &&
        visualizerSettingInfo.turn === visualizerSettingInfo.maxTurn
      ) {
        setVisualizerSettingInfo((prev) => ({
          ...prev,
          turn: 0,
        }));
      }
      startSlider();
    } else {
      stopSlider();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controlRow}>
        <button
          type="button"
          className={styles.sliderButton}
          aria-label={isPlaying ? 'Stop playback' : 'Start playback'}
          onClick={onClickSliderButton}
        >
          <span
            className={isPlaying ? styles.stopIcon : styles.playIcon}
            aria-hidden="true"
          />
        </button>

        <label className={styles.speedGroup}>
          slow
          <input
            type="range"
            min="1"
            max="60"
            value={sliderSpeed}
            className={styles.speedSlider}
            onChange={onChangeSliderSpeed}
          />
          fast
        </label>

        <label className={styles.turnGroup}>
          turn:
          <input
            type="number"
            value={visualizerSettingInfo.turn}
            min="0"
            max={visualizerSettingInfo.maxTurn}
            className={styles.turnInput}
            onChange={onChangeTurn}
          />
        </label>
      </div>

      <input
        type="range"
        min="0"
        max={visualizerSettingInfo.maxTurn}
        value={visualizerSettingInfo.turn}
        className={styles.turnSlider}
        onChange={onChangeTurn}
      />
    </div>
  );
};

export default TurnSlider;
