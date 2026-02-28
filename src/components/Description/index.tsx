import type { FC } from 'react';
import styles from './index.module.css';

const Description: FC = () => (
  <div>
    <h2 className={styles.title}>使い方</h2>
    <p className={styles.text}>
      AHCで配布されるビジュアライザと同様に、seedから入力生成し、出力を貼り付けてターンごとの状態を確認できます。
    </p>
  </div>
);

export default Description;
