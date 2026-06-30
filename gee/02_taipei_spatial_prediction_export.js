// ======================================================

// UHI FEATURE EXTRACTION

// LANDSAT 8 + LANDSAT 9 + ERA5-LAND

// 30 m

// ======================================================





// ======================================================

// STUDY AREAS

// ======================================================



var cities = {



  Taipei: geometry,



  Hsinchu: geometry2,



  Taichung: geometry3,



  Kaohsiung: geometry4



};





// ======================================================

// YEARS

// ======================================================



var years = [



  2020,

  2023,

  2026



];





// ======================================================

// CLOUD MASK

// ======================================================



function maskLandsat(image){



  var qa = image.select('QA_PIXEL');



  var cloud = qa.bitwiseAnd(1 << 3).eq(0)



      .and(



          qa.bitwiseAnd(1 << 4).eq(0)



      );



  return image.updateMask(cloud);



}





// ======================================================

// SCALE FACTORS

// ======================================================



function applyScaleFactors(image){



  var optical = image.select('SR_B.*')



      .multiply(0.0000275)



      .add(-0.2);



  var thermal = image.select('ST_B10')



      .multiply(0.00341802)



      .add(149.0);



  return image



      .addBands(

          optical,

          null,

          true

      )



      .addBands(

          thermal,

          null,

          true

      );



}





// ======================================================

// LANDSAT INDICES

// ======================================================



function addIndices(image){



  var blue  = image.select('SR_B2');

  var green = image.select('SR_B3');

  var red   = image.select('SR_B4');

  var nir   = image.select('SR_B5');

  var swir1 = image.select('SR_B6');

  var swir2 = image.select('SR_B7');



  // ----------------------------------------------------

  // NDVI

  // ----------------------------------------------------



  var ndvi = nir.subtract(red)



      .divide(



          nir.add(red)



      )



      .rename('NDVI');



  // ----------------------------------------------------

  // EVI

  // ----------------------------------------------------



  var evi = image.expression(



      '2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',



      {



        NIR:nir,

        RED:red,

        BLUE:blue



      }



  ).rename('EVI');



  // ----------------------------------------------------

  // SAVI

  // ----------------------------------------------------



  var savi = image.expression(



      '((NIR-RED)/(NIR+RED+0.5))*1.5',



      {



        NIR:nir,

        RED:red



      }



  ).rename('SAVI');



  // ----------------------------------------------------

  // NDWI

  // ----------------------------------------------------



  var ndwi = green.subtract(nir)



      .divide(



          green.add(nir)



      )



      .rename('NDWI');



  // ----------------------------------------------------

  // MNDWI

  // ----------------------------------------------------



  var mndwi = green.subtract(swir1)



      .divide(



          green.add(swir1)



      )



      .rename('MNDWI');



  // ----------------------------------------------------

  // NDBI

  // ----------------------------------------------------



  var ndbi = swir1.subtract(nir)



      .divide(



          swir1.add(nir)



      )



      .rename('NDBI');



  // ----------------------------------------------------

  // BSI

  // ----------------------------------------------------



  var bsi = image.expression(



      '((SWIR1 + RED) - (NIR + BLUE)) / ((SWIR1 + RED) + (NIR + BLUE))',



      {



        SWIR1: swir1,

        RED:red,

        NIR:nir,

        BLUE:blue



      }



  ).rename('BSI');



  // ----------------------------------------------------

  // ALBEDO

  // ----------------------------------------------------



  var albedo = image.expression(



      '0.356*B + 0.130*R + 0.373*N + 0.085*S1 + 0.072*S2 - 0.0018',



      {



        B:blue,

        R:red,

        N:nir,

        S1:swir1,

        S2:swir2



      }



  ).rename('Albedo');



  return image.addBands([



      ndvi,

      evi,

      savi,

      ndwi,

      mndwi,

      ndbi,

      bsi,

      albedo



  ]);



}





// ======================================================

// ERA5 FEATURES

// ======================================================



function getERA5Features(year, region){



  var start = ee.Date.fromYMD(year,1,1);



  var end = ee.Date.fromYMD(year,12,31);



  var era5 = ee.ImageCollection(



      'ECMWF/ERA5_LAND/HOURLY'



  )



  .filterDate(start,end)



  .filterBounds(region);



  // ----------------------------------------------------

  // AIR TEMPERATURE

  // ----------------------------------------------------



  var temp = era5



      .select('temperature_2m')



      .mean()



      .subtract(273.15)



      .rename('AMB_TEMP');



  // ----------------------------------------------------

  // RELATIVE HUMIDITY

  // ----------------------------------------------------



  var tempK = era5



      .select('temperature_2m')



      .mean();



  var dewK = era5



      .select('dewpoint_temperature_2m')



      .mean();



  var rh = tempK.expression(



    '100 * (exp((17.625*(Td-273.15))/(243.04+(Td-273.15))) / exp((17.625*(T-273.15))/(243.04+(T-273.15))))',



    {

      Td: dewK,

      T: tempK

    }



  ).rename('RH');



  // ----------------------------------------------------

  // WIND SPEED

  // ----------------------------------------------------



  var u = era5



      .select('u_component_of_wind_10m')



      .mean();



  var v = era5



      .select('v_component_of_wind_10m')



      .mean();



  var wind = u.pow(2)



      .add(v.pow(2))



      .sqrt()



      .rename('WIND_SPEED');



  return ee.Image.cat([



      temp,

      rh,

      wind



  ]).clip(region);



}





// ======================================================

// COMPOSITE

// ======================================================



function getComposite(year, region){



  var start = ee.Date.fromYMD(



      year,

      1,

      1



  );



  var end = ee.Date.fromYMD(



      year,

      12,

      31



  );



  var l8 = ee.ImageCollection(



      'LANDSAT/LC08/C02/T1_L2'



  );



  var l9 = ee.ImageCollection(



      'LANDSAT/LC09/C02/T1_L2'



  );



  var landsat = l8.merge(l9)



      .filterBounds(region)



      .filterDate(start,end)



      .map(maskLandsat)



      .map(applyScaleFactors)



      .map(addIndices)



      .median()



      .clip(region);



  var era5 = getERA5Features(



      year,

      region



  );



  return landsat.addBands(



      era5



  );



}





// ======================================================

// EXPORT

// ======================================================



Object.keys(cities).forEach(function(city){



  var region = cities[city];



  years.forEach(function(year){



    var composite = getComposite(



        year,

        region



    );



    var output = composite.select([



      'AMB_TEMP',

      'RH',

      'WIND_SPEED',



      'Albedo',

      'BSI',

      'EVI',

      'MNDWI',

      'NDBI',

      'NDVI',

      'NDWI',

      'SAVI'



    ]);



    Export.image.toDrive({



      image: output,



      description:

        city + '_' + year + '_RF_Features',



      fileNamePrefix:

        city + '_' + year + '_RF_Features',



      folder:

        'Taiwan_UHI_RF_Features',



      region:

        region,



      scale: 30,



      maxPixels: 1e13,



      fileFormat: 'GeoTIFF'



    });



  });



});





// ======================================================

// DISPLAY

// ======================================================



Map.setOptions('HYBRID');



Map.centerObject(



    cities.Taipei,



    8



);



Map.addLayer(



    getComposite(2020, cities.Taipei)



      .select('Albedo'),



    {



      min:0,

      max:0.4



    },



    'Taipei Albedo 2020'



);



Map.addLayer(



    cities.Taipei,



    {



      color:'red'



    },



    'Taipei Boundary'



);