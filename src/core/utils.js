export function isPageCrossed(addr1, addr2) {
  // A page is crossed when the high byte differs from addr1 to addr2
  return addr1 >> 8 != addr2 >> 8;
}

/**
 *  Helper method that appends a tile (8 bits) to `tileData`
 *  by reading & concatenating lowTileByte, highTileByte and attributeTableByte.
 */
export function readTile(
  tileData,
  attributeTableByte,
  lowTileByte,
  highTileByte,
  reversed,
  flush
) {
  var p1,
    p2 = 0;

  if (flush) {
    tileData.length = 0;
  }

  if (reversed === true) {
    for (var i = 0; i < 8; i++) {
      p1 = (lowTileByte & 1) << 0;
      p2 = (highTileByte & 1) << 1;
      lowTileByte = lowTileByte >> 1;
      highTileByte = highTileByte >> 1;

      tileData.push(attributeTableByte | p1 | p2);
    }
  } else {
    for (var i = 0; i < 8; i++) {
      p1 = (lowTileByte & 0x80) >> 7;
      p2 = (highTileByte & 0x80) >> 6;
      lowTileByte = lowTileByte << 1;
      highTileByte = highTileByte << 1;

      tileData.push(attributeTableByte | p1 | p2);
    }
  }
}
