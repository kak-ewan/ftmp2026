export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE, AUTOSYNC & EMAIL SYSTEM - FTMP XXVI 2026
 * =========================================================================
 * 
 * Petunjuk Instalasi:
 * 1. Buka Google Sheets baru.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus kode bawaan, lalu tempel (paste) seluruh kode di bawah ini.
 * 4. Silakan simpan dan jalankan fungsi "setupSheets" sekali untuk inisialisasi sheet awal.
 * 5. Klik tombol "Terapkan" (Deploy) -> "Terapkan Baru" (New deployment).
 * 6. Pilih tipe: "Aplikasi Web" (Web app).
 * 7. Konfigurasikan:
 *    - Jalankan sebagai: "Saya" (Me / Akun Google Anda)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone) -> PENTING! Agar web app bisa sinkronisasi.
 * 8. Klik "Terapkan" (Deploy). Berikan izin akses (Authorize access) lalu gunakan akun Google Anda.
 * 9. Salin "URL Aplikasi Web" (Web App URL) yang dihasilkan.
 * 10. Tempel URL tersebut ke menu Integrasi Apps Script di dalam Portal Pendaftar/Admin!
 */

// Custom Menu untuk kemudahan Setup langsung di Google Sheets
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🎭 Panel FTMP XXVI')
    .addItem('Inisialisasi Database (Setup Sheets)', 'setupSheets')
    .addToUi();
}

/**
 * UTILITY: Setup dan Inisialisasi Seluruh Sheets Secara Otomatis
 */
function setupSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Akun Pendaftar
  var sAkun = getOrCreateSheet(spreadsheet, "Akun_Pendaftar");
  sAkun.clear();
  sAkun.appendRow(["Username", "Password", "NPSN", "Nama Sekolah", "Nama Sanggar", "Kontak Pembina", "Email", "Status Verifikasi", "Catatan Verifikasi", "Waktu Pendaftaran"]);
  sAkun.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#dbeafe").setFontColor("#1e40af");
  
  // 2. Sheet Pendaftaran Sanggar (Berkas & Detail)
  var sSanggar = getOrCreateSheet(spreadsheet, "Pendaftaran_Sanggar");
  sSanggar.clear();
  sSanggar.appendRow([
    "Username", "Nama Sekolah", "Nama Sanggar", "Kontak Pembina", "Email",
    "Naskah File URL", "Plot Lampu URL", "Poster URL", "Desain Artistik URL", "Sinopsis URL", "Profil Sanggar URL", 
    "Bukti Pembayaran URL", "Waktu Update"
  ]);
  sSanggar.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#fef3c7").setFontColor("#92400e");
  
  // 3. Sheet Daftar Peserta Kategori Pelakon / Artistik
  var sPeserta = getOrCreateSheet(spreadsheet, "Daftar_Peserta");
  sPeserta.clear();
  sPeserta.appendRow(["Username", "ID Peserta", "Nama Sesuai Ijazah", "Peran Kategori", "Nama Tokoh", "Jenis Kelamin", "Penyakit Bawaan", "Foto 3x4 URL", "Waktu Update"]);
  sPeserta.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#dcfce7").setFontColor("#166534");
  
  // 4. Sheet Tiket Bookings
  var sTiket = getOrCreateSheet(spreadsheet, "Tiket_Bookings");
  sTiket.clear();
  sTiket.appendRow(["ID Tiket", "Nama Pemesan", "Email", "No HP", "Jumlah Tiket", "Kategori", "Tanggal Pementasan", "Daftar Kursi", "Status Pembayaran", "Waktu Booking", "Bukti Pembayaran"]);
  sTiket.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#f3e8ff").setFontColor("#6b21a8");

  // 5. Sheet Scripts
  var sScripts = getOrCreateSheet(spreadsheet, "Scripts");
  sScripts.clear();
  sScripts.appendRow(["ID_Script", "Judul", "Pengarang", "Sinopsis", "File_URL", "Ukuran"]);
  sScripts.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#fce7f3").setFontColor("#9d174d");
  sScripts.appendRow(["sc-1", "Ayahku Pulang", "Usmar Ismail", "Drama keluarga yang mengisahkan kembalinya seorang ayah setelah bertahun-tahun meninggalkan keluarganya, tepat pada saat hari raya raya, membawa konflik batin di antara anak-anaknya.", "https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo1/edit?usp=sharing", "1.2 MB"]);
  sScripts.appendRow(["sc-2", "Bila Malam Bertambah Malam", "Putu Wijaya", "Sebuah naskah drama psikologis yang menyoroti konflik kasta, cinta, dan kehormatan di Bali, menggambarkan pertentangan emosi yang mendalam antara kaum bangsawan dan rakyat jelata.", "https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo2/edit?usp=sharing", "850 KB"]);
  sScripts.appendRow(["sc-3", "RT Nol RW Nol", "Iwan Simatupang", "Naskah absurd yang menceritakan kehidupan kaum gelandangan di bawah kolong jembatan, menggambarkan potret kemanusiaan, mimpi-mimpi sederhana, serta kritik sosial yang mendalam.", "https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo3/edit?usp=sharing", "1.5 MB"]);

  // 6. Sheet Settings
  var sSettings = getOrCreateSheet(spreadsheet, "Settings");
  sSettings.clear();
  sSettings.appendRow(["Key", "Value"]);
  sSettings.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#e0f2fe").setFontColor("#0369a1");
  sSettings.appendRow(["appLogo", "/ftmp.png"]);
  sSettings.appendRow(["heroTitle", "Festival Teater Modern Pelajar"]);
  sSettings.appendRow(["heroDesc", "Daftarkan kelompok teater dari sekolahmu dan berlagalah pada panggung bergengsi FTMP XXVI. Tunjukkan tajimu, menangkan Piala Bergilir!"]);
  sSettings.appendRow(["juknisUrl", "#"]);
  sSettings.appendRow(["pelaksanaanTanggal", "9 s.d. 20 November 2026"]);
  sSettings.appendRow(["pelaksanaanTempat", "Arena Terbuka Taman Budaya Provinsi Nusa Tenggara Barat"]);
  sSettings.appendRow(["biayaRegistrasi", "Rp350.000"]);
  sSettings.appendRow(["rekeningNomor", "3495-01-046321-533"]);
  sSettings.appendRow(["rekeningNama", "Teater Putih"]);
  sSettings.appendRow(["kontak1Nama", "Liza Hafsa"]);
  sSettings.appendRow(["kontak1Hp", "081906901245"]);
  sSettings.appendRow(["kontak2Nama", "Bq Dinda Puspita Rinjani"]);
  sSettings.appendRow(["kontak2Hp", "087855375689"]);
  sSettings.appendRow(["kontakTiketNama", "Admin Tiketing FTMP"]);
  sSettings.appendRow(["kontakTiketHp", "081906901245"]);
  sSettings.appendRow(["downloadImageUrl", "https://picsum.photos/seed/ftmp/800/1200"]);
  sSettings.appendRow(["downloadImageTitle", "Poster Resmi FTMP XXVI"]);
  sSettings.appendRow(["petunjuk1Title", "Batas SARA & Pornografi"]);
  sSettings.appendRow(["petunjuk1Desc", "Naskah dan pementasan murni seni kreatif, tidak boleh mengandung SARA, pornografi, maupun pornoaksi."]);
  sSettings.appendRow(["petunjuk2Title", "Konstruksi & Bentuk Realis"]);
  sSettings.appendRow(["petunjuk2Desc", "Naskah drama harus memiliki konstruksi dramatik yang kuat serta disajikan dalam bentuk pementasan realis."]);
  sSettings.appendRow(["petunjuk3Title", "Durasi Pertunjukan"]);
  sSettings.appendRow(["petunjuk3Desc", "Setiap kelompok/sanggar teater diberikan waktu mentas maksimal 45 menit lengkap."]);
  sSettings.appendRow(["petunjuk4Title", "Komposisi Tim"]);
  sSettings.appendRow(["petunjuk4Desc", "Siswa aktif di NTB. Panitia menyediakan ID Card untuk 20 peserta dan Tim + 1 Pelatih + 1 Pembina + 1 Sutradara + 1 Pubdok + 1 Stage Manager."]);

  // Tambahkan baris data testing / contoh jika diinginkan
  sAkun.appendRow(["sekolah_teladan", "rahasia123", "50201234", "SMA Negeri 1 Mataram", "Teater Semburat", "08123456789", "sekolah_teladan@gmail.com", "Pending", "", new Date().toISOString()]);
  sSanggar.appendRow([
    "sekolah_teladan", 
    "SMA Negeri 1 Mataram", 
    "Teater Semburat", 
    "08123456789", 
    "sekolah_teladan@gmail.com",
    "https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo1/edit", 
    "https://picsum.photos/seed/lamp/800/600",
    "https://picsum.photos/seed/poster/800/1200", 
    "https://picsum.photos/seed/stage/800/600", 
    "https://picsum.photos/seed/synopsis/800/600", 
    "https://picsum.photos/seed/profile/800/600",
    "https://picsum.photos/seed/payment/800/600",
    new Date().toISOString()
  ]);
  
  sPeserta.appendRow(["sekolah_teladan", "PST-1", "Ahmad Fauzi", "Aktor Utama", "Rama", "Laki-laki", "Asma", "https://picsum.photos/seed/fauzi/300/400", new Date().toISOString()]);
  sPeserta.appendRow(["sekolah_teladan", "PST-2", "Rina Amelia", "Aktris Utama", "Sinta", "Perempuan", "Tidak Ada", "https://picsum.photos/seed/rina/300/400", new Date().toISOString()]);
  
  sTiket.appendRow(["TKT-TEST123", "Iwan Prasetyo", "iwan.prasetyo@gmail.com", "08771234567", "2", "VIP", "Senin, 9 November 2026", "A1, A2", "Paid", new Date().toISOString()]);
  
  return "Database FTMP XXVI sukses diinisialisasi!";
}

