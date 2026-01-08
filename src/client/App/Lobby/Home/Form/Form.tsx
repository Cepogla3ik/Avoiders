import styles from "./Form.module.scss";

export default function Form() {
  return (
    <div className={styles["authentication-container"]}>
      <form>
        <div id="authentication-messages"></div>
        <div className={styles["inputs-container"]}>
          <input className={styles["form-item"]} placeholder="Username" type="text" autoComplete="username" maxLength={18} />
          <input className={styles["form-item"]} placeholder="Password" type="password" autoComplete="current-password" maxLength={64} />
          <input className={styles["form-item"]} placeholder="Confirm password" type="password" autoComplete="current-password" maxLength={64} />
        </div>
        <div className={styles["buttons-container"]}>
          <button type="button">Login</button>
          <button type="button">Register</button>
        </div>
      </form>
    </div>
  );
}