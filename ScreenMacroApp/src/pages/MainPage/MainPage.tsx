import ScreenMacroLogo from "../../assets/ScreenMacro.png";
import ButtonsScreen from "../../components/ButtonsScreen/ButtonsScreen";
import styles from "./MainPage.module.css";

const MainPage = () => {
  return (
    <main className={styles.mainPage}>
      <nav className={styles.nav}>
        <section>
          <img
            className={styles.logo}
            src={ScreenMacroLogo}
            alt="ScreenMacro Logo"
          />
        </section>
        <section>File</section>
        <section>Edit</section>
        <section>Upload</section>
      </nav>
      <div className={styles.positioner}>{"Main > somehing > something"}</div>
      <section className={styles.content}>
        <nav className={styles.sideNav}>
          <section>Home</section>
          <section>Profile</section>
          <section>Settings</section>
        </nav>
        <div className={styles.displaySection}>
          <ButtonsScreen />
        </div>
        <nav className={styles.sideNav}>
          <section>Home</section>
          <section>Profile</section>
          <section>Settings</section>
        </nav>
      </section>
    </main>
  );
};

export default MainPage;