/**
 * POST Webhook Handler
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    // Kunci antrean eksekusi hingga 30 detik agar operasi tulis tidak bentrok (queueing)
    hasLock = lock.tryLock(30000);
    if (!hasLock) {
      return jsonResponse({
        success: false,
        message: "Sistem Spreadsheet sedang sibuk memproses data pengguna lain. Silakan coba kembali sesaat lagi."
      });
    }

    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;
    var data = payload.data;
    
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "setup_sheets") {
      var msg = setupSheets();
      return jsonResponse({ success: true, message: msg });
    }
    
    if (action === "get_all_data") {
      return handleGetAllData(spreadsheet);
    }
    
    if (action === "register_account") {
      return handleRegisterAccount(data, spreadsheet);
    }
    
    if (action === "save_sanggar_data") {
      return handleSaveSanggarData(data, spreadsheet);
    }
    
    if (action === "sync_peserta") {
      return handleSyncPeserta(data, spreadsheet);
    }
    
    if (action === "submit_bukti_pembayaran_pendaftar") {
      return handleSubmitBuktiPembayaran(data, spreadsheet);
    }
    
    if (action === "update_status") {
      return handleStatusUpdate(data, spreadsheet);
    }
    
    if (action === "new_ticket") {
      return handleTicket(data, spreadsheet);
    }

    if (action === "upload_ticket_payment") {
      return handleUploadTicketPayment(data, spreadsheet);
    }

    if (action === "admin_update_ticket" || action === "update_ticket_status") {
      return handleAdminUpdateTicket(data, spreadsheet);
    }
    
    if (action === "manage_scripts") {
      return handleManageScripts(data, spreadsheet);
    }
    
    if (action === "save_global_settings") {
      return handleSaveGlobalSettings(data, spreadsheet);
    }
    
    if (action === "manage_ticket_settings") {
      return handleManageTicketSettings(data, spreadsheet);
    }
    
    return jsonResponse({ success: false, message: "Aksi tidak dikenali di Apps Script." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Koneksi Apps Script Web App Aktif! Silakan hubungkan dari web portal.")
                       .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handle Ambil Seluruh Data Database
 */
function handleGetAllData(spreadsheet) {
  var data = {
    accounts: readSheetData(spreadsheet, "Akun_Pendaftar"),
    sanggars: readSheetData(spreadsheet, "Pendaftaran_Sanggar"),
    peserta: readSheetData(spreadsheet, "Daftar_Peserta"),
    tickets: readSheetData(spreadsheet, "Tiket_Bookings"),
    scripts: readSheetData(spreadsheet, "Scripts"),
    settings: readSheetData(spreadsheet, "Settings"),
    ticketSettings: readSheetData(spreadsheet, "Ticket_Settings")
  };
  
  // Transform ticketSettings row into structured object format
  if (data.ticketSettings && data.ticketSettings.length > 0) {
    var rawSettings = data.ticketSettings[0];
    try {
      data.ticketSettings = JSON.parse(rawSettings.JSON_Config);
    } catch(e) {
      data.ticketSettings = {};
    }
  } else {
    data.ticketSettings = {};
  }
  
  return jsonResponse({ success: true, data: data });
}

/**
 * Handle Daftar Akun Pendaftar Baru
 */
function handleRegisterAccount(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Akun_Pendaftar");
  var rows = sheet.getDataRange().getValues();
  var cleanUser = normStr(data.username);
  
  if (!cleanUser) {
    return jsonResponse({ success: false, message: "Username tidak boleh kosong!" });
  }

  // Cek jika username sudah terpakai
  for (var i = 1; i < rows.length; i++) {
    if (normStr(rows[i][0]) === cleanUser) {
      return jsonResponse({ success: false, message: "Username '" + data.username + "' sudah terdaftar!" });
    }
  }

  // Cek jika NPSN sudah terpakai
  var rawNpsn = String(data.npsn || "").trim();
  var npsnTarget = sanitizeSheetName(rawNpsn);
  if (rawNpsn !== "") {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][2] && String(rows[i][2]).trim() === rawNpsn) {
        return jsonResponse({ success: false, message: "NPSN '" + rawNpsn + "' sudah terdaftar oleh sekolah lain!" });
      }
    }
  }
  
  sheet.appendRow([
    cleanUser,
    data.password,
    rawNpsn,
    data.namaSekolah || "",
    data.namaSanggar || "",
    data.kontakPembina || "",
    data.email || "", // Email column inserted here
    "Draft", // Status Verifikasi Awal (shifted to column 8)
    "", // Catatan Verifikasi (shifted to column 9)
    new Date().toISOString()
  ]);

  if (npsnTarget !== "" && npsnTarget !== "Sheet") {
    var schoolSheet = getOrCreateSheet(spreadsheet, npsnTarget);
    schoolSheet.clear();
    ensureSchoolSheetTemplate(schoolSheet, npsnTarget);
  }
  
  return jsonResponse({ success: true, message: "Akun pendaftar berhasil dibuat!" });
}

