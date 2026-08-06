// ponytail: small self-check for the formatters, no framework overhead
import { fmtBytes, fmtEta, fmtRatio, fmtSpeed } from './format';

describe('format', () => {
  it('formats bytes', () => {
    expect(fmtBytes(38214204129)).toBe('35.6 GB');
    expect(fmtBytes(1363512524341)).toBe('1.24 TB');
    expect(fmtBytes(0)).toBe('0 B');
  });
  it('formats speed', () => {
    expect(fmtSpeed(86630)).toBe('84.6 KB/s');
    expect(fmtSpeed(0)).toBe('0 KB/s');
    expect(fmtSpeed(2621440)).toBe('2.5 MB/s');
  });
  it('formats ETA', () => {
    expect(fmtEta(374400)).toBe('4d 8h');
    expect(fmtEta(8640000)).toBe('∞');
    expect(fmtEta(300)).toBe('5m');
  });
  it('formats ratio', () => {
    expect(fmtRatio(0.55)).toBe('0.55');
  });
});
