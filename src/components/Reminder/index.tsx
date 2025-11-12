import styles from './index.module.less'

import smallLogo from '@/assets/small logo.jpeg'

function Reminder() {

  return (
    <div className={styles.reminder}>
      <img src={smallLogo} className={styles.reminder_logo} />
    </div>
  )
}

export default Reminder
