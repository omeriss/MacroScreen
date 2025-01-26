import styles from "./Editor.module.css";

const Editor = () => {
  return (
    <section className={`toolbar-section ${styles.toolbar}`}>
      <div className="toolbar-section-head"></div>
      <div className="toolbar-section-subtitle"></div>
      <div className="toolbar-section-main">
        <section>Home</section>
        <section>Profile</section>
        <section>Settings</section>
      </div>
    </section>
  );
};

export default Editor;
