import { promises as fs } from 'fs';

const mainPath = `./themes/Berba-color-theme.json`;
const comparisonPath = `./misc/comparison-theme.json`;
const lineCommentsRegEx = /(.*)(\/\/.*)/g;

const processTheme = async function(themePath: string) {
  console.log(`----------------------
${themePath}
----------------------`);
  
  let file = await fs.readFile(themePath);
  let fileContent = file.toString('utf-8').replace(lineCommentsRegEx, '$1');
  let theme = JSON.parse(fileContent);
  
  let colorMap: {[key: string]: ColorUsageList} = { };
  let uniqueColors = 0;
  
  for (let key in theme.colors) {
    let color: string = theme.colors[key].toLowerCase();
    let opaqueColor = color.substring(0, 7);
    if (! colorMap[opaqueColor]) {
      uniqueColors ++;
      colorMap[opaqueColor] = new ColorUsageList(opaqueColor);
    }
    colorMap[opaqueColor].addBasicUsage(key, color);
  }
  
  for (let item of theme.tokenColors) {
    let color: string = item.settings.foreground?.toLowerCase();
    if (! color) continue;
    let opaqueColor = color.substring(0, 7);
    if (! colorMap[opaqueColor]) {
      uniqueColors ++;
      colorMap[opaqueColor] = new ColorUsageList(opaqueColor);
    }
    colorMap[opaqueColor].addTokenUsage(item);
  }
  
  let colorList = Object.keys(colorMap);
  colorList.sort((a, b) => {
    return colorMap[a].count < colorMap[b].count ? 1 : -1;
  });
  console.log('Unique colors:', uniqueColors);
  for (let color of colorList) {
    colorMap[color].sortUsages();
    colorMap[color].logDescription();
  }
};

class ColorUsageList {
  
  private basicUsages: [string, string][] = [];
  private tokenUsages: any[] = [];
  
  constructor(public opaqueColor: string) { }
  
  addBasicUsage(key: string, value: string): void {
    this.basicUsages.push([key, value]);
  }
  
  addTokenUsage(tokenBlock: any): void {
    this.tokenUsages.push(tokenBlock);
  }
  
  sortUsages(): void {
    this.basicUsages.sort((a, b) => {
      return a[0] < b[0] ? -1 : 1;
    });
  }
  
  logDescription(): void {
    console.log(`\n"${this.opaqueColor}" (${this.count}):`);
    if (this.basicUsages.length) {
      for (let usage of this.basicUsages) {
        console.log(`"${usage[0]}":, "${usage[1]}",`);
      }
    }
    if (this.tokenUsages.length) {
      console.log(JSON.stringify(this.tokenUsages, null, '  '));
    }
  }
  
  get count(): number {
    return this.basicUsages.length + this.tokenUsages.length;
  }
  
}


(async function() {
  await processTheme(mainPath);
  await processTheme(comparisonPath);
})();
