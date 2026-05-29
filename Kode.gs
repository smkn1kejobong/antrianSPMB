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

  return String(value).replace(/^'/, "");

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

  var data =
    dataSheet.getDataRange().getValues();

  var hasil = [];

  for (var i = 1; i < data.length; i++) {

    var row = data[i];

    if (!row || row.length === 0) {
      continue;
    }

    if (row[0] === "" && row[1] === "" && row[2] === "" && row[3] === "") {
      continue;
    }

    hasil.push({

      createdAt:
        row[0],

      nisn:
        normalizeSheetValue(row[1]),

      no_hp:
        normalizeSheetValue(row[2]),

      nama:
        row[3],

      asal:
        row[4],

      hari:
        row[5],

      nomor:
        row[6],

      tanggal:
        row[7],

      loket:
        row[8],

      sesi:
        row[9]

    });

  }

  return hasil;

}

function searchAntrianByNISN(nisn) {

  var ss = getSS();

  var dataSheet =
    ss.getSheetByName("DataAntrian");

  if (!dataSheet) {
    throw new Error(
      "Sheet DataAntrian tidak ditemukan!"
    );
  }

  var targetNisn =
    String(nisn || "").replace(/\D/g, "");

  if (targetNisn === "") {
    throw new Error(
      "NISN wajib diisi!"
    );
  }

  var data =
    dataSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {

    var row = data[i];

    if (!row || row.length === 0) {
      continue;
    }

    if (normalizeSheetValue(row[1]).replace(/\D/g, "") === targetNisn) {
      return {

        createdAt:
          row[0],

        nisn:
          normalizeSheetValue(row[1]),

        no_hp:
          normalizeSheetValue(row[2]),

        nama:
          row[3],

        asal:
          row[4],

        hari:
          row[5],

        nomor:
          row[6],

        tanggal:
          row[7],

        loket:
          row[8],

        sesi:
          row[9]

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
      dataSheet.getDataRange().getValues();

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

      for (var i = 1; i < data.length; i++) {

        if (data[i][7] === tglString) {
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

    var hariIndo = [

      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu"

    ];

    var bulanIndo = [

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

    var tglCetak =

      hariIndo[targetDate.getDay()] +
      ", " +

      targetDate.getDate() +
      " " +

      bulanIndo[targetDate.getMonth()] +
      " " +

      targetDate.getFullYear();

    // ==================================
    // FORMAT NOMOR ANTRIAN
    // ==================================

    var nomorFinal =
      String(nomorUrut).padStart(3, '0');

    // ==================================
    // SIMPAN DATABASE
    // ==================================

    dataSheet.appendRow([

      new Date(),

      "'" + formData.nisn,

      "'" + formData.no_hp,

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
        formData.nisn,

      no_hp:
        formData.no_hp,

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