/**
 * Handle Simpan Detail Sanggar & Berkas
 */
function handleSaveSanggarData(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Pendaftaran_Sanggar");
  var rows = sheet.getDataRange().getValues();
  
  var username = normStr(data.username);
  var rowFound = -1;
  for (var i = 1; i < rows.length; i++) {
    if (normStr(rows[i][0]) === username) {
      rowFound = i + 1;
      break;
    }
  }
  
  // Buat Folder di Google Drive untuk menyimpan file upload sanggar
  var rootFolder = getOrCreateFolder("FTMP2026");
  var rawNpsn = getAccountNpsn(username, spreadsheet);
  var npsnTarget = sanitizeSheetName(rawNpsn || username);
  var npsnFolder = getOrCreateFolderInParent(npsnTarget, rootFolder);
  
  // Simpan berkas jika dikirim sebagai base64, jika dikirim url mentah (atau text) simpan langsung text-nya
  // Format nama file: NPSN_NamaDokumen
  
  var naskahUrl = saveOrUploadFile(data.naskahFile, formatFileName("doc", npsnTarget, "Naskah"), npsnFolder);
  var plotLampuUrl = saveOrUploadFile(data.plotLampu, formatFileName("doc", npsnTarget, "Plot_Lampu"), npsnFolder);
  var posterUrl = saveOrUploadFile(data.poster, formatFileName("doc", npsnTarget, "Poster_Pementasan"), npsnFolder);
  var artistikUrl = saveOrUploadFile(data.artistik, formatFileName("doc", npsnTarget, "Desain_Artistik"), npsnFolder);
  var sinopsisUrl = saveOrUploadFile(data.sinopsis, formatFileName("doc", npsnTarget, "Ringkasan_Sinopsis"), npsnFolder);
  var profilSanggarUrl = saveOrUploadFile(data.profilSanggar, formatFileName("doc", npsnTarget, "Profil_Sanggar"), npsnFolder);
  
  var rowData = [
    username,
    data.namaSekolah || "",
    data.namaSanggar || "",
    data.kontakPembina || "",
    data.email || "", // insert email
    naskahUrl || data.naskahFile || "",
    plotLampuUrl || data.plotLampu || "",
    posterUrl || data.poster || "",
    artistikUrl || data.artistik || "",
    sinopsisUrl || data.sinopsis || "",
    profilSanggarUrl || data.profilSanggar || "",
    data.buktiPembayaran || "", // di-update via form bukti bayar terpisah
    new Date().toISOString()
  ];
  
  if (rowFound !== -1) {
    // Cari status dulu di akun untuk memastikan bukan Locked
    var status = getAccountStatus(username, spreadsheet);
    if (status === "Disetujui") {
      return jsonResponse({ success: false, message: "Data terkunci! Anda tidak dapat mengedit data setelah disetujui admin." });
    }
    
    // Perbarui baris yang ada
    for (var col = 1; col <= rowData.length; col++) {
      sheet.getRange(rowFound, col).setValue(rowData[col - 1]);
    }
  } else {
    sheet.appendRow(rowData);
  }
  
  // Sinkronkan juga info nama sekolah,nama sanggar & kontak ke sheet Akun
  updateAccountProfile(username, data.namaSekolah, data.namaSanggar, data.kontakPembina, data.email, spreadsheet);

  if (rawNpsn && rawNpsn !== "" && npsnTarget !== "Sheet") {
    var schoolSheet = getOrCreateSheet(spreadsheet, npsnTarget);
    if (schoolSheet.getLastRow() < 7) {
      ensureSchoolSheetTemplate(schoolSheet, npsnTarget);
    }
    schoolSheet.getRange(3, 1, 1, 12).setValues([[
      username, 
      data.namaSekolah || "", 
      data.namaSanggar || "", 
      data.kontakPembina || "", 
      data.email || "", // insert email
      naskahUrl || data.naskahFile || "", 
      plotLampuUrl || data.plotLampu || "",
      posterUrl || data.poster || "",
      artistikUrl || data.artistik || "",
      sinopsisUrl || data.sinopsis || "",
      profilSanggarUrl || data.profilSanggar || "",
      data.buktiPembayaran || ""
    ]]);
  }
  
  return jsonResponse({ success: true, message: "Profil sanggar & unggahan berkas sukses disimpan!" });
}

