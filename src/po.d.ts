declare module '*.po.js' {
  import type {LocaleData} from '@hebcal/hdate';
  const data: LocaleData;
  export default data;
}
