// ======================================================
// UHI FEATURE EXTRACTION
// LANDSAT 8 + LANDSAT 9
// 2025 - 2026
// ======================================================


// ======================================================
// 1. STATIONS
// ======================================================

var stations = [

["Keelung",121.760056,25.129167],
["Xizhi",121.642300,25.067131],
["Xindian",121.537778,24.977222],
["Tucheng",121.451861,24.982528],
["Banqiao",121.458667,25.012972],
["Xinzhuang",121.432500,25.037972],
["Cailiao",121.481028,25.068950],
["Linkou",121.376869,25.077197],
["Tamsui",121.449239,25.164500],
["Shilin",121.516664,25.103340],
["Zhongshan",121.526528,25.062361],
["Wanhua",121.507972,25.046503],
["Guting",121.529556,25.020608],
["Songshan",121.578611,25.050000],
["Datong",121.513311,25.063200],

["Taoyuan",121.308722,24.986778],
["Dayuan",121.201811,25.060344],
["Guanyin",121.082761,25.035503],
["Pingzhen",121.203986,24.952786],
["Longtan",121.216350,24.863869],
["Hukou",121.038653,24.900142],
["Zhudong",121.088903,24.740644],
["Hsinchu",120.972075,24.805619],
["Toufen",120.898572,24.696969],

["Miaoli",120.820200,24.565269],
["Sanyi",120.758833,24.382942],
["Fengyuan",120.741711,24.256586],
["Shalu",120.568794,24.225628],
["Dali",120.678444,24.099611],
["Zhongming",120.641092,24.151958],
["Xitun",120.616917,24.162197],
["Changhua",120.541519,24.066000],
["Xianxi",120.469061,24.131672],
["Erlin",120.409653,23.925175],

["Nantou",120.685306,23.913000],
["Douliu",120.544994,23.711853],
["Lunbei",120.348742,23.757547],
["Xingang",120.345531,23.554839],
["Puzi",120.247811,23.467122],
["Taixi",120.199333,23.702175],
["Chiayi",120.440833,23.462778],
["Xinying",120.317250,23.305633],
["Shanhua",120.297142,23.115097],
["Annan",120.217500,23.048197],

["Tainan",120.202617,22.984581],
["Meinong",120.530542,22.883583],
["Qiaotou",120.305689,22.757506],
["Renwu",120.332631,22.689056],
["Fengshan",120.358083,22.627392],
["Daliao",120.425311,22.564136],
["Linyuan",120.411750,22.479500],
["Nanzi",120.328289,22.733667],
["Zuoying",120.292917,22.674861],
["Qianjin",120.286761,22.633903],

["Qianzhen",120.307564,22.605386],
["Xiaogang",120.337736,22.565833],
["Pingtung",120.488033,22.673081],
["Chaozhou",120.561175,22.523108],
["Hengchun",120.788928,21.958069],
["Taitung",121.150450,22.755358],
["Hualien",121.599769,23.971306],
["Yangming",121.529583,25.182722],
["Yilan",121.746394,24.747917],
["Dongshan",121.792928,24.632203],

["Sanchong",121.493806,25.072611],
["Zhongli",121.221667,24.953278],
["Zhushan",120.677306,23.756389],
["Yonghe",121.516306,25.017000],
["Fuxing",120.312017,22.608711],
["Puli",120.967903,23.968842],

["Matsu",120.591281,26.257996],
["Kinmen",118.312256,24.432133],
["Magong",119.566158,23.569031],

["Guanshan",121.161933,23.045083],
["Mailiao",120.251825,23.753506],
["FugueiCape",121.547380,25.292280],
["Dacheng",120.269642,23.854931]

];

var fc = ee.FeatureCollection(

  stations.map(function(st){

    return ee.Feature(

      ee.Geometry.Point([st[1], st[2]]),

      {
        sitename: st[0],
        lon: st[1],
        lat: st[2]
      }

    );

  })

);

Map.centerObject(fc, 7);
Map.addLayer(fc, {color:'red'}, 'Stations');


// ======================================================
// 2. LANDSAT 8 + LANDSAT 9
// ======================================================

var landsat = ee.ImageCollection(
    'LANDSAT/LC08/C02/T1_L2'
  )
  .merge(
    ee.ImageCollection(
      'LANDSAT/LC09/C02/T1_L2'
    )
  )
  .filterDate(
    '2025-01-01',
    '2026-12-31'
  )
  .filterBounds(fc)
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );

print(
  'Landsat Count:',
  landsat.size()
);


// ======================================================
// 3. CLOUD MASK
// ======================================================

