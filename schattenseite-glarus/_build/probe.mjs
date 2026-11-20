import { fromUrl } from 'geotiff';
const u = 'https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N46_00_E009_00_DEM/Copernicus_DSM_COG_10_N46_00_E009_00_DEM.tif';
const t = await fromUrl(u); const im = await t.getImage();
console.log(im.getWidth(), im.getHeight(), im.getOrigin(), im.getResolution(), im.getTileWidth(), im.getSampleFormat?.(), im.fileDirectory.GeoKeyDirectory?.slice(0,8), im.getGDALNoData());
const r = await im.readRasters({ window: [1900, 600, 1902, 602] }); console.log(r[0]);
