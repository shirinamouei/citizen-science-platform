"use client";

import { QRCodeSVG } from "qrcode.react";
import styles from "@/app/home.module.css";

export default function QrDownload() {
  return (
    <div className={styles.qrBox}>
      <QRCodeSVG
        value="https://tapertrack.app/download"
        size={148}
        fgColor="#112845"
        bgColor="#ffffff"
        level="M"
      />
      <span>SCAN TO DOWNLOAD</span>
    </div>
  );
}
