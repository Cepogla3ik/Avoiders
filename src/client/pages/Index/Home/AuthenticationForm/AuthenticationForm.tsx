import styles from "./AuthenticationForm.module.scss";

export default function AuthenticationForm() {
  return (
    <div className={styles["authentication-container"]}>
      <form>
        <div id="authentication-messages"></div>
        <div className={styles["inputs-container"]}>
          <div>
            <input id="username" className={styles["form-item"]} placeholder="Username" type="text" autoComplete="username" maxLength={18} />
            <label className={styles["form-item-label"]} htmlFor="username">Username</label>
          </div>
          <div>
            <input id="password" className={styles["form-item"]} placeholder="Password" type="password" autoComplete="current-password" maxLength={64} />
            <label className={styles["form-item-label"]} htmlFor="password">Password</label>
          </div>
          <div>
            <input id="confirm-password" className={styles["form-item"]} placeholder="Confirm password" type="password" autoComplete="current-password" maxLength={64} />
            <label className={styles["form-item-label"]} htmlFor="confirm-password">Password</label>
          </div>
        </div>
        <div className={styles["buttons-container"]}>
          <button type="button">Login</button>
          <button type="button">Register</button>
        </div>
      </form>
    </div>
  );
}