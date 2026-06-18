/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { Settings, Binary, CalendarClock, Info } from "lucide-react";
import { SystemConfig } from "../types";

interface SystemSettingsProps {
  systemConfig: SystemConfig;
}

export default function SystemSettings({ systemConfig }: SystemSettingsProps) {

  const [retentionAktaJualBeli] = useState(30);
  const [retentionPendirianPerusahaan] = useState(30);
  const [retentionSuratKuasa] = useState(10);
  const [retentionPerjanjian] = useState(10);
  const [retentionPendukung] = useState(5);

  const retensiList = [
    { label: "Akta Jual Beli (AJB)", value: retentionAktaJualBeli },
    { label: "Akta Pendirian Perusahaan", value: retentionPendirianPerusahaan },
    { label: "Surat Kuasa", value: retentionSuratKuasa },
    { label: "Perjanjian", value: retentionPerjanjian },
    { label: "Sertifikat Tanah (SHM/SHGB)", value: null },
    { label: "Dokumen Pendukung", value: retentionPendukung