/**
 * Handle Sinkronisasi Multi Peserta
 */
function handleSyncPeserta(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Daftar_Peserta");
  var username = normStr(data.username);
  var pesertaList = data.peserta || []; // Array of peserta object
  
  // Hapus seluruh peserta lama dari sanggar ini untuk diganti yang baru (sinkronisasi)
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (normStr(rows[i][0]) === username) {
      sheet.deleteRow(i + 1);
    }
  }
  
  var rootFolder = getOrCreateFolder("FTMP2026");
  var rawNpsn = getAccountNpsn(username, spreadsheet);
  var npsnTarget = sanitizeSheetName(rawNpsn || username);
  var npsnFolder = getOrCreateFolderInParent(npsnTarget, rootFolder);
  
  // Tambah ulang seluruh peserta baru
  var npsnPesertaRows = [];

  for (var k = 0; k < pesertaList.length; k++) {
    var p = pesertaList[k];
    var fotoUrl = saveOrUploadFile(p.fotoFile, formatFileName("foto", npsnTarget, p.peran, p.nama), npsnFolder);
    
    sheet.appendRow([
      username,
      p.id,
      p.nama,
      p.peran,
      p.namaTokoh || "-",
      p.jenisKelamin,
      p.penyakitBawaan || "-",
      fotoUrl || p.fotoFile || "",
      new Date().toISOString()
    ]);

    npsnPesertaRows.push([
      p.id,
      p.nama,
      p.peran,
      p.namaTokoh || "-",
      p.jenisKelamin,
      p.penyakitBawaan || "-",
      fotoUrl || p.fotoFile || ""
    ]);
  }

  if (rawNpsn && rawNpsn !== "" && npsnTarget !== "Sheet") {
    var schoolSheet = getOrCreateSheet(spreadsheet, npsnTarget);
    if (schoolSheet.getLastRow() < 7) {
      ensureSchoolSheetTemplate(schoolSheet, npsnTarget);
    }
    // Hapus peserta lama di sheet NPSN
    var lastRow = schoolSheet.getLastRow();
    if (lastRow >= 8) {
      schoolSheet.getRange(8, 1, lastRow - 7, 7).clearContent();
    }
    // Masukkan peserta baru
    if (npsnPesertaRows.length > 0) {
      schoolSheet.getRange(8, 1, npsnPesertaRows.length, 7).setValues(npsnPesertaRows);
    }
  }
  
  return jsonResponse({ success: true, message: pesertaList.length + " Peserta berhasil disinkronisasi ke Google Sheets!" });
}

/**
 * Handle Kirim Bukti Pembayaran & Ubah status Akun ke 'Pending' untuk Verifikasi
 */
function handleSubmitBuktiPembayaran(data, spreadsheet) {
  var username = normStr(data.username);
  var fileData = data.buktiBayarFile;
  
  var rootFolder = getOrCreateFolder("FTMP2026");
  var rawNpsn = getAccountNpsn(username, spreadsheet);
  var npsnTarget = sanitizeSheetName(rawNpsn || username);
  var npsnFolder = getOrCreateFolderInParent(npsnTarget, rootFolder);
  
  var buktiUrl = saveOrUploadFile(fileData, formatFileName("doc", npsnTarget, "Bukti_Pembayaran"), npsnFolder);
  
  // 1. Update di sheet Pendaftaran_Sanggar
  var sheetSanggar = getOrCreateSheet(spreadsheet, "Pendaftaran_Sanggar");
  var rowsS = sheetSanggar.getDataRange().getValues();
  for (var i = 1; i < rowsS.length; i++) {
    if (normStr(rowsS[i][0]) === username) {
      sheetSanggar.getRange(i + 1, 12).setValue(buktiUrl || fileData || ""); // Shifted to column 12
      break;
    }
  }
  
  // 2. Update status di Akun_Pendaftar ke Pending untuk review admin
  var sheetAkun = getOrCreateSheet(spreadsheet, "Akun_Pendaftar");
  var rowsA = sheetAkun.getDataRange().getValues();
  for (var j = 1; j < rowsA.length; j++) {
    if (normStr(rowsA[j][0]) === username) {
      sheetAkun.getRange(j + 1, 8).setValue("Pending"); // Shifted to column 8
      sheetAkun.getRange(j + 1, 9).setValue(""); // Shifted to column 9
      break;
    }
  }

  // 3. Update di sheet NPSN sekolah jika ada
  if (rawNpsn && rawNpsn !== "" && npsnTarget !== "Sheet") {
    var schoolSheet = getOrCreateSheet(spreadsheet, npsnTarget);
    if (schoolSheet.getLastRow() < 7) {
      ensureSchoolSheetTemplate(schoolSheet, npsnTarget);
    }
    schoolSheet.getRange(3, 12).setValue(buktiUrl || fileData || ""); // Shifted to column 12
  }
  
  return jsonResponse({ success: true, message: "Bukti pembayaran terkirim! Menunggu verifikasi tim panitia.", url: buktiUrl || fileData });
}

