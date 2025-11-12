import styles from './index.module.less'

import smallLogo from '@/assets/small logo.jpeg'

function Reminder() {

  return (
    <div className={styles.reminder}>
      <img src={smallLogo} className={styles.reminder_logo} />
      <p className={styles.reminder_message}>
        Chat intelligently with AI and explore infinite possibilities! Based on advanced AI engines, making your communication smarter, more efficient, and more convenient!
      </p>
      <p className={styles.reminder_message}>
        Press <span>Shift</span> + <span>Enter</span> for line break. Type <span>/</span> at the beginning to summon Prompt AI preset instructions.
      </p>
    </div>
  )
}

export default Reminder
