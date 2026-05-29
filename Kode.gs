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

  var data = getActiveSheetRows(dataSheet, 10);

  var hasil = [];

  for (var i = 0; i < data.length; i++) {

    var row = data[i];

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
        String(row[6]),

      tanggal: tanggal,

      loket:
        String(row[8]),

      sesi:
        String(row[9])

    });

  }

  return hasil;

}

function searchAntrianByNISN(nisn) {

  var ss = getSS();

  var dataSheet =
    ss.getSheetByName("DataAntrian");

  var data = getActiveSheetRows(dataSheet, 10);

  var targetNisn =
    String(nisn).trim();

  for (var i = 0; i < data.length; i++) {

    var row = data[i];

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
          String(row[6]),

        tanggal:
          formatSheetDate(row[7]),

        loket:
          String(row[8]),

        sesi:
          String(row[9])

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
      getActiveSheetRows(dataSheet, 10);

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

      sesi

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
        sesi

    };

  }
  catch(err) {

    throw new Error(
      "Gagal membuat antrian : " +
      err.message
    );

  }

}