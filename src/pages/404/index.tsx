import styles from './index.module.less'

function Page404 (){
    return (
        <div className={styles.page404}>
            <img className={styles.page404_icon} src="https://u1.dl0.cn/images/l2963j.png" alt="" srcSet="" />
            <div className={styles.page404_text}>
                <h3>Sorry, the page you visited does not exist!</h3>
                <p>Please verify the link address is correct and try again</p>
            </div>
            <div className={styles.page404_button} onClick={()=>{
                location.href = '/casey'
            }}
            >
                Back to Casey
            </div>
        </div>
    )
}

export default Page404;