/**
 * Handle Persetujuan / Penolakan Admin & Auto Email
 */
function handleStatusUpdate(data, spreadsheet) {
  var username = normStr(data.username); // Username pendaftar target
  var status = data.status; // "Disetujui" | "Ditolak"
  var catatan = data.catatan || "";
  
  // 1. Update status akun
  var sheetAkun = getOrCreateSheet(spreadsheet, "Akun_Pendaftar");
  var rowsA = sheetAkun.getDataRange().getValues();
  var emailUser = "";
  var namaSanggar = "";
  var namaSekolah = "";
  var kontak = "";
  
  for (var i = 1; i < rowsA.length; i++) {
    if (normStr(rowsA[i][0]) === username) {
      sheetAkun.getRange(i + 1, 8).setValue(status); // Column 8 (Status Verifikasi)
      sheetAkun.getRange(i + 1, 9).setValue(catatan); // Column 9 (Catatan Verifikasi)
      namaSekolah = rowsA[i][3];
      namaSanggar = rowsA[i][4];
      kontak = rowsA[i][5];
      break;
    }
  }
  
  // Ambil data lakon/naskah jika ada di sheet pendaftaran
  var naskahJudul = "-";
  var sheetSanggar = getOrCreateSheet(spreadsheet, "Pendaftaran_Sanggar");
  var rowsS = sheetSanggar.getDataRange().getValues();
  for (var j = 1; j < rowsS.length; j++) {
    if (normStr(rowsS[j][0]) === username) {
      naskahJudul = rowsS[j][4]; // atau bisa mengidentifikasi judul naskah
      break;
    }
  }
  
  // Email opsional berdasarkan username/nama sanggar (jika ada form isi email sanggar)
  // Buat simulasi notifikasi otomatis via MailApp jika email terdeteksi dari kontak, atau sesuaikan pancingan
  if (data.email) {
    if (status === "Disetujui") {
      sendApprovalEmailCustom(data.email, namaSanggar, namaSekolah, naskahJudul, username);
    } else {
      sendRejectionEmailCustom(data.email, namaSanggar, namaSekolah, catatan, username);
    }
  }
  
  return jsonResponse({ success: true, message: "Pemberitahuan status " + status + " diproses!" });
}

/**
 * Handle Pembelian Tiket Baru
 */
function handleTicket(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Tiket_Bookings");
  
  sheet.appendRow([
    data.id,
    data.namaPemesan,
    data.email,
    data.noHp,
    data.jumlah,
    data.kategori,
    data.tanggalPementasan,
    data.kursi.join(", "),
    data.status,
    new Date(data.tanggalPesan).toISOString()
  ]);
  
  return jsonResponse({ success: true, message: "Kode booking tiket #" + data.id + " sukses dicatat di Google Sheets!" });
}

/**
 * Handle update status pembayaran tiket oleh admin
 */
function handleAdminUpdateTicket(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Tiket_Bookings");
  var rows = sheet.getDataRange().getValues();
  var id = normStr(data.id || data.ticketId);
  var status = data.status; // "Paid" | "Unpaid" | "Pending Verifikasi"
  
  for (var i = 1; i < rows.length; i++) {
    if (normStr(rows[i][0]) === id) {
      sheet.getRange(i + 1, 9).setValue(status);
      return jsonResponse({ success: true, message: "Status pembayaran tiket #" + id + " berganti ke " + status });
    }
  }
  return jsonResponse({ success: false, message: "ID tiket tak ditemukan." });
}

/**
 * Handle upload bukti pembayaran tiket
 */
function handleUploadTicketPayment(data, spreadsheet) {
  var rawId = data.id || data.ticketId;
  var id = normStr(rawId);
  var buktiPembayaran = data.buktiPembayaran;
  
  // Note: AppScript doesn't easily store files without knowing the filename properly or we can just save it to "BuktiBayarTiket" folder
  var rootFolder = getOrCreateFolder("FTMP2026");
  var tiketFolder = getOrCreateFolderInParent("Bukti_Bayar_Tiket", rootFolder);
  
  var buktiUrl = saveOrUploadFile(buktiPembayaran, "Bukti_Tiket_" + id, tiketFolder);
  
  var sheet = getOrCreateSheet(spreadsheet, "Tiket_Bookings");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (normStr(rows[i][0]) === id) {
      sheet.getRange(i + 1, 11).setValue(buktiUrl || buktiPembayaran || ""); // Column 11 for Bukti Pembayaran
      sheet.getRange(i + 1, 9).setValue("Pending Verifikasi"); // Column 9 for Status
      return jsonResponse({ success: true, message: "Bukti pembayaran tiket #" + rawId + " berhasil diunggah" });
    }
  }
  return jsonResponse({ success: false, message: "ID tiket tak ditemukan." });
}

