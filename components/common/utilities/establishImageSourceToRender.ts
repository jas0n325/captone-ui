import { ImageURISource } from "react-native";
import * as Device from "react-native-device-detection";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";


export const establishImageSourceToRender = (
  configurationManager: IConfigurationManager,
  imageWidth: number,
  imageHeight: number,
  imageUrl: string): ImageURISource => {
  //
  // Establish image source using configuration policy for line item image display
  const lineItemImageConfiguration = configurationManager.getFunctionalBehaviorValues().lineItemImage;

  switch (lineItemImageConfiguration.imageSource) {
    case "ImageFromItemData":
    case "ImageFromUrlPattern":
      //
      // In these cases we always want to display an image.  So, if the imageURL within the line item is empty
      // set it to our "default" image.  Otherwise, return the expected value.
      if (imageUrl && (imageUrl.length > 0)) {
        if (lineItemImageConfiguration.imageSource === "ImageFromUrlPattern") {
          //
          // Resolution Factor -- iOS devices with higher resolution need "2x" and/or "3x" images to keep images
          // clear when actually rendered on the device.  Requesting an image larger than we actually need
          // makes a larger network demand, so we only want to do this if we need to.  Hence, the detection
          // of iOS devices.
          let resolutionFactor: number = 1;
          if (Device.isIos) {
            resolutionFactor = 2;
          }
          imageUrl = imageUrl.replace(/{{width}}/g, `${imageWidth * resolutionFactor}`);
          imageUrl = imageUrl.replace(/{{height}}/g, `${imageHeight * resolutionFactor}`);
        }
        return { uri: imageUrl };
      } else {
        return require("../../../../../assets/img/no-image.png");
      }
    default:
      //
      // In this case we're not using images.
      return undefined;
  }
};
