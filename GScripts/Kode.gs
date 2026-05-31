function getSS() {
  return SpreadsheetApp.openById("SPREADSHEET_ID");
}

function doGet(e) {

  var page = "Index";
  var requestedPage =
    e && e.parameter && e.parameter.page
      ? String(e.parameter.page).toLowerCase()
      : "";

  if (requestedPage == "admin") {
    page = "Admin";
  } else if (requestedPage == "batchprint") {
    page = "BatchPrint";
  } else if (requestedPage == "searchbynisn") {
    page = "SearchByNISN";
  } else if (requestedPage == "updatebynisnandnik") {
    page = "UpdateByNISNandNIK";
  }

  var template =
    HtmlService.createTemplateFromFile(page);

  var ss = getSS();

  var settingsSheet =
    ss.getSheetByName("Settings");

  if (!settingsSheet) {
    throw new Error(
      "Sheet Settings tidak ditemukan!"
    );
  }

  var settings =
    settingsSheet.getDataRange().getValues();

  template.namaSekolah = settings[3][1];
  template.footerTeks = settings[4][1];

  return template.evaluate()
    .setTitle(settings[3][1])
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

// ==========================================
// GET SETTINGS
// ==========================================

function getSettings() {

  var ss = getSS();

  var sheet =
    ss.getSheetByName("Settings");

  if (!sheet) {
    throw new Error(
      "Sheet Settings tidak ditemukan!"
    );
  }

  var data =
    sheet.getDataRange().getValues();

  return {

    tanggalMulai:
      data[0][1],

    kuotaHarian:
      Number(data[1][1]),

    jumlahOperator:
      Number(data[2][1]),

    namaSekolah:
      data[3][1],

    footerTeks:
      data[4][1]

  };
}

function getDataJurusan() {
  var ss = getSS();
  var sheet = ss.getSheetByName('DataJurusan');
  if (!sheet) {
    throw new Error('Sheet DataJurusan tidak ditemukan!');
  }

  var values = sheet.getRange(2, 2, sheet.getLastRow(), 2).getValues();
  var found = {};
  var options = [];

  for (var i = 0; i < values.length; i++) {
    var jurusan = String(values[i][0] || '').trim();
    if (!jurusan) continue;
    if (found[jurusan]) continue;
    found[jurusan] = true;
    options.push(jurusan);
  }

  return options;
}

// ==========================================
// SAVE SETTINGS
// ==========================================

function saveSettings(newSettings) {

  var ss = getSS();

  var sheet =
    ss.getSheetByName("Settings");

  if (!sheet) {
    throw new Error(
      "Sheet Settings tidak ditemukan!"
    );
  }

  sheet.getRange("B1:B5").setValues([

    [newSettings.tanggalMulai],

    [newSettings.kuotaHarian],

    [newSettings.jumlahOperator],

    [newSettings.namaSekolah],

    [newSettings.footerTeks]

  ]);

  return "Konfigurasi berhasil disimpan!";
}

// ==========================================
// HELPERS
// ==========================================

function normalizeSheetValue(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/^'/, "")
    .trim();

}

function normalizeNisnValue(value) {
  return normalizeSheetValue(value).replace(/\D/g, "");
}

function normalizePhoneValue(value) {
  return normalizeSheetValue(value).replace(/\D/g, "");
}

var HARI_INDO = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

var BULAN_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

function normalizeDateValue(value) {
  if (value instanceof Date) {
    return value;
  }

  if (!value) {
    return null;
  }

  var parsed = new Date(value);

  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatTanggalCetak(value) {
  var targetDate = normalizeDateValue(value);

  if (!targetDate) {
    return "";
  }

  return HARI_INDO[targetDate.getDay()] +
    ", " +
    targetDate.getDate() +
    " " +
    BULAN_INDO[targetDate.getMonth()] +
    " " +
    targetDate.getFullYear();
}

function formatSheetDate(value) {
  var targetDate = normalizeDateValue(value);

  if (!targetDate) {
    return "";
  }

  return Utilities.formatDate(
    targetDate,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy"
  );
}

function formatSheetDateTime(value) {
  var targetDate = normalizeDateValue(value);

  if (!targetDate) {
    return "";
  }

  return Utilities.formatDate(
    targetDate,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm:ss"
  );
}

function getActiveSheetRows(sheet, columnCount) {
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(2, 1, lastRow - 1, columnCount)
    .getValues();
}

// ==========================================
// GET BATCH PRINT DATA
// ==========================================

function getBatchPrintData() {

  var ss = getSS();

  var dataSheet =
    ss.getSheetByName("DataAntrian");

  if (!dataSheet) {
    throw new Error(
      "Sheet DataAntrian tidak ditemukan!"
    );
  }

  var data = getActiveSheetRows(dataSheet, 25);

  var hasil = [];

  for (var i = 0; i < data.length; i++) {

    var row = data[i];

    var oldOrtuIdRow = String(row[21] || "").trim().match(/^\d{10,}$/);
    var namaOrtuIndex = oldOrtuIdRow ? 22 : 21;
    var noHpOrtuIndex = oldOrtuIdRow ? 23 : 22;
    var konfirmasiIndex = oldOrtuIdRow ? 24 : 23;

    if (!row || row.length === 0) {
      continue;
    }

    if (row[0] === "" && row[1] === "" && row[2] === "" && row[3] === "") {
      continue;
    }

    var createdAt = formatSheetDateTime(row[0]);
    var tglCetak = formatTanggalCetak(row[5]);
    var tanggal = formatSheetDate(row[7]);

    hasil.push ({

      createdAt: createdAt,

      nisn: String(row[1]),

      no_hp:
        String(row[2]),

      nama:
        String(row[3]),

      asal:
        String(row[4]),

      hari:
        String(tglCetak),

      nomor:
        String(row[6]).padStart(3, '0'),

      tanggal: tanggal,

      loket:
        String(row[8]),

      sesi:
        String(row[9]),

      jurusan1:
        String(row[10]),

      jurusan2:
        String(row[11]),

      jenis_kelamin:
        String(row[12]),

      tgl_lahir:
        formatSheetDate(row[13]),

      nik:
        String(row[14]),

      agama:
        String(row[15]),

      tempat_lahir:
        String(row[16]),

      alamat:
        String(row[17]),

      email:
        String(row[18]),

      no_kk:
        String(row[19]),

      penerima_kip:
        String(row[20]),

      nama_ortu:
        String(row[namaOrtuIndex]),

      no_hp_ortu:
        String(row[noHpOrtuIndex]),

      konfirmasi:
        String(row[konfirmasiIndex])

    });

  }

  return hasil;

}

function searchAntrianByNISN(nisn) {

  var ss = getSS();

  var dataSheet =
    ss.getSheetByName("DataAntrian");

  var data = getActiveSheetRows(dataSheet, 25);

  var targetNisn =
    String(nisn).trim();

  for (var i = 0; i < data.length; i++) {

    var row = data[i];

    var oldOrtuIdRow = String(row[21] || "").trim().match(/^\d{10,}$/);
    var namaOrtuIndex = oldOrtuIdRow ? 22 : 21;
    var noHpOrtuIndex = oldOrtuIdRow ? 23 : 22;
    var konfirmasiIndex = oldOrtuIdRow ? 24 : 23;

    var sheetNisn =
      String(row[1]).trim();

    var tglCetak =
      formatTanggalCetak(row[5]);

    if (sheetNisn === targetNisn) {

      return {

        createdAt:
          formatSheetDateTime(row[0]),

        nisn: sheetNisn,

        no_hp:
          String(row[2]),

        nama:
          String(row[3]),

        asal:
          String(row[4]),

        hari:
          String(tglCetak),

        nomor:
          String(row[6]).padStart(3, '0'),

        tanggal:
          formatSheetDate(row[7]),

        loket:
          String(row[8]),

        sesi:
          String(row[9]),

        jurusan1:
          String(row[10]),

        jurusan2:
          String(row[11]),

        jenis_kelamin:
          String(row[12]),

        tgl_lahir:
          formatSheetDate(row[13]),

        nik:
          String(row[14]),

        agama:
          String(row[15]),

        tempat_lahir:
          String(row[16]),

        alamat:
          String(row[17]),

        email:
          String(row[18]),

        no_kk:
          String(row[19]),

        penerima_kip:
          String(row[20]),

        nama_ortu:
          String(row[namaOrtuIndex]),

        no_hp_ortu:
          String(row[noHpOrtuIndex]),

        konfirmasi:
          String(row[konfirmasiIndex])

      };

    }

  }

  return null;

}

// ==========================================
// DAFTAR ANTRIAN
// ==========================================

function daftarAntrian(formData) {

  try {

    var ss = getSS();

    var settingsSheet =
      ss.getSheetByName("Settings");

    var dataSheet =
      ss.getSheetByName("DataAntrian");

    if (!settingsSheet) {
      throw new Error(
        "Sheet Settings tidak ditemukan!"
      );
    }

    if (!dataSheet) {
      throw new Error(
        "Sheet DataAntrian tidak ditemukan!"
      );
    }

    var settings =
      settingsSheet.getDataRange().getValues();

    var tglSetting =
      new Date(settings[0][1]);

    var kuotaMaks =
      Number(settings[1][1]);

    var jmlOperator =
      Number(settings[2][1]);

    var data =
      getActiveSheetRows(dataSheet, 25);

    var nisnValue =
      normalizeNisnValue(formData.nisn);

    // ==================================
    // CEK NISN GANDA
    // ==================================

    for (var j = 0; j < data.length; j++) {
      var existingNisn = String(data[j][1] || "").replace(/^'/, "").trim();
      if (existingNisn === nisnValue) {
        throw new Error(
          "NISN " + nisnValue + " sudah terdaftar. Tidak boleh mendaftar 2 kali."
        );
      }
    }

    var sekarang =
      new Date();

    var targetDate =
      (sekarang > tglSetting)
        ? new Date(sekarang)
        : new Date(tglSetting);

    var nomorUrut = 1;

    var tglString = "";

    // ==================================
    // CEK KUOTA PER HARI
    // ==================================

    while (true) {

      // skip minggu
      if (targetDate.getDay() === 0) {

        targetDate.setDate(
          targetDate.getDate() + 1
        );

        continue;
      }

      tglString =
        targetDate.toDateString();

      var jumlahHariIni = 0;

      for (var i = 0; i < data.length; i++) {

        var rowTanggal = normalizeDateValue(data[i][7]);

        if (rowTanggal && rowTanggal.toDateString() === tglString) {
          jumlahHariIni++;
        }

      }

      if (jumlahHariIni < kuotaMaks) {

        nomorUrut =
          jumlahHariIni + 1;

        break;

      } else {

        targetDate.setDate(
          targetDate.getDate() + 1
        );

      }

    }

    // ==================================
    // LOKET OPERATOR
    // ==================================

    var indexOperator =
      ((nomorUrut - 1) % jmlOperator) + 1;

    var namaLoket =
      "OPERATOR " + indexOperator;

    // ==================================
    // PEMBAGIAN SESI
    // ==================================

    var sesi = "";

    if (nomorUrut <= 50) {

      sesi =
        "SESI 1 (07.30 - 09.00)";

    }
    else if (nomorUrut <= 100) {

      sesi =
        "SESI 2 (09.00 - 10.30)";

    }
    else if (nomorUrut <= 150) {

      sesi =
        "SESI 3 (10.30 - 12.00)";

    }
    else {

      sesi =
        "SESI 4 (13.00 - 14.30)";

    }

    // ==================================
    // FORMAT TANGGAL
    // ==================================

    var tglCetak =
      formatTanggalCetak(targetDate);

    // ==================================
    // FORMAT NOMOR ANTRIAN
    // ==================================

    var nomorFinal =
      String(nomorUrut).padStart(3, '0');

    // ==================================
    // SIMPAN DATABASE
    // ==================================

    var nisnValue =
      normalizeNisnValue(formData.nisn);

    var noHpValue =
      normalizePhoneValue(formData.no_hp);

    var noHpOrtuValue =
      normalizePhoneValue(formData.no_hp_ortu);

    var nikValue =
      normalizeSheetValue(formData.nik);

    var tempatLahirValue =
      normalizeSheetValue(formData.tempat_lahir);

    var noKkValue =
      normalizeSheetValue(formData.no_kk);

    var kipValue =
      normalizeSheetValue(formData.penerima_kip);

    dataSheet.appendRow([

      new Date(),

      "'" + nisnValue,

      "'" + noHpValue,

      formData.nama.toUpperCase(),

      formData.asal_sekolah.toUpperCase(),

      tglCetak,

      nomorFinal,

      tglString,

      namaLoket,

      sesi,

      formData.jurusan1.toUpperCase(),

      formData.jurusan2.toUpperCase(),

      formData.jenis_kelamin.toUpperCase(),

      formatSheetDate(formData.tgl_lahir),

      "'" + nikValue,

      formData.agama.toUpperCase(),

      tempatLahirValue.toUpperCase(),

      formData.alamat.toUpperCase(),

      formData.email.toLowerCase(),

      "'" + noKkValue,

      kipValue.toUpperCase(),

      formData.nama_ortu.toUpperCase(),

      "'" + noHpOrtuValue,

      formData.konfirmasi

    ]);

    // ==================================
    // KIRIM KE HTML
    // ==================================

    return {

      nama:
        formData.nama.toUpperCase(),

      nisn:
        nisnValue,

      no_hp:
        noHpValue,

      asal:
        formData.asal_sekolah.toUpperCase(),

      hari:
        tglCetak,

      nomor:
        nomorFinal,

      loket:
        namaLoket,

      sesi:
        sesi,

      jurusan1:
        formData.jurusan1.toUpperCase(),

      jurusan2:
        formData.jurusan2.toUpperCase(),

      jenis_kelamin:
        formData.jenis_kelamin.toUpperCase(),

      tgl_lahir:
        formatSheetDate(formData.tgl_lahir),

      nik:
        nikValue,

      agama:
        formData.agama.toUpperCase(),

      tempat_lahir:
        formData.tempat_lahir.toUpperCase(),

      alamat:
        formData.alamat.toUpperCase(),

      email:
        formData.email.toLowerCase(),

      no_kk:
        noKkValue,

      penerima_kip:
        kipValue.toUpperCase(),

      nama_ortu:
        formData.nama_ortu.toUpperCase(),

      no_hp_ortu:
        noHpOrtuValue,

      konfirmasi:
        formData.konfirmasi

    };

  }
  catch(err) {

    throw new Error(
      "Gagal membuat antrian : " +
      err.message
    );

  }

}

// ==========================================
// UPDATE BY NISN + NIK
// ==========================================

function updateByNISNandNIK(formData) {

  try {
    var ss = getSS();
    var dataSheet = ss.getSheetByName('DataAntrian');

    if (!dataSheet) {
      throw new Error('Sheet DataAntrian tidak ditemukan!');
    }

    var data = getActiveSheetRows(dataSheet, 25);

    var targetNisn = normalizeNisnValue(formData.nisn);
    var targetNik = normalizeSheetValue(formData.nik);

    var foundIndex = -1;

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var sheetNisn = normalizeNisnValue(row[1]);
      var sheetNik = normalizeSheetValue(row[14]);

      if (sheetNisn === targetNisn && sheetNik === targetNik) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      throw new Error('Data dengan NISN/NIK tersebut tidak ditemukan.');
    }

    var rowNumber = foundIndex + 2; // because getActiveSheetRows starts at row 2

    // normalize values to store
    var nisnValue = normalizeNisnValue(formData.nisn);
    var noHpValue = normalizePhoneValue(formData.no_hp);
    var noHpOrtuValue = normalizePhoneValue(formData.no_hp_ortu);
    var nikValue = normalizeSheetValue(formData.nik);
    var noKkValue = normalizeSheetValue(formData.no_kk);
    var kipValue = normalizeSheetValue(formData.penerima_kip);

    // update relevant columns (keep createdAt, nomor, tglCetak, loket, sesi unchanged)
    dataSheet.getRange(rowNumber, 3).setValue("'" + noHpValue); // column C
    dataSheet.getRange(rowNumber, 4).setValue(formData.nama.toUpperCase()); // D
    dataSheet.getRange(rowNumber, 5).setValue(formData.asal_sekolah.toUpperCase()); // E
    dataSheet.getRange(rowNumber, 11).setValue(formData.jurusan1.toUpperCase()); // K
    dataSheet.getRange(rowNumber, 12).setValue(formData.jurusan2.toUpperCase()); // L
    dataSheet.getRange(rowNumber, 13).setValue(formData.jenis_kelamin.toUpperCase()); // M
    dataSheet.getRange(rowNumber, 14).setValue(formatSheetDate(formData.tgl_lahir)); // N
    dataSheet.getRange(rowNumber, 15).setValue("'" + nikValue); // O
    dataSheet.getRange(rowNumber, 16).setValue(formData.agama.toUpperCase()); // P
    dataSheet.getRange(rowNumber, 17).setValue(formData.tempat_lahir.toUpperCase()); // Q
    dataSheet.getRange(rowNumber, 18).setValue(formData.alamat.toUpperCase()); // R
    dataSheet.getRange(rowNumber, 19).setValue(formData.email.toLowerCase()); // S
    dataSheet.getRange(rowNumber, 20).setValue("'" + noKkValue); // T
    dataSheet.getRange(rowNumber, 21).setValue(kipValue.toUpperCase()); // U
    dataSheet.getRange(rowNumber, 22).setValue(formData.nama_ortu.toUpperCase()); // V
    dataSheet.getRange(rowNumber, 23).setValue("'" + noHpOrtuValue); // W
    dataSheet.getRange(rowNumber, 24).setValue(formData.konfirmasi); // X

    // return updated record for client
    var updatedRow = dataSheet.getRange(rowNumber, 1, 1, 25).getValues()[0];

    var tglCetak = formatTanggalCetak(updatedRow[5]);

    return {
      createdAt: formatSheetDateTime(updatedRow[0]),
      nisn: String(updatedRow[1]).replace(/^'/, ""),
      no_hp: String(updatedRow[2]).replace(/^'/, ""),
      nama: String(updatedRow[3]),
      asal: String(updatedRow[4]),
      hari: tglCetak,
      nomor: String(updatedRow[6]).padStart(3, '0'),
      tanggal: formatSheetDate(updatedRow[7]),
      loket: String(updatedRow[8]),
      sesi: String(updatedRow[9]),
      jurusan1: String(updatedRow[10]),
      jurusan2: String(updatedRow[11]),
      jenis_kelamin: String(updatedRow[12]),
      tgl_lahir: formatSheetDate(updatedRow[13]),
      nik: String(updatedRow[14]).replace(/^'/, ""),
      agama: String(updatedRow[15]),
      tempat_lahir: String(updatedRow[16]),
      alamat: String(updatedRow[17]),
      email: String(updatedRow[18]),
      no_kk: String(updatedRow[19]).replace(/^'/, ""),
      penerima_kip: String(updatedRow[20]),
      nama_ortu: String(updatedRow[21]),
      no_hp_ortu: String(updatedRow[22]).replace(/^'/, ""),
      konfirmasi: String(updatedRow[23])
    };

  }
  catch (err) {
    throw new Error('Gagal memperbarui data: ' + err.message);
  }

}