export interface Driver {
  select(locator: any, value: string): Promise<void>;
  selectCustomDropdown?(dropdown: any, optionValue: any): Promise<void>;
  type(locator: any, value: any): Promise<void>;
  hover?(locator: any): Promise<void>;
  click(locator: any): Promise<void>;
  doubleClick?(locator: any): Promise<void>;
  scrollToElement?(locator: any): Promise<void>;
  dialogAccept?(): Promise<void>;
  getSelectOptions?(locator: any): Promise<string[]>;
  goto(url: string): Promise<void>;
  refreshPage?(): Promise<void>;
  getCurrentUrl(): Promise<string>;
  getPageTitle?(): Promise<string>;
  handleDownload?(downloadButton: any, filePath: string): Promise<void>;
  handleUpload?(fileInputLocator: any, filePath: string): Promise<void>;

  // Assertions
  isVisible(locator: any): Promise<boolean>;
  isEnabled(locator: any): Promise<boolean>;
  getText(locator: any): Promise<string>;
  isChecked(locator: any): Promise<boolean>;
  getElementCount(locator: any): Promise<number>;
  verifyTableHeaders?(locator: any, expectedHeaders: any): Promise<boolean>;
  notVisible(locator: any): Promise<boolean>;
}