import * as React from "react";
import { Dimensions, ImageURISource, StyleProp, View, ViewStyle } from "react-native";

import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { AspectPreservedImage } from "./AspectPreservedImage";
import { imageViewerStyle } from "./styles";
import { establishImageSourceToRender } from "./utilities";


export interface Props {
  style?: StyleProp<ViewStyle>;
  height?: number;
  width?: number;
  image: string;
  settings: SettingsState;
}

export interface State {
}

const DefaultSize: number = 50;

export default class ImageViewer extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(imageViewerStyle());
  }

  public render(): JSX.Element {
    const { image } = this.props;
    const imageContainerSize: { width: number, height: number } = {
      width: this.props.width || Dimensions.get("window").width,
      height: this.props.height || Dimensions.get("window").height * 0.25
    };
    const style: StyleProp<ViewStyle> = this.props.style ? (Array.isArray(this.props.style) ? this.props.style :
        [this.props.style]) : [{}];
    return (
      <View style={[this.styles.imageViewer, ...style, { height: imageContainerSize.height }]}>
        <AspectPreservedImage rowWidth={imageContainerSize.width} rowHeight={imageContainerSize.height}
          desiredSource={this.getImageSource(image, imageContainerSize.width,
            imageContainerSize.height)}
          defaultSourceWidth={DefaultSize} defaultSourceHeight={DefaultSize}
          defaultSource={require("../../../../assets/img/no-image.png")} />
      </View>
    );
  }

  private getImageSource(url: string, defaultWidth: number, defaultHeight: number): ImageURISource {
    return establishImageSourceToRender(this.props.settings.configurationManager, defaultWidth, defaultHeight, url);
  }
}