function maskL8(img){

  var qa = img.select('QA_PIXEL');

  var mask = qa.bitwiseAnd(1 << 3).eq(0)
      .and(
        qa.bitwiseAnd(1 << 4).eq(0)
      );

  return img.updateMask(mask);

}


// ======================================================
// 4. ADD INDICES
// ======================================================

function addIndices(img){

  var blue = img.select('SR_B2')
      .multiply(0.0000275)
      .add(-0.2);

  var green = img.select('SR_B3')
      .multiply(0.0000275)
      .add(-0.2);

  var red = img.select('SR_B4')
      .multiply(0.0000275)
      .add(-0.2);

  var nir = img.select('SR_B5')
      .multiply(0.0000275)
      .add(-0.2);

  var swir1 = img.select('SR_B6')
      .multiply(0.0000275)
      .add(-0.2);

  var swir2 = img.select('SR_B7')
      .multiply(0.0000275)
      .add(-0.2);

  // ====================================================
  // NDVI
  // ====================================================

  var ndvi = nir.subtract(red)
      .divide(
        nir.add(red)
      )
      .rename('NDVI');

  // ====================================================
  // NDBI
  // ====================================================

  var ndbi = swir1.subtract(nir)
      .divide(
        swir1.add(nir)
      )
      .rename('NDBI');

  // ====================================================
  // NDWI
  // ====================================================

  var ndwi = green.subtract(nir)
      .divide(
        green.add(nir)
      )
      .rename('NDWI');

  // ====================================================
  // MNDWI
  // ====================================================

  var mndwi = green.subtract(swir1)
      .divide(
        green.add(swir1)
      )
      .rename('MNDWI');

  // ====================================================
  // SAVI
  // ====================================================

  var savi = nir.subtract(red)
      .multiply(1.5)
      .divide(
        nir.add(red).add(0.5)
      )
      .rename('SAVI');

  // ====================================================
  // EVI
  // ====================================================

  var evi = nir.subtract(red)
      .multiply(2.5)
      .divide(
        nir
          .add(
            red.multiply(6)
          )
          .subtract(
            blue.multiply(7.5)
          )
          .add(1)
      )
      .rename('EVI');

  // ====================================================
  // BSI
  // ====================================================

  var bsi = swir1
      .add(red)
      .subtract(
        nir.add(blue)
      )
      .divide(
        swir1
          .add(red)
          .add(
            nir.add(blue)
          )
      )
      .rename('BSI');

  // ====================================================
  // ALBEDO
  // ====================================================

  var albedo = img.expression(

    '(0.356*B)+(0.130*R)+(0.373*N)+(0.085*S1)+(0.072*S2)-0.0018',

    {
      B: blue,
      R: red,
      N: nir,
      S1: swir1,
      S2: swir2
    }

  ).rename('Albedo');


  // ====================================================
  // LST
  // ====================================================

  var lst = img.select('ST_B10')
      .multiply(0.00341802)
      .add(149.0)
      .subtract(273.15)
      .rename('LST_C');


  return img.addBands([

      ndvi,
      ndbi,
      ndwi,
      mndwi,
      bsi,
      evi,
      savi,
      albedo,
      lst

  ])
  .copyProperties(
      img,
      ['system:time_start']
  );

}


// ======================================================
// 5. PROCESS
// ======================================================

var processed = landsat
  .map(maskL8)
  .map(addIndices);

print(
  'Processed Count:',
  processed.size()
);


// ======================================================
// 6. EXTRACT
// ======================================================

var extracted = processed.map(function(image){

  var date = image.date()
      .format('YYYY-MM-dd');

  var sampled = image.sampleRegions({

    collection: fc,

    properties: [

      'sitename',
      'lon',
      'lat'

    ],

    scale: 30,

    geometries: false

  });

  sampled = sampled.map(function(f){

    return f.set({

      image_date: date,

      image_id: image.id(),

      year: image.date().get('year'),

      month: image.date().get('month')

    });

  });

  return sampled;

}).flatten();


// ======================================================
// 7. CHECK
// ======================================================

print(
  'Extracted Samples:',
  extracted.limit(10)
);

print(
  'Total Samples:',
  extracted.size()
);


// ======================================================
// 8. EXPORT
// ======================================================

Export.table.toDrive({

  collection: extracted,

  description:
    'Taiwan_UHI_Landsat89_2025_2026',

  folder:
    'GEE_UHI',

  fileNamePrefix:
    'Taiwan_UHI_Landsat89_2025_2026',

  fileFormat:
    'CSV'

});