import Image from "next/image";
import styles from "./page.module.css";
import Button from '@mui/material/Button';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Button variant="contained" color="primary">
          Click me
        </Button>
      </main>
    </div>
  );
}