/**
 * Handle Manage Ticket Settings Config
 */
function handleManageTicketSettings(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Ticket_Settings");
  sheet.clear();
  sheet.getRange(1, 1).setValue("JSON_Config").setFontWeight("bold");
  sheet.getRange(2, 1).setValue(JSON.stringify(data.ticketSettings || {}));
  return jsonResponse({ success: true, message: "Pengaturan tiket berhasil diperbarui" });
}

/**
 * HELPER: Membaca seluruh baris dari Sheet menjadi JSON Array
 */
function readSheetData(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var col = 0; col < headers.length; col++) {
      var headerKey = headers[col].toString().split(" ").join("_");
      obj[headerKey] = row[col];
    }
    data.push(obj);
  }
  
  return data;
}

/**
 * HELPER: Normalisasi String untuk Username & ID (lowercase & trim)
 */
function normStr(val) {
  return String(val || "").trim().toLowerCase();
}

/**
 * HELPER: Sanitasi Nama Tab Sheet agar valid di Google Sheets (larang: \\ / ? * : [ ])
 */
function sanitizeSheetName(name) {
  var clean = String(name || "").replace(/[\\/\?\*\:\[\]]/g, "_").trim();
  if (!clean) clean = "Sheet";
  return clean.slice(0, 99);
}

/**
 * HELPER: Pastikan format template lembar sekolah NPSN tersedia
 */
function ensureSchoolSheetTemplate(schoolSheet, npsnTarget) {
  schoolSheet.getRange(1, 1).setValue("PROFIL SANGGAR | NPSN: " + npsnTarget).setFontWeight("bold").setBackground("#fef3c7");
  schoolSheet.getRange(2, 1, 1, 12).setValues([["Username", "Nama Sekolah", "Nama Sanggar", "Kontak Pembina", "Email", "Naskah", "Plot Lampu", "Poster", "Desain Artistik", "Sinopsis", "Profil Sanggar", "Bukti Pembayaran"]]).setFontWeight("bold");
  schoolSheet.getRange(6, 1).setValue("DAFTAR PESERTA").setFontWeight("bold").setBackground("#dcfce7");
  schoolSheet.getRange(7, 1, 1, 7).setValues([["ID Peserta", "Nama Sesuai Ijazah", "Peran", "Nama Tokoh", "L/P", "Penyakit Bawaan", "Foto"]]).setFontWeight("bold");
}

/**
 * HELPER: Mendapatkan Status Akun Aktif
 */
function getAccountStatus(username, spreadsheet) {
  var sheet = spreadsheet.getSheetByName("Akun_Pendaftar");
  if (!sheet) return "Pending";
  var cleanUser = normStr(username);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normStr(data[i][0]) === cleanUser) {
      return data[i][7]; // Column 8 (index 7) is now Status Verifikasi
    }
  }
  return "Pending";
}
  
function getAccountNpsn(username, spreadsheet) {
  var sheet = spreadsheet.getSheetByName("Akun_Pendaftar");
  if (!sheet) return "";
  var cleanUser = normStr(username);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normStr(data[i][0]) === cleanUser) {
      return sanitizeSheetName(data[i][2]);
    }
  }
  return "";
}

function updateAccountProfile(username, sekolah, sanggar, kontak, email, spreadsheet) {
  var sheet = spreadsheet.getSheetByName("Akun_Pendaftar");
  if (!sheet) return;
  var cleanUser = normStr(username);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normStr(data[i][0]) === cleanUser) {
      if (sekolah) sheet.getRange(i + 1, 4).setValue(sekolah);
      if (sanggar) sheet.getRange(i + 1, 5).setValue(sanggar);
      if (kontak) sheet.getRange(i + 1, 6).setValue(kontak);
      if (email) sheet.getRange(i + 1, 7).setValue(email);
      break;
    }
  }
}

/**
 * Helper: Ambil Sheet atau Buat Jika Belum Ada
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Helper: Simpan base64 ke Google Drive kustom folder, atau biarkan URL teks jika merupakan URL web
 */
function saveOrUploadFile(fileData, fileNamePrefix, folder) {
  if (!fileData) return "";
  if (fileData.indexOf("data:") !== 0) {
    return fileData; // Kembalikan string teks / url langsung
  }
  
  try {
    var parts = fileData.split(",");
    var meta = parts[0];
    var base64Content = parts[1];
    
    var extension = "bin";
    var mimeType = "application/octet-stream";
    
    if (meta.indexOf("image/jpeg") !== -1 || meta.indexOf("image/jpg") !== -1) {
      extension = "jpg";
      mimeType = "image/jpeg";
    } else if (meta.indexOf("image/png") !== -1) {
      extension = "png";
      mimeType = "image/png";
    } else if (meta.indexOf("application/pdf") !== -1) {
      extension = "pdf";
      mimeType = "application/pdf";
    } else if (meta.indexOf("application/msword") !== -1) {
      extension = "doc";
      mimeType = "application/msword";
    } else if (meta.indexOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document") !== -1) {
      extension = "docx";
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    
    var decoded = Utilities.base64Decode(base64Content);
    var blob = Utilities.newBlob(decoded, mimeType, fileNamePrefix + "_" + Math.floor(100+Math.random()*900) + "." + extension);
    var file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Gagal unggah: " + err.toString();
  }
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var folder = DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return folder;
  }
}

