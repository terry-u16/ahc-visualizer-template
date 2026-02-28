import type { FC } from 'react';
import styles from './index.module.css';

type SvgViewerProps = {
  svgString: string;
  err: string;
  score: number;
};

const SvgViewer: FC<SvgViewerProps> = ({ svgString, err, score }) => {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.score}>Score: {score}</div>
        {err && <span className={styles.error}>{err}</span>}
      </div>
      <div
        className={styles.canvas}
        dangerouslySetInnerHTML={{
          __html: svgString,
        }}
      />
    </>
  );
};

export default SvgViewer;
