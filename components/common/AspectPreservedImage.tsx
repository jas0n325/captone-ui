import * as lodash from "lodash";
import * as React from "react";
import { Image, ImageURISource, View, ViewStyle } from "react-native";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { getTestIdProperties } from "./utilities";


export const MINIMUM_WIDTH: number = 10;
export const MINIMUM_HEIGHT: number = 10;

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.common.AspectPreservedImage");

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface AspectPreservedImageProps {
  desiredSource: ImageURISource;
  rowWidth: number;
  rowHeight: number;
  defaultSource: ImageURISource;
  defaultSourceWidth: number;
  defaultSourceHeight: number;
  style?: ViewStyle;
  testID?: string;
}

export interface AspectPreservedImageState {
  actualDimensions: ImageDimensions;
  usingDesiredSource: boolean;
}

export class AspectPreservedImage extends React.Component<AspectPreservedImageProps, AspectPreservedImageState> {
  constructor(props: AspectPreservedImageProps) {
    super(props);

    this.state = {
      actualDimensions: undefined,
      usingDesiredSource: true
    };
  }

  public componentWillReceiveProps(nextProps: AspectPreservedImageProps): void {
    //
    // If the desiredSource image has changed try using the desired source image again.
    if (!lodash.isEqual(nextProps, this.props)) {
      this.setState({usingDesiredSource: true});
    }
  }

  public render(): JSX.Element {

    const imageSource: ImageURISource = this.establishImageSourceToRender();
    const imageStyle: ImageDimensions = this.establishImageDimensions();

    return imageSource && (
        <View style={this.props.style}>
          <Image
              {...getTestIdProperties(this.props.testID, "image")}
              source={imageSource}
              style={imageStyle}
              onLoad={this.onImageLoadSuccess.bind(this)}
              onError={this.onImageLoadError.bind(this)}
          />
        </View>
    ) || null;
  }

  private establishImageSourceToRender(): ImageURISource {
    let imageSource: ImageURISource;
    if (this.state.usingDesiredSource && this.props.desiredSource) {
      imageSource = this.props.desiredSource;
      // In iOS, images must be accessed via https, so convert the URL, if needed.
      if (imageSource && imageSource.uri && imageSource.uri.startsWith("http:")) {
        imageSource.uri = "https:" + imageSource.uri.substr(5);
      }
    } else {
      imageSource = this.props.defaultSource;
    }
    return imageSource;
  }

  private establishImageDimensions(): ImageDimensions {
    //
    // Establish the sizing for the image.
    // If we've established the actual width for the image, calculate and set a styling width and height for the
    // image scaled nicely within our maximum height.
    //
    // Begin by determining the maximum height, our given rowHeight if available
    const imageStyle: ImageDimensions = {
      width: MINIMUM_WIDTH,
      height: MINIMUM_HEIGHT
    };
    const maxHeight = this.props.rowHeight
        ? Math.max(this.props.rowHeight, MINIMUM_HEIGHT)
        : MINIMUM_HEIGHT;
    const maxWidth = this.props.rowWidth
        ? Math.max(this.props.rowWidth, MINIMUM_WIDTH)
        : MINIMUM_WIDTH;
    if (this.state.actualDimensions) {
      let adjustmentFactor: number;
      let candidateWidth: number;
      let candidateHeight: number;
      //
      // First, adjust use an adjustment factor that'll fit within our max height
      adjustmentFactor = maxHeight / this.state.actualDimensions.height;
      candidateWidth = Math.max(this.state.actualDimensions.width * adjustmentFactor, MINIMUM_WIDTH);
      candidateHeight = Math.max(this.state.actualDimensions.height * adjustmentFactor, MINIMUM_HEIGHT);
      //
      // If, after making that calculation, the image is too big to fit in our max width, adjust again, this time
      // based on width.
      if (candidateWidth > maxWidth) {
        adjustmentFactor = maxWidth / this.state.actualDimensions.width;
        candidateWidth = Math.max(this.state.actualDimensions.width * adjustmentFactor, MINIMUM_WIDTH);
        candidateHeight = Math.max(this.state.actualDimensions.height * adjustmentFactor, MINIMUM_HEIGHT);
      }
      imageStyle.width = candidateWidth;
      imageStyle.height = candidateHeight;
    }
    return imageStyle;
  }

  private onImageLoadSuccess(): void {
    //
    // Now that the image (desired or default) has been loaded, we'll gather it's actual dimensions and store
    // them in state.
    const imageSource: ImageURISource = (() => {
      return (this.state.usingDesiredSource ? this.props.desiredSource : this.props.defaultSource);
    })();
    //
    // Continue by finding the ACTUAL dimensions of the image being displayed
    if (imageSource && imageSource.uri) {
      //
      // The image being shown includes a URI it's a remote image -- we can use Image.getSize to get actual dimensions.
      this.getUriImageDimensions(imageSource);
    } else {
      //
      // Otherwise, it's a static local image and we're not using a version of React that supports
      // Image.resolveAssetSource, so we have no way to get its dimensions -- but we do require them to be provided
      // in our props for the defaultSource
      if (imageSource === this.props.defaultSource) {
        this.setState({
          actualDimensions: {
            width: this.props.defaultSourceWidth,
            height: this.props.defaultSourceHeight
          }
        });
      } else {
        this.setState({
          actualDimensions: {
            width: 1,
            height: 1
          }
        });
      }
    }
  }

  private getUriImageDimensions(aSource: ImageURISource): void {
    Image.getSize(aSource.uri,
        (srcWidth: number, srcHeight: number): void => {
          this.setState({
            actualDimensions: {
              width: srcWidth,
              height: srcHeight
            }
          });
        },
        (error: any): void => {
          logger.debug(`AspectPreservedImage.getUriImageDimensions error in Image.getSize: ${error}`);
        });
  }

  private onImageLoadError(error: any): void {
    if (this.state.usingDesiredSource) {
      logger.debug(`AspectPreservedImage.onImageLoadError Failed to load desired image, error: ${error}`);
    } else {
      logger.debug(`AspectPreservedImage.onImageLoadError Failed to load default image, error: ${error}`);
    }
    this.setState({usingDesiredSource: false});
  }
}
