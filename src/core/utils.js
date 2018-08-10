export function isPageCrossed(addr1, addr2) {
  // A page is crossed when the high byte differs from addr1 to addr2
  return addr1 >> 8 !== addr2 >> 8;
}
