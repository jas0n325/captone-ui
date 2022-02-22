import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import Theme from "../../styles";
import VectorIcon from "../common/VectorIcon";
import { ImageData } from "../tillManagement/PaidAddReceipt";
import { cameraStyle } from "./styles";

interface Props {
  removeImage: (uri: any) => void;
  previewImage: (uri: any) => void;
  item: ImageData;
  index: number;
}

class ImageThumbnail extends React.Component<Props> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(cameraStyle());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.imageArea}>
        <View>
          <Image source={{ uri: this.props.item.uri }} style={this.styles.image} resizeMode="contain" />
          <View style={this.styles.overlay}>
            <TouchableOpacity onPress={() => this.props.previewImage(this.props.item.uri)}>
              <View style={this.styles.searchIcon}>
                <VectorIcon
                  name={"Lens"}
                  fill={this.styles.searchIconStyle.color}
                  height={this.styles.searchIconStyle.height}
                  width={this.styles.searchIconStyle.width}
                  stroke={this.styles.searchIconStyle.backgroundColor}
                  strokeWidth={this.styles.searchIconStyle.fontSize} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={this.styles.textIconArea}>
          <Text style={this.styles.subtitleText}>{`Image_${this.props.index+1}`}</Text>
          <TouchableOpacity onPress={() => this.props.removeImage(this.props.item.uri)}
            style={this.styles.deleteIconArea}>
            <VectorIcon
              name={"Delete"}
              fill={this.styles.deleteIconStyle.color}
              height={this.styles.deleteIconStyle.height}
              width={this.styles.deleteIconStyle.width}
              stroke={this.styles.deleteIconStyle.backgroundColor}
              strokeWidth={this.styles.deleteIconStyle.fontSize} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default ImageThumbnail;
