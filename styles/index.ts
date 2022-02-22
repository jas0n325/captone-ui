import { withOptions } from "object-assign-deep";
import hash from "object-hash";
import { Dimensions, PixelRatio } from "react-native";
import * as Device from "react-native-device-detection";
import Orientation, { OrientationType } from "react-native-orientation-locker";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import loadPhoneStyles from "./phone/styles";
import { Styles } from "./styles";
import loadTabletStyles from "./tablet/styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.styles");

let isTablet = Device.isTablet;
let deviceHeight: number;
let deviceWidth: number;
let scalableWidth: number;
let scale: number;
let inScalableOrientation: boolean = true;

Orientation.addOrientationListener(orientationDidChange);
updateScale();

function orientationDidChange(orientation: OrientationType): void {
  inScalableOrientation = isStandardOrientation(orientation);
  logger.debug(
    () => `orientationDidChange -- incoming orientation: ${orientation}, inScalableOrientation ${inScalableOrientation}`
  );
}

function isStandardOrientation(orientation: OrientationType): boolean {
  switch (orientation) {
    case "LANDSCAPE-RIGHT":
    case "LANDSCAPE-LEFT":
      return isTablet;
    case "PORTRAIT":
    case "PORTRAIT-UPSIDEDOWN":
      return !isTablet;
    default:
      return false;
  }
}

/**
 * Returns true if scale was updated.
 */
function updateScale(): boolean {
  const newIsTablet = Device.isTablet;
  const newDeviceHeight = Dimensions.get("window").height;
  const newDeviceWidth = Dimensions.get("window").width;
  // Based on iphone 5s's scale (Portrait) and ipad mini scale (Landscape)
  // The 16:9 aspect ratio tablet devices are converted to 4:3 for scaling
  const newScalableWidth = newIsTablet ?
      ((newDeviceHeight / newDeviceWidth) > 0.6 ? newDeviceWidth : newDeviceWidth * 0.75) :
      newDeviceWidth;
  const newScale: number = newScalableWidth / (newIsTablet ? 1024 : 320);

  if (inScalableOrientation &&
      (isTablet !== newIsTablet || deviceHeight !== newDeviceHeight || deviceWidth !== newDeviceWidth)) {

    if (newIsTablet || newDeviceHeight >= newDeviceWidth || deviceHeight === undefined || deviceWidth === undefined) {
      if (!newIsTablet) {
        if (newDeviceHeight < newDeviceWidth) {
          logger.info(() => `updateScale -- New landscape mode dimensions for phone. These should have been skipped.`);
        } else if (deviceHeight < deviceWidth) {
          logger.info(() => `updateScale -- Old landscape mode dimensions for phone. These should have been skipped.`);
        }
      }
      logger.info(() => `updateScale -- Found new dimensions. ` +
          `The UI scale has ${newScale !== scale ? "" : "NOT "}been updated.\n` +
          `  old: isTablet: ${isTablet}, deviceHeight: ${deviceHeight}, ` +
          `deviceWidth: ${deviceWidth}, scalableWidth: ${scalableWidth}, scale: ${scale}\n` +
          `  new: isTablet: ${newIsTablet}, deviceHeight: ${newDeviceHeight}, ` +
          `deviceWidth: ${newDeviceWidth}, scalableWidth: ${newScalableWidth}, scale: ${newScale}`);
      if (newScale !== scale) {
        isTablet = newIsTablet;
        deviceHeight = newDeviceHeight;
        deviceWidth = newDeviceWidth;
        scalableWidth = newScalableWidth;
        scale = newScale;
        return true;
      }
    } else {
      logger.info(() => `updateScale -- Found new dimensions. ` +
          `Landscape mode dimensions for phone are skipped. The UI scale has NOT been updated.\n` +
          `  old: isTablet: ${isTablet}, deviceHeight: ${deviceHeight}, ` +
          `deviceWidth: ${deviceWidth}, scalableWidth: ${scalableWidth}, scale: ${scale}\n` +
          `  new: isTablet: ${newIsTablet}, deviceHeight: ${newDeviceHeight}, ` +
          `deviceWidth: ${newDeviceWidth}, scalableWidth: ${newScalableWidth}, scale: ${newScale}`);
    }
  }
  return false;
}

export default class Theme {
  public static isTablet: boolean = isTablet;
  public static styles: Styles = isTablet ? loadTabletStyles() : loadPhoneStyles();
  private static scalableStyle: string[] = [
    "fontSize",
    "height",
    "minHeight",
    "width",
    "minWidth",
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
    "margin",
    "marginLeft",
    "marginRight",
    "marginBottom",
    "marginTop",
    "marginHorizontal",
    "marginVertical",
    "padding",
    "paddingLeft",
    "paddingRight",
    "paddingBottom",
    "paddingTop",
    "paddingHorizontal",
    "paddingVertical"
  ];
  private static cacheStore: Map<string, any> = new Map<string, any>();

  public static createTheme(configuredStyles?: any): void {
    Theme.styles = isTablet ? loadTabletStyles(configuredStyles ? configuredStyles["tablet"] : undefined) :
        loadPhoneStyles(configuredStyles ? configuredStyles["phone"] : undefined);

    Theme.cacheStore = new Map<string, any>();
  }

  /**
   * Merge the target object with the given objects using a deep copy and creating a new object with the result of the
   * merge.
   *
   * @param target the target object.
   * @param objects the objects to merge with the target object.
   */
  public static merge(target: object, ...objects: object[]): object {
    return withOptions(Object.assign({}, target), objects);
  }

  /**
   * Create the styles using the given styles definitions.
   *
   * @param styles the styles definitions.
   */
  public static getStyles(styles: object): any {
    const hashValue = hash(styles);
    if (updateScale()) {
      Theme.cacheStore.clear();
      logger.info(() => `getStyles -- UI scale has been updated. Clearing style cache.`);
    }

    let values = Theme.cacheStore.get(hashValue);
    if (!values) {
      values = Theme.merge({}, styles);
      Object.keys(values).forEach((key) => Object.keys(values[key]).filter(
          (property) => Theme.scalableStyle.indexOf(property) > -1 && !isNaN(values[key][property])).forEach(
          (property) => values[key][property] =
              Math.round(PixelRatio.roundToNearestPixel(values[key][property] * scale))
      ));

      Theme.cacheStore.set(hashValue, values);
    }

    return values;
  }
}