function getOrCreateFolderInParent(folderName, parentFolder) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var folder = parentFolder.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return folder;
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HELPER: Memformat nama file unggahan secara aman
 */
function formatFileName(prefix, p1, p2, p3) {
  var parts = [p1, p2, p3];
  var raw = parts.filter(Boolean).join("_").replace(/[^a-zA-Z0-9_-]/g, "_");
  return raw.length > 50 ? raw.substring(0, 50) : raw;
}

/**
 * Pengiriman email persetujuan
 */
function sendApprovalEmailCustom(email, namaSanggar, namaSekolah, naskahJudul, username) {
  var subject = "🎉 PENDAFTARAN DISETUJUI - Sanggar " + namaSanggar + " | FTMP XXVI NTB 2026";
  var htmlBody = 
    "<div style='font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;'>" +
      "<h2 style='color: #0f766e;'>SELAMAT! PENDAFTARAN STATUS: DISETUJUI</h2>" +
      "<p>Halo <strong>" + namaSanggar + "</strong> (" + namaSekolah + "),</p>" +
      "<p>Kami dengan senang hati menyampaikan bahwa <strong>bukti pembayaran dan berkas berkas pendaftaran Anda telah lengkap & disetujui</strong> oleh Panitia Pelaksana FTMP XXVI Se-NTB 2026!</p>" +
      "<div style='background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin: 15px 0;'>" +
        "<strong>Informasi Akun:</strong><br/>" +
        "&bull; Username Pendaftar: " + username + "<br/>" +
        "&bull; Status: <strong>DISETUJUI (TERKUNCI)</strong>" +
      "</div>" +
      "<p>Data Anda telah dikunci secara sistem untuk keperluan pencetakan buku program dan ID Card peserta.</p>" +
      "<p>Silakan bergabung ke grup koordinasi peserta melalui kontak LO pengiring Anda.</p>" +
      "<p>Terima kasih,<br/><strong>Panitia FTMP XXVI 2026</strong></p>" +
    "</div>";
    
  try {
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody });
  } catch(e) {}
}

function handleManageScripts(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Scripts");
  sheet.clear();
  sheet.getRange(1, 1, 1, 6).setValues([["ID_Script", "Judul", "Pengarang", "Sinopsis", "File_URL", "Ukuran"]]).setFontWeight("bold");
  
  if (data.scripts && data.scripts.length > 0) {
    var rows = data.scripts.map(function(s) {
      return [s.id || "", s.judul || "", s.pengarang || s.penulis || "", s.sinopsis || "", s.fileUrl || "", s.size || ""];
    });
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  return jsonResponse({ success: true, message: "Daftar naskah diperbarui." });
}

function handleSaveGlobalSettings(data, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, "Settings");
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([["Key", "Value"]]).setFontWeight("bold");
  
  if (data) {
    var rows = [];
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var val = data[key];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        rows.push([key, val]);
      }
    }
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }
  }
  
  return jsonResponse({ success: true, message: "Pengaturan global diperbarui." });
}

function sendRejectionEmailCustom(email, namaSanggar, namaSekolah, catatan, username) {
  var subject = "⚠️ REVISI PENDAFTARAN - Sanggar " + namaSanggar + " | FTMP XXVI NTB 2026";
  var htmlBody = 
    "<div style='font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;'>" +
      "<h2 style='color: #b91c1c;'>REVISI BERKAS PENDAFTARAN</h2>" +
      "<p>Halo <strong>" + namaSanggar + "</strong> (" + namaSekolah + "),</p>" +
      "<p>Panitia pelaksana mendapati beberapa berkas pendaftaran atau bukti transfer yang memerlukan pembetulan.</p>" +
      "<div style='background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 15px 0; color: #991b1b;'>" +
        "<strong>Catatan Panitia:</strong><br/>" +
        catatan +
      "</div>" +
      "<p>Silakan login kembali ke dashboard menggunakan username Anda (<strong>" + username + "</strong>) untuk memperbarui data bersangkutan agar kami dapat segera melakukan verifikasi ulang.</p>" +
      "<p>Terima kasih,<br/><strong>Panitia FTMP XXVI 2026</strong></p>" +
    "</div>";
    
  try {
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody });
  } catch(e) {}
}
`;
