// ponytail: kleiner Selbstcheck für die deutschen Format-Helfer, kein Framework-Overhead
import { fmtBytes, fmtEta, fmtRatio, fmtSpeed } from './format';

describe('format', () => {
  it('formatiert Bytes mit deutschem Komma', () => {
    expect(fmtBytes(38214204129)).toBe('35,6 GB');
    expect(fmtBytes(1363512524341)).toBe('1,24 TB');
    expect(fmtBytes(0)).toBe('0 B');
  });
  it('formatiert Geschwindigkeit', () => {
    expect(fmtSpeed(86630)).toBe('84,6 KB/s');
    expect(fmtSpeed(0)).toBe('0 KB/s');
    expect(fmtSpeed(2621440)).toBe('2,5 MB/s');
  });
  it('formatiert ETA', () => {
    expect(fmtEta(374400)).toBe('4 T 8 Std');
    expect(fmtEta(8640000)).toBe('∞');
    expect(fmtEta(300)).toBe('5 Min');
  });
  it('formatiert Verhältnis', () => {
    expect(fmtRatio(0.55)).toBe('0,55');
  });
});
