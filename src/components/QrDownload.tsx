"use client";

import { QRCodeSVG } from "qrcode.react";
import styles from "@/app/home.module.css";

export default function QrDownload() {
  return (
    <div className={styles.qrBox}>
      <QRCodeSVG
        value="https://cascade.app/download"
        size={148}
        fgColor="#112845"
        bgColor="#ffffff"
        level="M"
        title="QR code that opens the Cascade app download page"
      />
      <span>Scan to download</span>
    </div>
  );
}
